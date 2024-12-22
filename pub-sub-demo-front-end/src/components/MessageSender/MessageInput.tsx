"use client";

import React, { ChangeEvent } from "react";

interface MessageInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md mb-4 w-full"
      placeholder="Type your message here..."
    />
  );
};

export default MessageInput;
