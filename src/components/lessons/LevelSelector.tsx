import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Heart } from 'lucide-react';
import type { QuestionLevel } from '@/lib/api/types';

interface LevelSelectorProps {
    selectedLevel: QuestionLevel;
    onLevelChange: (level: QuestionLevel) => void;
    language: 'ar' | 'en';
}

export default function LevelSelector({ selectedLevel, onLevelChange, language }: LevelSelectorProps) {
    const levels = [
        {
            value: 'high' as QuestionLevel,
            label: language === 'ar' ? 'مستوى عالي' : 'High Level',
            description: language === 'ar' ? 'أسئلة متقدمة للطلاب المتفوقين' : 'Advanced questions for top students',
            icon: Brain,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950',
            borderColor: 'border-purple-500'
        },
        {
            value: 'medium' as QuestionLevel,
            label: language === 'ar' ? 'مستوى متوسط' : 'Medium Level',
            description: language === 'ar' ? 'أسئلة مناسبة لمعظم الطلاب' : 'Questions suitable for most students',
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            borderColor: 'border-blue-500'
        },
        {
            value: 'special_needs' as QuestionLevel,
            label: language === 'ar' ? 'مستوى ذوي الهمم' : 'Special Needs Level',
            description: language === 'ar' ? 'أسئلة مبسطة مع تلميحات إضافية' : 'Simplified questions with extra hints',
            icon: Heart,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950',
            borderColor: 'border-green-500'
        }
    ];

    return (
        <Card>
            <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">
                    {language === 'ar' ? 'اختر مستوى الصعوبة' : 'Choose Difficulty Level'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {levels.map((level) => {
                        const Icon = level.icon;
                        const isSelected = selectedLevel === level.value;

                        return (
                            <button
                                key={level.value}
                                onClick={() => onLevelChange(level.value)}
                                className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                    ? `${level.borderColor} ${level.bgColor} shadow-md`
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className={`w-6 h-6 ${level.color} flex-shrink-0 mt-1`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">{level.label}</h4>
                                            {isSelected && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {language === 'ar' ? 'محدد' : 'Selected'}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {level.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
