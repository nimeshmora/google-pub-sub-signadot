package com.freelance.demo.pub_sub_demo.utills;

import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.annotation.PostConstruct;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class Subscriber {

    private final PubSubTemplate pubSubTemplate;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @Autowired
    public Subscriber(PubSubTemplate pubSubTemplate) {
        this.pubSubTemplate = pubSubTemplate;
    }

    @PostConstruct
    public void subscribe() {
        String subscriptionName = "demo-topic-sub"; // Replace with your subscription name

        pubSubTemplate.subscribe(subscriptionName, (message) -> {
            try {
              String payload = message.getPubsubMessage().getData().toStringUtf8();
                System.out.println("Received message: " + payload);
                emitters.forEach(emitter -> {
                    try {
                        emitter.send(SseEmitter.event().name("message").data(payload));
                    } catch (Exception e) {
                        emitters.remove(emitter); // Remove broken emitters
                    }
                });

                message.ack();
            } catch (Exception e) {
                System.err.println("Error processing message: " + e.getMessage());
            }
        });
    }
    public SseEmitter addEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }
}
