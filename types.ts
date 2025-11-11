
export interface User {
  id: string;
  name: string;
  registrationNumber?: string;
  username?: string;
  password?: string; // Note: In a real app, never store plaintext passwords
  role: 'student' | 'admin';
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  isActive: boolean;
  questions: Question[];
}

export interface Attempt {
  id: string;
  quizId: string;
  studentId: string;
  startTime: number;
  endTime: number;
  score: number; // percentage
  answers: (number | null)[]; // index of selected option
}
