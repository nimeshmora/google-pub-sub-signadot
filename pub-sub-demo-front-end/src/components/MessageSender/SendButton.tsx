"use client";

import React from "react";

interface SendButtonProps {
  onClick: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
    >
      Send
    </button>
  );
};

export default SendButton;
