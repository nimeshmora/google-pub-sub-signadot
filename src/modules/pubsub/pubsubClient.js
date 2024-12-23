// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');
const path = require('path')

const pubSubClient = new PubSub({
    projectId: process.env.PROJECT_ID, 
    keyFilename: path.join(__dirname, 'sa', 'saps.json')
});

exports.pubSubClient = pubSubClient;