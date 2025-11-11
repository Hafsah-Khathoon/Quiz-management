
import { User, Quiz, Question, Attempt } from '../types';

const USERS_KEY = 'quiz_users';
const QUIZZES_KEY = 'quiz_quizzes';
const ATTEMPTS_KEY = 'quiz_attempts';

const seedInitialData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers: User[] = [
      { id: 'admin1', name: 'Admin', username: 'admin', password: 'password', role: 'admin' },
      { id: 'student1', name: 'Alice', registrationNumber: 'S001', password: 'password', role: 'student' },
      { id: 'student2', name: 'Bob', registrationNumber: 'S002', password: 'password', role: 'student' },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(QUIZZES_KEY)) {
    const initialQuizzes: Quiz[] = [
      {
        id: 'quiz1',
        title: 'React Fundamentals',
        description: 'Test your knowledge of core React concepts.',
        duration: 10,
        isActive: true,
        questions: [
          { id: 'q1-1', questionText: 'What is JSX?', options: ['A JavaScript syntax extension', 'A templating engine', 'A CSS preprocessor', 'A database'], correctAnswerIndex: 0 },
          { id: 'q1-2', questionText: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswerIndex: 1 },
          { id: 'q1-3', questionText: 'How do you pass data from a parent component to a child component?', options: ['State', 'Context', 'Props', 'Redux'], correctAnswerIndex: 2 },
        ],
      },
      {
        id: 'quiz2',
        title: 'Advanced TypeScript',
        description: 'Test your knowledge of advanced TypeScript features.',
        duration: 15,
        isActive: false,
        questions: [
           { id: 'q2-1', questionText: 'What is a Generic in TypeScript?', options: ['A type of class', 'A way to create reusable components', 'A feature for type-safe functions', 'All of the above'], correctAnswerIndex: 3 },
           { id: 'q2-2', questionText: 'What does the `keyof` operator do?', options: ['Returns the type of a key', 'Creates a union type of an object\'s keys', 'Checks if a key exists', 'Deletes a key'], correctAnswerIndex: 1 },
        ],
      },
    ];
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(initialQuizzes));
  }
};

seedInitialData();

export const api = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users)),

  getQuizzes: (): Quiz[] => JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]'),
  saveQuizzes: (quizzes: Quiz[]) => localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes)),

  getAttempts: (): Attempt[] => JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]'),
  saveAttempts: (attempts: Attempt[]) => localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts)),

  findUserByCredentials: (identifier: string, password?: string, role: 'student' | 'admin' = 'student'): User | undefined => {
    const users = api.getUsers();
    if (role === 'student') {
      return users.find(u => u.role === 'student' && u.registrationNumber === identifier && u.password === password);
    } else {
      return users.find(u => u.role === 'admin' && u.username === identifier && u.password === password);
    }
  },

  registerStudent: (name: string, registrationNumber: string, password?: string): User | null => {
    const users = api.getUsers();
    if (users.some(u => u.registrationNumber === registrationNumber)) {
      return null; // Registration number already exists
    }
    const newUser: User = {
      id: `student_${Date.now()}`,
      name,
      registrationNumber,
      password,
      role: 'student',
    };
    users.push(newUser);
    api.saveUsers(users);
    return newUser;
  },

  getQuizById: (quizId: string): Quiz | undefined => {
    return api.getQuizzes().find(q => q.id === quizId);
  },

  getAttemptsByStudent: (studentId: string): Attempt[] => {
    return api.getAttempts().filter(a => a.studentId === studentId);
  },

  saveAttempt: (attempt: Omit<Attempt, 'id'>): Attempt => {
    const attempts = api.getAttempts();
    const newAttempt: Attempt = { ...attempt, id: `attempt_${Date.now()}` };
    attempts.push(newAttempt);
    api.saveAttempts(attempts);
    return newAttempt;
  },
};
