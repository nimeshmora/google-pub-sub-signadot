const { pubSubClient } = require('./pubsubClient.js');
const { sandboxName, pubsubTopic } = require('./../../../config/config.js');
const groupId = 'pubsub-signadot-group';

// This sets the consumer group with suffix '-' + <sandbox-name> if running in
// sandboxed workload, otherwise, it just returns the argument.
function signadotConsumerGroup(signGroupId) {
    // if (sandboxName !== "") {
    //     signGroupId += signGroupId
    // }
    return signGroupId
}   

async function initializePubSubResources() { // wrapper

    const subscriptionName = signadotConsumerGroup(groupId);

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
        
        if (!subscriptionExists) {
            await pubSubClient.createSubscription(pubsubTopic, subscriptionName, {
                enableExactlyOnceDelivery: true,
                retryPolicy: {
                    minimumBackoff: {
                        seconds: 60
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

        console.log(`Subscription '${subscriptionName}' is ready.`);
    } catch (error) {
        console.error(`Error creating subscription '${subscriptionName}':`, error);
    }
}

// Function to publish messages to a Pub/Sub topic
const publishMessages = async (topicName, message, headers) => {
    try {

        const dataBuffer = Buffer.from(JSON.stringify({
            value: JSON.stringify(message),
            headers: headers || {}, // Include headers if provided, or an empty object
        }));

        // Publish a message to the specified topic with attributes
        const messageId = await pubSubClient.topic(topicName).publishMessage({
            data: dataBuffer
        });
        
    } catch (error) {
        console.error(`Error publishing message to topic ${topicName}:`, error);
    }
};

// Function to process messages received from Pub/Sub
const consumeMessages = async (topicName, onNewMessage) => {
    try {
        // Ensure the topic exists
        const topic = pubSubClient.topic(topicName);
        const [subscriptions] = await topic.getSubscriptions();
                
        if (subscriptions.length === 0) {
            console.warn(`No subscriptions found for topic: ${topicName}`);
            return;
        }

        // Iterate through all subscriptions and attach message listeners
        subscriptions.forEach(subscription => {
            console.log(`Listening to subscription: ${subscription.name}`);

            // Event listener for incoming messages
            subscription.on('message', message => {
                try {
                    let data = Buffer.from(message.data);                                                            
                    data = JSON.parse(data);
                    console.log(`Received message from pubsub subscription ${subscription.name}:`, JSON.stringify(data));

                    // Acknowledge the message
                    message.ack();

                    // Process the message
                    onNewMessage(JSON.parse(data.value), data.headers);

                    
                } catch (error) {
                    message.nack();
                    console.error(`Error processing message from subscription ${subscription.name}:`, error);
                }
            });

            // Event listener for subscription errors
            subscription.on('error', error => {
                console.error(`Error in subscription ${subscription.name}:`, error);
            });
        });
    } catch (error) {
        console.error(`Error setting up listeners for topic ${topicName}:`, error);
    }
};

module.exports = {
    initializePubSubResources: initializePubSubResources,
    signadotConsumerGroup: signadotConsumerGroup,
    publishMessages: publishMessages,
    consumeMessages: consumeMessages
}
