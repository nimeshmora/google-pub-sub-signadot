"use client";

import React from "react";

interface MessageItemProps {
  message: string;
  isSentByUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isSentByUser }) => {
  return (
    <div
      className={`p-2 mb-2 rounded-md max-w-xs ${
        isSentByUser
          ? "bg-blue-500 text-white self-end"
          : "bg-gray-200 text-black self-start"
      }`}
    >
      {message}
    </div>
  );
};

export default MessageItem;
