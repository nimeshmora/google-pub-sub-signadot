package com.freelance.demo.pub_sub_demo.utills;

import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import org.springframework.stereotype.Service;

@Service
public class Publisher {

    private final PubSubTemplate pubSubTemplate;

    public Publisher(PubSubTemplate pubSubTemplate) {
        this.pubSubTemplate = pubSubTemplate;
    }

    public void publishMessage(String topicName, String message) {
        try {
            pubSubTemplate.publish(topicName, message);
            System.out.println("Message published to topic: " + topicName);
        } catch (Exception e) {
            System.err.println("Error publishing message: " + e.getMessage());
        }
    }
}
