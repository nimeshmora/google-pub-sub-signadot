const { pubSubClient } = require('./pubsubClient.js');
const { sandboxName, pubsubTopic } = require('./../../../config/config.js');
const groupId = 'pubsub-grp';

// This sets the consumer group with suffix '-' + <sandbox-name> if running in
// sandboxed workload, otherwise, it just returns the argument.
function signadotConsumerGroup(sGroupId) {
    
    if (sandboxName !== "") {
        sGroupId += '-' + sandboxName
    }
    return sGroupId
}

async function initializePubSubResources(routerKeys, callback) { // wrapper
    let subscriptionName = signadotConsumerGroup(groupId);
    subscriptionName += routerKeys.map(x => `-${x}`).join('-')
    
    // Step 1: Create the topic if it doesn't exist
    try {
        await pubSubClient.topic(pubsubTopic).get({ autoCreate: true });
        console.log(`Topic '${pubsubTopic}' is ready.`);
    } catch (error) {
        console.error(`Error creating topic '${pubsubTopic}':`, error);
    }

    // Step 2: Create the subscription if it doesn't exist
    try {
        const [sub] = await pubSubClient.topic(pubsubTopic).getSubscriptions();
        const subscriptionExists = sub.some(s => s.name.split('/').pop() === subscriptionName);
        let subscription;
        if (!subscriptionExists) {
            [subscription] = await pubSubClient.createSubscription(pubsubTopic, subscriptionName, {
                filter: routerKeys.length <= 0 ? `attributes.kind="baseline"` : routerKeys.map(x => `attributes.kind="${x}"`).join(' OR '),
                enableExactlyOnceDelivery: true,
                ackDeadlineSeconds: 300,
                retryPolicy: {
                    minimumBackoff: {
                        seconds: 2
                    },
                    maximumBackoff: {
                        seconds: 120
                    }
                }          
            })
            .catch(ex => {
                console.log(ex);                
            })
            
        }
        else{
            // Fetch the existing subscription
            subscription = pubSubClient.subscription(subscriptionName);
            console.log(`Listening to existing subscription: ${subscription.name}`);
        }

        if (subscription) {
            // Set up message listener
            subscription.on('message', callback);
    
            // Set up error listener
            subscription.on('error', (error) => {
                console.error(`Subscription error: ${error.message}`);
            });
    
            console.log(`Subscription '${subscriptionName}' is now active.`);
        }
    } catch (error) {
        console.error(`Error creating subscription '${subscriptionName}':`, error);
    }
}

// Function to publish messages to a Pub/Sub topic
const publishMessages = async (topicName, message, headers, routingKey) => {
    try {
        let noRtKey = routingKey === undefined || routingKey === null;
        const dataBuffer = Buffer.from(JSON.stringify({
            value: JSON.stringify(message),
            headers: headers || {}, // Include headers if provided, or an empty object
        }));

        // Publish a message to the specified topic with attributes
        await pubSubClient.topic(topicName).publishMessage({
            data: dataBuffer,
            attributes: {
                kind: `${(noRtKey && sandboxName === "") || (!noRtKey && sandboxName !== "")? 'baseline' : routingKey}`
            }
        });
        
    } catch (error) {
        console.error(`Error publishing message to topic ${topicName}:`, error);
    }
};

// Function to process messages received from Pub/Sub
// const consumeMessages = async (topicName, onNewMessage) => {
//     try {
//         // Ensure the topic exists
//         const topic = pubSubClient.topic(topicName);
//         const [subscriptions] = await topic.getSubscriptions();
                
//         if (subscriptions.length === 0) {
//             console.warn(`No subscriptions found for topic: ${topicName}`);
//             return;
//         }

//         // Iterate through all subscriptions and attach message listeners
//         subscriptions.forEach(subscription => {
//             console.log(`Listening to subscription: ${subscription.name}`);

//             // Event listener for incoming messages
//             subscription.on('message', );

//             // Event listener for subscription errors
//             subscription.on('error', error => {
//                 console.error(`Error in subscription ${subscription.name}:`, error);
//             });
//         });
//     } catch (error) {
//         console.error(`Error setting up listeners for topic ${topicName}:`, error);
//     }
// };

module.exports = {
    initializePubSubResources: initializePubSubResources,
    signadotConsumerGroup: groupId,
    publishMessages: publishMessages
}
