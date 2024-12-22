const { kafkaTopic } = require('../../../config/config.js');
const { consumeMessages } = require('../../modules/kafka/kafka.js')
const { extractRoutingKey } = require('../../modules/otel/baggage.js');
const { registerEvent } = require('../../modules/events/events.js');
const { initializePubSubResources } = require('../../modules/pubsub/pubsub.js')
const { consumeMessagesPb } = require('../../modules/pubsub/pubsub.js');
const { run, shouldProcess } = require('../../modules/routesapi-mq-client/pullrouter.js')

async function runConsumer() {       
    // start the router
    run();
    await initializePubSubResources();

    // consume messages from the queue
    // consumeMessages(kafkaTopic, (msg, headers) => {
    //     let baggage = "";
    //     if (headers['baggage'] !== undefined) {
    //         baggage = headers['baggage'].toString();
    //     }
    //     let routingKey = extractRoutingKey(baggage);

    //     console.log("debug kafka", msg);

    //     if (!shouldProcess(routingKey)) {
    //         // skip this message
    //         return
    //     }
        
        
    //     // registerEvent('Consumed message from kafka  (topic=' + kafkaTopic + ')', msg, extractRoutingKey(baggage),
    //     //     () => { },
    //     //     (error) => console.error(error)
    //     // )
    // })
    // .catch((error) => console.error(`Error in consumer: ${error.message}`));

    consumeMessagesPb(kafkaTopic, (msg, headers) => {
        let baggage = "";
        if (headers['baggage'] !== undefined) {
            baggage = headers['baggage'].toString();
        }
        let routingKey = extractRoutingKey(baggage);

        console.log("debug pubsub", msg);

        if (!shouldProcess(routingKey)) {
            // skip this message
            return
        }        
        
        registerEvent('Consumed message from pubsub  (topic=' + kafkaTopic + ')', msg, extractRoutingKey(baggage),
            () => { },
            (error) => console.error(error)
        )
    });
}

module.exports = runConsumer;