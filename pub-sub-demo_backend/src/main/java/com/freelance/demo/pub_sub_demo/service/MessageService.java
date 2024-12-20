package com.freelance.demo.pub_sub_demo.service;

import com.freelance.demo.pub_sub_demo.utills.Publisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessageService {
    private final Publisher publisher;
    private static final String TOPIC_NAME = "demo-topic";

    @Autowired
    public MessageService(Publisher publisher) {
        this.publisher = publisher;
    }

    public void publishMessage(String message) {
        publisher.publishMessage(TOPIC_NAME, message);
    }
}
