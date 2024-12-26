const { pubsubTopic } = require('../../../config/config.js');
const { extractRoutingKey } = require('../../modules/otel/baggage.js');
const { registerEvent } = require('../../modules/events/events.js');
const { initializePubSubResources } = require('../../modules/pubsub/pubsub.js')
const { run, shouldProcess, getRoutingKeys, setExistingListeners } = require('../../modules/routesapi-mq-client/pullrouter.js')
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

function callbackListener(message) {
    try {
        let data = Buffer.from(message.data);                                                            
        data = JSON.parse(data);
        console.log(`Received message from pubsub subscription:`, JSON.stringify(data));

        // Acknowledge the message
        message.ack();

        // Process the message
        consumerListener(JSON.parse(data.value), data.headers);

        
    } catch (error) {
        message.nack();
        console.error(`Error processing message from subscription:`, error);
    }
}

async function runConsumer() {       
    // start the router
    run();
    if(sandboxName !== ""){
        setInterval(async () => {           
            let routingKeys = getRoutingKeys('routingKeys');
            let existingRoutingKeys = getRoutingKeys('existRouterKeys');         
            let newKeys = routingKeys.filter(item => !existingRoutingKeys.includes(item));
            setExistingListeners(routingKeys);
            if(newKeys.length > 0){
                await initializePubSubResources(newKeys, callbackListener);
            }            
        }, 3000);
    }else{
        await initializePubSubResources([], callbackListener);
    }    
}

module.exports = runConsumer;