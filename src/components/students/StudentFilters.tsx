import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { StudentCategory } from "@/lib/api/types";

interface StudentFiltersProps {
    selectedGrade: string;
    selectedCategory: string;
    onGradeChange: (grade: string) => void;
    onCategoryChange: (category: string) => void;
    onClearFilters: () => void;
}

const GRADES = [
    { value: "الصف الأول", label: "الصف الأول" },
    { value: "الصف الثاني", label: "الصف الثاني" },
    { value: "الصف الثالث", label: "الصف الثالث" },
    { value: "الصف الرابع", label: "الصف الرابع" },
];

const CATEGORIES: { value: StudentCategory | "all"; label: string }[] = [
    { value: "all", label: "جميع الفئات" },
    { value: "عادي", label: "عادي" },
    { value: "اصحاب الهمم", label: "اصحاب الهمم" },
    { value: "اصحاب المراسيم", label: "اصحاب المراسيم" },
    { value: "أبناء المواطنات", label: "أبناء المواطنات" },
];

export function StudentFilters({
    selectedGrade,
    selectedCategory,
    onGradeChange,
    onCategoryChange,
    onClearFilters,
}: StudentFiltersProps) {
    const hasActiveFilters = selectedGrade !== "all" || selectedCategory !== "all";

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Grade Filter */}
            <div className="flex items-center gap-2">
                <Select value={selectedGrade} onValueChange={onGradeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الصفوف</SelectItem>
                        {GRADES.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2"
                >
                    <X className="w-4 h-4" />
                    مسح الفلاتر
                </Button>
            )}
        </div>
    );
}
