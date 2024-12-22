"use client";

import React, { useState, ChangeEvent } from "react";
import MessageInput from "@/components/MessageSender/MessageInput";
import SendButton from "@/components/MessageSender/SendButton";
import api from "@/service/api";

interface MessageSenderProps {
  onSend: (message: string) => Promise<void>;
}

const MessageSender: React.FC<MessageSenderProps> = () => {
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  const handleSend = async (): Promise<void> => {
    if (message.trim() === "") {
      alert("Message cannot be empty!");
      return;
    }

    try {
      await api.post("/messages/publish", { message });
      console.log("Message sent:", message);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send the message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col p-4 border border-gray-300 rounded-md bg-white w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
      <MessageInput value={message} onChange={handleChange} />
      <SendButton onClick={handleSend} />
    </div>
  );
};

export default MessageSender;
