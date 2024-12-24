const { pubsubTopic } = require('../../../config/config.js');
const { extractRoutingKey } = require('../../modules/otel/baggage.js');
const { registerEvent } = require('../../modules/events/events.js');
const { initializePubSubResources, consumeMessages } = require('../../modules/pubsub/pubsub.js')
const { run, shouldProcess, getRoutingKeys } = require('../../modules/routesapi-mq-client/pullrouter.js')
const { sandboxName } = require('../../../config/config.js');

const consumerListener = (msg, headers) => {
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
}

async function runConsumer() {       
    // start the router
    run();
    if(sandboxName !== ""){ 
        let keyLength = 0;
        setInterval(async () => {           
            let routingKeys = getRoutingKeys();
            if(keyLength !== routingKeys.length){
                await initializePubSubResources(routingKeys);
                consumeMessages(pubsubTopic, consumerListener);
            }
            keyLength = routingKeys.length;
        }, 2000);
    }else{
        await initializePubSubResources([]);
        consumeMessages(pubsubTopic, consumerListener);
    }    
}

module.exports = runConsumer;