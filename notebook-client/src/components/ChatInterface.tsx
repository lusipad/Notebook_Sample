"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, FileText, Sparkles, PanelLeftClose, PanelLeftOpen, ArrowUp, BookOpen, History, Info, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from "./MermaidDiagram";

// 引用来源类型定义
type Citation = {
  id: number;
  title: string;
  content: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
};

const HISTORY_ITEMS = [
  { id: 1, title: "关于 X100 电池续航的咨询", date: "刚刚" },
  { id: 2, title: "查询整机保修政策", date: "昨天" },
];

const STARTER_CHIPS = [
  { icon: <BookOpen size={18}/>, label: "查询保修政策", prompt: "这款产品的保修期是多久？" },
  { icon: <FileText size={18}/>, label: "了解电池续航", prompt: "电池容量是多少？充满电能用多久？" },
  { icon: <LayoutDashboard size={18}/>, label: "生成思维导图", prompt: "请根据现有文档，为我生成一张产品核心知识点的思维导图。" },
];

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"sources" | "history">("sources");
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setActiveCitation(null); 

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        citations: data.citations || []
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      if (data.citations && data.citations.length > 0) {
        setIsSidebarOpen(true);
        setActiveTab("sources");
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "连接知识库失败，请检查网络设置。",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setIsSidebarOpen(true);
    setActiveTab("sources");
    setActiveCitation(citation);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans bg-zinc-50/50 dark:bg-black">
      
      {/* 1. 智能侧边栏 */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 300 : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          translateX: isSidebarOpen ? 0 : -20 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed md:relative h-full z-40 flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 shadow-2xl md:shadow-lg",
          !isSidebarOpen && "pointer-events-none" // 关键：隐藏时禁止响应点击，防止遮挡
        )}
      >
        {/* 品牌头 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/50 min-w-[300px]">
           <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <BookOpen size={18} />
              </div>
              <span>企业知识库</span>
           </div>
           {/* 移动端关闭按钮 */}
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"><X size={20}/></button>
        </div>

        {/* 标签页切换 */}
        <div className="flex p-2 gap-1 bg-zinc-50/50 dark:bg-black/20 mx-2 mt-2 rounded-lg border border-zinc-100 dark:border-zinc-800 min-w-[280px]">
          <button 
            onClick={() => { setActiveTab("sources"); setActiveCitation(null); }}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
              activeTab === "sources" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <FileText size={14} />
            知识来源
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
              activeTab === "history" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <History size={14} />
            历史会话
          </button>
        </div>

        {/* 内容区 - 添加 min-w 防止宽度压缩时内容崩坏 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[300px]">
          {activeTab === "sources" ? (
            <>
              <AnimatePresence mode="wait">
                {activeCitation ? (
                  <motion.div 
                    key="citation-detail"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">正在查看原文</span>
                      <button onClick={() => setActiveCitation(null)} className="text-xs text-blue-500 hover:underline">返回列表</button>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-sm">
                      <div className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                        <FileText size={14}/> {activeCitation.title}
                      </div>
                      <div className="relative">
                        <span className="absolute -left-2 -top-2 text-4xl text-amber-200 dark:text-amber-800 font-serif opacity-50">“</span>
                        {activeCitation.content}
                        <span className="absolute -bottom-4 text-4xl text-amber-200 dark:text-amber-800 font-serif opacity-50">”</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="source-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">已索引文档 (3)</div>
                    {[{"title": "产品规格说明书_v2.0.pdf", "size": "2.4 MB"}, 
                      {"title": "售后服务条款_2025版.docx", "size": "1.1 MB"},
                      {"title": "常见故障排查手册.pdf", "size": "3.8 MB"}
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-200">{doc.title}</div>
                          <div className="text-xs text-zinc-400">{doc.size}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
             <div className="space-y-2">
               {HISTORY_ITEMS.map((item) => (
                <div key={item.id} className="p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.title}</div>
                  <div className="text-xs text-zinc-400 mt-1">{item.date}</div>
                </div>
              ))}
             </div>
          )}
        </div>
      </motion.aside>

      {/* 2. 主聊天区 */}
      <main className="flex-1 flex flex-col relative h-full w-full">
        
        {/* 顶部栏 - 提高 Z-Index 并增强按钮样式 */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-8 z-50 pointer-events-none">
          <div className="pointer-events-auto pt-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2.5 rounded-xl shadow-sm border transition-all duration-200",
                // 当侧边栏关闭时，按钮颜色更明显，确保可见
                isSidebarOpen 
                  ? "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent" 
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:shadow-md"
              )}
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>
        </div>

        {/* 消息滚动区 */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto min-h-full flex flex-col pt-20 pb-40">
            
            {/* 空状态 */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 my-auto opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                      <Sparkles size={32} className="text-white" />
                   </div>
                   <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                     智能客服工作台
                   </h1>
                   <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
                     基于内置知识库，为您提供精准的产品咨询与售后解答。
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl px-4">
                  {STARTER_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.prompt)}
                      className="flex flex-col items-start gap-2 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        {chip.icon}
                      </div>
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {chip.label}
                      </div>
                      <div className="text-xs text-zinc-400 line-clamp-1">
                        {chip.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 消息列表 */}
            <div className="space-y-8">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-2",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-3 rounded-2xl rounded-tr-none max-w-[85%] text-[15px] shadow-lg shadow-zinc-500/10 dark:shadow-none">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full max-w-full pl-0 md:pl-0">
                       <div className="flex items-center gap-2 mb-2 ml-1">
                          <Sparkles size={14} className="text-blue-500" />
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI 回答</span>
                       </div>
                       
                       <div className="prose prose-zinc dark:prose-invert prose-p:leading-7 max-w-none bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                const isMermaid = match && match[1] === 'mermaid';
                                
                                if (!inline && isMermaid) {
                                  return <MermaidDiagram code={String(children).replace(/\n$/, '')} />; 
                                }

                                return !inline && match ? (
                                  <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl my-4 text-sm overflow-x-auto">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                ) : (
                                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          
                          {/* 引用卡片 */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                              <div className="text-xs font-medium text-zinc-400 mb-2">参考资料:</div>
                              <div className="flex flex-wrap gap-2">
                                {msg.citations.map((citation, idx) => (
                                  <button 
                                    key={citation.id} 
                                    onClick={() => handleCitationClick(citation)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                  >
                                    <span className="w-4 h-4 rounded-full bg-white dark:bg-blue-950 flex items-center justify-center font-mono text-[10px] font-bold shadow-sm">
                                      {idx + 1}
                                    </span>
                                    <span className="truncate max-w-[150px]">{citation.title}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="pl-0 w-full">
                   <div className="flex items-center gap-2 mb-2 ml-1">
                      <Sparkles size={14} className="text-zinc-400 animate-pulse" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">查询中...</span>
                   </div>
                   <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-3 w-full max-w-xl">
                      <div className="flex gap-2">
                         <div className="h-2 w-2 bg-zinc-300 rounded-full animate-bounce" />
                         <div className="h-2 w-2 bg-zinc-300 rounded-full animate-bounce delay-75" />
                         <div className="h-2 w-2 bg-zinc-300 rounded-full animate-bounce delay-150" />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部输入区 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-50/90 via-zinc-50/80 to-transparent dark:from-black dark:via-black/80 pt-12 z-20">
           <div className="max-w-3xl mx-auto relative">
              <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 rounded-[26px] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <button className="p-3 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Plus size={20} />
                </button>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="询问关于产品、保修或故障的问题..."
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3.5 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 resize-none max-h-40 min-h-[52px] text-[15px]"
                  rows={1}
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200",
                    input.trim() && !isLoading
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-md hover:scale-105"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                  )}
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}