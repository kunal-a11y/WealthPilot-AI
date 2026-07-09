import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api";
import { Send, Bot, User, Sparkles, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useNotifications } from "../lib/NotificationContext";

export function Advisor() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: () => fetchWithAuth("/ai/history", getToken),
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => fetchWithAuth("/ai/chat", getToken, {
      method: "POST",
      body: JSON.stringify({ message })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'AI Advisor Error',
        message: error.message || 'The AI failed to respond. Please try again later.'
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, chatMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    
    chatMutation.mutate(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto p-4 md:p-6">
      
      <header className="mb-6 flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="WealthPilot AI" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">WealthPilot AI Advisor</h1>
            <p className="text-sm text-zinc-400">Personalized financial insights based on your real data.</p>
          </div>
        </div>
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your chat history?')) {
                fetchWithAuth('/ai/history', getToken, { method: 'DELETE' })
                  .then(() => queryClient.invalidateQueries({ queryKey: ["chatHistory"] }))
                  .catch(() => addNotification({ type: 'error', title: 'Error', message: 'Failed to clear history' }));
              }
            }}
            className="px-4 py-2 bg-black hover:bg-rose-500/20 text-rose-500 border border-zinc-800 hover:border-rose-500/50 rounded-xl text-sm font-bold transition-all"
          >
            Clear Chat
          </button>
        )}
      </header>

      <div className="flex-1 bg-black border border-zinc-800 rounded-3xl p-4 md:p-6 overflow-y-auto space-y-6 shadow-2xl">
        
        {isLoading && <div className="text-center text-zinc-500 my-10">Loading chat history...</div>}

        {history.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4 max-w-md mx-auto">
            <Bot className="w-16 h-16 text-zinc-700" />
            <p className="text-lg text-white font-semibold">Hello! I am your AI Financial Twin.</p>
            <p className="text-sm">I have access to your assets, liabilities, and goals. Ask me anything about your portfolio, how to achieve your goals faster, or for market analysis.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <SuggestionBadge text="How is my debt-to-asset ratio?" onClick={() => setInput("How is my debt-to-asset ratio?")} />
              <SuggestionBadge text="Can I retire by 50?" onClick={() => setInput("Based on my current assets and goals, can I retire by 50?")} />
              <SuggestionBadge text="Analyze Apple stock" onClick={() => setInput("Please analyze AAPL stock.")} />
            </div>
          </div>
        )}

        {history.map((msg: any, i: number) => (
          <div key={i} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === 'user' ? "bg-emerald-500 text-black" : "bg-zinc-800 text-emerald-500 border border-zinc-700"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl prose prose-invert max-w-none text-sm md:text-base leading-relaxed",
              msg.role === 'user' 
                ? "bg-emerald-500/10 text-emerald-50 border border-emerald-500/20" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-300"
            )}>
              <ReactMarkdown
                components={{
                  a: ({node, ...props}) => {
                    if (props.href?.startsWith('/')) {
                      return <Link to={props.href} className="text-emerald-400 font-bold hover:underline transition-colors">{props.children}</Link>
                    }
                    return <a {...props} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline transition-colors" />
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
             <div className="w-8 h-8 rounded-full bg-zinc-800 text-emerald-500 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
              <RefreshCcw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
              <span className="animate-pulse">Analyzing your financial profile...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your portfolio, markets, or goals..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-full pl-6 pr-14 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
          disabled={chatMutation.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || chatMutation.isPending}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-500 text-black rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function SuggestionBadge({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full transition-colors border border-zinc-700">
      {text}
    </button>
  );
}
