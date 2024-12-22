const { pubSubClient } = require('../pubsub/pubsubConf.js');
const consumerConf = require('../pubsub/consumerConf.js')
const { sandboxName } = require('./../../../config/config.js');

// This sets the subscription name with a suffix '-' + <sandbox-name> if running in
// sandboxed workload, otherwise, it just returns the argument.
function signadotSubscriptionName(subscriptionName) {
    if (sandboxName !== "") {
        subscriptionName += '-' + sandboxName;
    }
    return subscriptionName;
}

const ensureTopicExists = async (topicName) => {
    try {
        const [topics] = await pubSubClient.getTopics();
        const topicNames = topics.map(t => t.name.split('/').pop());
        
        if (!topicNames.includes(topicName)) {
            console.log(`Creating topic: ${topicName}`);
            await pubSubClient.createTopic(topicName);
        } else {
            console.log(`Topic ${topicName} already exists`);
        }
    } catch (error) {
        console.error(`Error ensuring topic exists: ${error.message}`);
        throw error;
    }
};

// Function to publish messages to a Pub/Sub topic
const publishMessagePub = async (topicName, message, attributes) => {
    try {
        console.log("publishMessagePub", topicName, message, attributes);
        
        await ensureTopicExists(topicName);
        const dataBuffer = Buffer.from(JSON.stringify(message));

        // Publish a message to the specified topic with attributes
        const messageId = await pubSubClient.topic(topicName).publishMessage({
            data: dataBuffer,
            attributes: attributes || {}, // Include attributes if provided, or an empty object
        });
        console.log(`Message ${messageId} published to topic ${topicName}`);
    } catch (error) {
        console.error(`Error publishing message to topic ${topicName}:`, error);
    }
};

// Function to process messages received from Pub/Sub
const consumeMessagesPb = async (topicName, onNewMessage) => {
    try {
        // Ensure the topic exists
        const topic = pubSubClient.topic(topicName);
        const [subscriptions] = await topic.getSubscriptions();

        if (subscriptions.length === 0) {
            console.warn(`No subscriptions found for topic: ${topicName}`);
            return;
        }

        console.log(`Found ${subscriptions.length} subscriptions for topic: ${topicName}`);

        // Iterate through all subscriptions and attach message listeners
        subscriptions.forEach(subscription => {
            console.log(`Listening to subscription: ${subscription.name}`);

            // Event listener for incoming messages
            subscription.on('message', message => {
                try {
                    const data = JSON.parse(message.data.toString());
                    console.log(`Received message from subscription ${subscription.name}:`, data);

                    // Process the message
                    onNewMessage(data, message.attributes);

                    // Acknowledge the message
                    message.ack();
                } catch (error) {
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

const createNewConsumner = async (topicName, subscriptionName) => {
    try {
        let subscriptionId = signadotSubscriptionName(subscriptionName);

        // Ensure the topic exists (throws an error if it doesn't)
        const [topics] = await pubSubClient.getTopics();
        
        const topicExists = topics.some(t => t.name.split('/').pop() === topicName);
        
        if (!topicExists) {
            throw new Error(`Topic ${topicName} does not exist`);
        }

        const topic = pubSubClient.topic(topicName);

        subscriptionId = 'A'+subscriptionId;

        // Check if the subscription exists
        const [subscriptions] = await topic.getSubscriptions();
        const subscriptionExists = subscriptions.some(s => s.name.split('/').pop() === subscriptionId);

        if (!subscriptionExists) {
            console.log(`Creating subscription: ${subscriptionId} for topic: ${topicName}`);
            // await topic.createSubscription(subscriptionId, { filter: `attributes.baggage="${subscriptionName}"`});
            await pubSubClient.createSubscription(topicName, subscriptionId, { ...consumerConf, filter: `attributes.baggage="${subscriptionName}"`})
                .catch(err => console.error('Error creating subcriber:', err))
        } else {
            console.log(`Subscription ${subscriptionId} already exists for topic: ${topicName}`);
        }    
        
        return pubSubClient.subscription(subscriptionId);

    } catch (error) {
        console.error(`Error setting up consumer: ${error}`);
    }
};

module.exports = {
    publishMessagePub,
    consumeMessagesPb,
    createNewConsumner,
};
