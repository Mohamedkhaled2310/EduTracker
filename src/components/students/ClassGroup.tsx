import { useState } from "react";
import { StudentCard } from "@/components/dashboard/StudentCard";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    name: string;
    nameEn: string;
    studentId: string;
    status: "excellent" | "needs-support" | "at-risk";
    points: string;
    attendance: number;
    rating: number;
    avatar: string;
    grade?: string;
    section?: string;
}

interface ClassGroupProps {
    grade: string;
    section: string;
    classTeacher: string;
    students: Student[];
    onStudentClick: (student: Student) => void;
}

export function ClassGroup({
    grade,
    section,
    classTeacher,
    students,
    onStudentClick,
}: ClassGroupProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
            {/* Class Header */}
            <div
                className="bg-primary/5 border-b border-border p-4 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="text-primary">
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                إجمالي: {students.length} طالب
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <h3 className="text-lg font-bold text-foreground">
                            {grade} / {section}
                        </h3>
                        <p className="text-sm text-accent">
                            المعلمة: <span className="font-medium">{classTeacher}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Students Grid */}
            <div
                className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {students.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                onClick={() => onStudentClick(student)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
