import React, { useState } from 'react';

interface ChatProps {
  originalText: string;
  onCustomRephrase: (instruction: string) => void;
}

const Chat: React.FC<ChatProps> = ({ originalText, onCustomRephrase }) => {
  const [instruction, setInstruction] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant'; message: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!instruction.trim()) return;

    // Add user message to chat history
    const userMessage = { type: 'user' as const, message: instruction };
    setChatHistory([...chatHistory, userMessage]);

    setLoading(true);

    // Simulate API call for custom rephrasing
    setTimeout(() => {
      // Mock response - in real implementation, this would call the backend
      const assistantMessage = {
        type: 'assistant' as const,
        message: `I'll help you modify the text based on your instruction: "${instruction}". Processing your request...`
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      // Call the parent handler
      onCustomRephrase(instruction);

      setInstruction('');
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[400px]">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p className="mb-2">No messages yet</p>
            <p className="text-xs">Enter custom instructions to modify your text</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-primary/10 ml-4'
                  : 'bg-gray-100 mr-4'
              }`}
            >
              <div className="text-xs font-semibold mb-1 text-gray-600">
                {msg.type === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="text-sm text-gray-800">{msg.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="border-t pt-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Custom Instructions
        </label>
        <div className="space-y-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E.g., 'Make this more formal', 'Simplify the language', 'Add more details about...'"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !instruction.trim()}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark disabled:bg-gray-400 transition"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-600">
          <strong>Tip:</strong> Provide specific instructions to customize how the text should be modified.
        </div>
      </div>
    </div>
  );
};

export default Chat;
