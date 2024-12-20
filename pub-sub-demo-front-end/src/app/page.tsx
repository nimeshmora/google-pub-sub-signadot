"use client";

import React, { useState, useEffect } from "react";
import MessageSender from "@/components/MessageSender/MessageSender";
import MessageList from "@/components/MessageDisplay/MessageList";
import api from "@/service/api";
import { connectToSSE } from "@/service/connectToSSE";

export default function Home() {
  const [messages, setMessages] = useState<
    { text: string; isSentByUser: boolean }[]
  >([]);

  useEffect(() => {
    const unsubscribe = connectToSSE((message) => {
      setMessages((prev) => [...prev, { text: message, isSentByUser: false }]);
    });

    return () => unsubscribe();
  }, []);

  const addMessage = async (message: string) => {
    try {
      await api.post("/messages/publish", { message });
      setMessages((prev) => [...prev, { text: message, isSentByUser: true }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1">
          <MessageSender onSend={addMessage} />
        </div>

        <div className="flex-1 border border-gray-300 bg-white rounded-md p-4 overflow-y-auto h-[400px]">
          <MessageList messages={messages} />
        </div>
      </div>
    </div>
  );
}
