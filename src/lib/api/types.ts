// API Types based on API Documentation

// ============= Auth Types =============
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'counselor' | 'staff';
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    user: User;
  };
  token: string;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterAdminResponse {
  status: string;
  message: string;
  user: User;
}

// ============= Dashboard Types =============
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  pendingReports: number;
  behaviorCases: number;
  activeCirculars: number;
}

export interface AttendanceChartData {
  grade: string;
  attendance: number;
  absence: number;
}

export interface PerformanceChartData {
  subject: string;
  average: number;
  passing: number;
}

export interface CreateClassRequest {
  grade: string;
  section: string;
  academicYear: string;
  name: string;
}

// ============= Student Types =============
export interface Student {
  id: number;
  name: string;
  studentId: string;
  grade: string;
  class: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'transferred';
  attendanceRate: number;
  behaviorScore: number;
  parentPhone: string;
  createdAt: string;
}

export interface StudentDetails extends Student {
  dateOfBirth: string;
  nationality: string;
  address: string;
  enrollmentDate: string;
  parent: {
    fatherName: string;
    fatherPhone: string;
    motherName: string;
    motherPhone: string;
    email: string;
  };
  medical: {
    bloodType: string;
    allergies: string[];
    conditions: string[];
  };
}

export interface CreateStudentRequest {
  name: string;
  grade: string;
  class: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  academicYear: string;
  parentPhone: string;
  parentEmail: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    students?: T[];
    teachers?: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// ============= Teacher Types =============
export interface Teacher {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  subjects: string[];
  grades: string[];
  phone: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface TeacherDetails extends Teacher {
  qualification: string;
  specialization: string;
  classes: Array<{
    id: number;
    grade: string;
    name: string;
  }>;
}

export interface CreateTeacherRequest {
  name: string;
  department: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  joinDate: string;
  subjects: number[];
  classes: number[];
}

// ============= Attendance Types =============
export interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string;
}

export interface RecordAttendanceRequest {
  date: string;
  records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
    parentNotified?: boolean;
  }>;
}

export interface AttendanceHistory {
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };
  records: Array<{
    date: string;
    status: 'present' | 'absent' | 'late';
    checkInTime: string;
    notes: string;
  }>;
}

// ============= Subject Types =============
export interface Subject {
  id: number;
  name: string;
  code: string;
  gradeLevel: string;
  passingGrade: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SubjectDetails extends Subject {
  teachers: Array<{
    id: number;
    name: string;
  }>;
  classes: Array<{
    id: number;
    grade: string;
    name: string;
  }>;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  gradeLevel: string;
  passingGrade: number;
  status?: 'active' | 'inactive';
}

// ============= Grade Types =============
export interface StudentGrades {
  student: {
    id: number;
    name: string;
    grade: string;
    class: string;
  };
  semester: number;
  year: string;
  subjects: Array<{
    name: string;
    homework: number;
    participation: number;
    midterm: number;
    final: number;
    total: number;
    percentage: number;
    grade: string;
  }>;
  summary: {
    totalPercentage: number;
    rank: number;
    totalStudents: number;
    gpa: string;
  };
}

export interface RecordGradeRequest {
  studentId: number;
  subjectId: string;
  semester: number;
  year: string;
  type: 'homework' | 'participation' | 'midterm' | 'final';
  score: number;
  maxScore: number;
}

// ============= Communication Types =============
export interface Communication {
  id: number;
  type: 'sms' | 'email' | 'notification';
  template: string;
  message: string;
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface SendCommunicationRequest {
  parentId: number;
  studentId: number;
  type: 'sms' | 'email' | 'notification';
  templateId: string;
  customMessage?: string;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  status: 'fail' | 'error';
  message: string;
}


// Behavior Types

export type ViolationSeverity = "low" | "medium" | "high";
export type ViolationStatus = "pending" | "resolved";

export interface BehaviorViolation {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  severity: ViolationSeverity;
  description: string;
  date: string;
  reportedBy: string;
  status: ViolationStatus;
  action: string | null;
}

export interface BehaviorViolationStats {
  total: number;
  pending: number;
  resolved: number;
}

export interface GetViolationsResponse {
  violations: BehaviorViolation[];
  stats: BehaviorViolationStats;
}

export interface CreateViolationRequest {
  studentIdCode: string;
  employeeId: string;
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  date?: string;
}

export interface PositiveBehavior {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  description: string;
  currentScore: number;
  date: string;
  awardedBy: string;
}

export interface CreatePositiveBehaviorRequest {
  studentIdCode: string;
  employeeId: string;
  type: string;
  description: string;
  currentScore?: number;
  date?: string;
}

