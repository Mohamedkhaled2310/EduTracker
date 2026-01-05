import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Send } from "lucide-react";

interface CommunicationRecord {
  parentName: string;
  studentName: string;
  type: "SMS" | "CALL";
  message: string;
  status: "تم الإرسال" | "في الانتظار";
}

const messageTemplates = [
  { id: "absence", label: "تنبيه غياب" },
  { id: "behavior", label: "ثناء سلوكي" },
  { id: "meeting", label: "تذكير اجتماع" },
];

const communicationHistory: CommunicationRecord[] = [
  { 
    parentName: "ولي أمر زايد", 
    studentName: "زايد ناصر المزروعي", 
    type: "SMS", 
    message: "نرجو الانتباه لتكرار الغياب", 
    status: "تم الإرسال" 
  },
  { 
    parentName: "ولي أمر يوسف", 
    studentName: "يوسف ناصر الشامسي", 
    type: "CALL", 
    message: "شكر على التميز", 
    status: "تم الإرسال" 
  },
];

export function ParentCommunication() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
    switch (templateId) {
      case "absence":
        setMessageText("نود إعلامكم بغياب الطالب/ة عن المدرسة. نرجو التواصل معنا لمعرفة السبب.");
        break;
      case "behavior":
        setMessageText("نتقدم لكم بخالص الشكر والتقدير على تميز ابنكم/ابنتكم في السلوك والانضباط.");
        break;
      case "meeting":
        setMessageText("نذكركم بموعد اجتماع أولياء الأمور المقرر عقده يوم ___. نتطلع لحضوركم.");
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send New Message */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-end gap-2">
          <CardTitle className="text-lg">إرسال رسالة جديدة</CardTitle>
          <Mail className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">قوالب جاهزة</p>
              <div className="flex flex-wrap gap-2 justify-end">
                {messageTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTemplateClick(template.id)}
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="نص الرسالة..."
              className="min-h-[120px] text-right"
              dir="rtl"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />

            <Button className="w-full gap-2">
              إرسال
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-end gap-2">
          <CardTitle className="text-lg">سجل التواصل الحديث</CardTitle>
          <Phone className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">الحالة</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">الرسالة</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">النوع</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">اسم الطالب</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">ولي الأمر</th>
                </tr>
              </thead>
              <tbody>
                {communicationHistory.map((record, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="py-3 px-4 text-right">
                      <Badge className="bg-success/10 text-success">
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                      {record.message}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">
                        {record.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">{record.studentName}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium">{record.parentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
