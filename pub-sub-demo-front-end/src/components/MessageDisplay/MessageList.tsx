"use client";

import React from "react";
import MessageItem from "@/components/MessageDisplay/MessageItem";

interface MessageListProps {
  messages: { text: string; isSentByUser: boolean }[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg, index) => (
        <MessageItem
          key={index}
          message={msg.text}
          isSentByUser={msg.isSentByUser}
        />
      ))}
    </div>
  );
};

export default MessageList;
