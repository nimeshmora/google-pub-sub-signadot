const { pubsubTopic } = require('../../../config/config.js');
const { extractRoutingKey } = require('../../modules/otel/baggage.js');
const { registerEvent } = require('../../modules/events/events.js');
const { initializePubSubResources } = require('../../modules/pubsub/pubsub.js')
const { consumeMessages } = require('../../modules/pubsub/pubsub.js');
const { run, shouldProcess } = require('../../modules/routesapi-mq-client/pullrouter.js')

async function runConsumer() {       
    // start the router
    run();
    await initializePubSubResources();

    consumeMessages(pubsubTopic, (msg, headers) => {
        let baggage = "";
        if (headers['baggage'] !== undefined) {
            baggage = headers['baggage'].toString();
        }
        let routingKey = extractRoutingKey(baggage);

        if (!shouldProcess(routingKey)) {
            // skip this message
            return
        }        
        
        registerEvent('Consumed message from pubsub  (topic=' + pubsubTopic + ')', msg, extractRoutingKey(baggage),
            () => { },
            (error) => console.error(error)
        )
    });
}

module.exports = runConsumer;