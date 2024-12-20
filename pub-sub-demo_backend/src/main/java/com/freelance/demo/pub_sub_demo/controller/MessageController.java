package com.freelance.demo.pub_sub_demo.controller;

import com.freelance.demo.pub_sub_demo.service.MessageService;
import com.freelance.demo.pub_sub_demo.utills.Subscriber;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;
    private final Subscriber subscriber;


    public MessageController(MessageService messageService, Subscriber subscriber) {
        this.messageService = messageService;
        this.subscriber = subscriber;
    }
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/publish")
    public ResponseEntity<String> publishMessage(@RequestBody String message) {
        messageService.publishMessage(message);
        return ResponseEntity.ok("Message published successfully");
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/stream")
    public SseEmitter streamMessages() {
        return subscriber.addEmitter();
    }
}
