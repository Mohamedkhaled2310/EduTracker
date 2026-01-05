import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Bot, Send, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AssistantPage() {
  const [messages] = useState([
    { role: "assistant", content: "مرحباً بك! أنا مساعدك الذكي في Edutracker. كيف يمكنني مساعدتك في تحليل بيانات المدرسة اليوم؟" }
  ]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        <div className="bg-card rounded-xl shadow-sm border border-border flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">Edutracker AI</span>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">المحادثة مع المحلل الذكي</h2>
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-foreground"
                  }`}>
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="text-sm font-medium">المساعد</span>
                      <Bot className="w-4 h-4" />
                    </div>
                    <p className="text-right">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Button size="icon" className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
              <Input 
                placeholder="اكتب استفسارك هنا، مثلاً: ما هي توصياتك لتحسين درجات العلوم؟"
                className="flex-1 text-right"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
