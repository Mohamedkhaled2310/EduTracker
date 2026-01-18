import { useQuery } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api";
import { TrendingUp, AlertTriangle, Users, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TeacherOverviewStats() {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['teacher-statistics'],
        queryFn: () => teachersApi.getStatistics(),
    });

    const stats = statsData?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Average Student Improvement */}
            <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <div className="flex items-start justify-between">
                    <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground mb-2">متوسط تحسن الطلاب</p>
                        <p className="text-3xl font-bold text-success">
                            {stats.averageStudentImprovement > 0 ? '+' : ''}
                            {stats.averageStudentImprovement.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            مقارنة بين الفصل الأول والثاني
                        </p>
                    </div>
                    <div className="bg-success/20 p-3 rounded-full">
                        <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                </div>
            </Card>

            {/* Subjects Needing Support */}
            <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <div className="flex items-start justify-between mb-4">
                    <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground mb-2">المواد التي تحتاج دعم فوري</p>
                        <p className="text-3xl font-bold text-warning">
                            {stats.subjectsNeedingSupport.length}
                        </p>
                    </div>
                    <div className="bg-warning/20 p-3 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                </div>
                {stats.subjectsNeedingSupport.length > 0 && (
                    <div className="space-y-2">
                        {stats.subjectsNeedingSupport.slice(0, 3).map((subject, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-warning font-medium">{subject.averageGrade}%</span>
                                <span className="text-foreground">{subject.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Teachers Requiring Support */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start justify-between mb-4">
                    <div className="text-right flex-1">
                        <p className="text-sm text-muted-foreground mb-2">المعلمون الذين يحتاجون دعم</p>
                        <p className="text-3xl font-bold text-primary">
                            {stats.teachersRequiringSupport.length}
                        </p>
                    </div>
                    <div className="bg-primary/20 p-3 rounded-full">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                </div>
                {stats.teachersRequiringSupport.length > 0 && (
                    <div className="space-y-2">
                        {stats.teachersRequiringSupport.slice(0, 3).map((teacher, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-primary font-medium">
                                    {teacher.supportRecordCount} سجل
                                </span>
                                <span className="text-foreground truncate">{teacher.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
