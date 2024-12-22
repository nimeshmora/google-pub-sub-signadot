const express = require('express');
const { producerPort, kafkaTopic, consumerHost, consumerPort } = require('../../../config/config.js');
const { publishMessage } = require('../../modules/kafka/kafka.js')
const { publishMessagePub } = require('../../modules/pubsub/pubsub.js')
const { extractRoutingKey } = require('../../modules/otel/baggage.js');
const { registerEvent } = require('../../modules/events/events.js');

function runProducer() {
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Middleware to parse URL-encoded form data
    app.use(express.urlencoded({ extended: true }));


    let errorHandler = (res, error) => {
        console.error(error);
        res.status(500);
        res.json({
            error: {
                message: error || 'Internal Server Error',
            },
        });
    }

    // REST API endpoints
    app.post('/api/publish', async (req, res) => {
        msg = {
            id: req.body.messageID,
            body: req.body.messageBody
        }

        let routingKey = extractRoutingKey(req.get('baggage')); 

        registerEvent('Publishing message to pubsub (topic=' + kafkaTopic +')', msg, routingKey,
            () => { },
            (error) => errorHandler(res, error)
        )        

        // publishMessage(kafkaTopic, msg, { baggage: req.get('baggage') })
        //     .then(() => {
        //         console.log('debug Message successfully published to kafka')
        //         // res.json({})
        //     })
        //     .catch((error) => errorHandler(res, error));

        // console.log("debug /api/publish", JSON.stringify(msg), "published to topic", kafkaTopic);

        publishMessagePub(kafkaTopic, msg, { baggage: req.get('baggage') })
            .then(() => {
                console.log('debug Message successfully published to pubsub')
                res.json({})
            })
            .catch((error) => errorHandler(res, error));
    });

    // Start the server
    app.listen(producerPort, () => {
        console.log(`Producer API is running at http://localhost:${producerPort}`);
    });
}

module.exports = runProducer;