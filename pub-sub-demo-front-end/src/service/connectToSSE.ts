import { API_BASE_URL } from "@/service/api";

export const connectToSSE = (onMessage: (data: string) => void) => {
  const eventSource = new EventSource(`${API_BASE_URL}/messages/stream`);
  eventSource.onmessage = (event) => {
    console.log("Received message:", event.data);
    onMessage(event.data);
  };

  eventSource.onerror = () => {
    console.error("SSE connection error.");
    eventSource.close();
  };

  return () => eventSource.close(); // Cleanup on unmount
};
