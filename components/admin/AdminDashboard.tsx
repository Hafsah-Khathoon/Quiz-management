
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Quiz, Question, User, Attempt } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

type AdminView = 'dashboard' | 'quizzes' | 'reports';

const Header: React.FC<{ onLogout: () => void; name: string | undefined }> = ({ onLogout, name }) => (
    <header className="bg-dark p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-accent">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
            <span className="text-textSecondary hidden sm:block">Welcome, {name}</span>
            <Button onClick={onLogout} variant="danger" className="py-1 px-3 text-sm">Logout</Button>
        </div>
    </header>
);

// QuizForm is complex, so we define it as a separate component inside AdminDashboard
const QuizFormComponent: React.FC<{
    quiz: Quiz | Partial<Quiz> | null;
    onSave: (quiz: Quiz) => void;
    onClose: () => void;
}> = ({ quiz: initialQuiz, onSave, onClose }) => {
    const [quiz, setQuiz] = useState<Quiz | Partial<Quiz>>(() => 
        initialQuiz || { title: '', description: '', duration: 10, isActive: false, questions: [] }
    );
    const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setQuiz({ ...quiz, [e.target.name]: e.target.name === 'duration' ? parseInt(e.target.value, 10) : e.target.value });
    };

    const handleSaveQuestion = (question: Question) => {
        const newQuestions = [...(quiz.questions || [])];
        if (editingQuestionIndex !== null) {
            newQuestions[editingQuestionIndex] = question;
        } else {
            newQuestions.push({ ...question, id: `q_${Date.now()}` });
        }
        setQuiz({ ...quiz, questions: newQuestions });
        setQuestionModalOpen(false);
        setEditingQuestion(null);
        setEditingQuestionIndex(null);
    };

    const handleEditQuestion = (question: Question, index: number) => {
        setEditingQuestion(question);
        setEditingQuestionIndex(index);
        setQuestionModalOpen(true);
    };
    
    const handleDeleteQuestion = (index: number) => {
        const newQuestions = [...(quiz.questions || [])];
        newQuestions.splice(index, 1);
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleSaveQuiz = () => {
        if (quiz.title && quiz.description && quiz.duration) {
            const finalQuiz: Quiz = {
                id: quiz.id || `quiz_${Date.now()}`,
                title: quiz.title,
                description: quiz.description,
                duration: quiz.duration,
                isActive: quiz.isActive || false,
                questions: quiz.questions || []
            };
            onSave(finalQuiz);
        }
    };
    
    return (
        <>
            <div className="space-y-4">
                <input name="title" value={quiz.title || ''} onChange={handleQuizChange} placeholder="Quiz Title" className="w-full bg-gray-700 p-2 rounded" />
                <textarea name="description" value={quiz.description || ''} onChange={handleQuizChange} placeholder="Quiz Description" className="w-full bg-gray-700 p-2 rounded" />
                <input name="duration" type="number" value={quiz.duration || 10} onChange={handleQuizChange} placeholder="Duration (minutes)" className="w-full bg-gray-700 p-2 rounded" />
                <div className="flex items-center">
                    <input type="checkbox" id="isActive" name="isActive" checked={quiz.isActive || false} onChange={(e) => setQuiz({...quiz, isActive: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-textSecondary">Active</label>
                </div>
                <hr className="border-gray-600"/>
                <h3 className="text-lg font-semibold">Questions ({quiz.questions?.length || 0})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {quiz.questions?.map((q, i) => (
                        <div key={q.id || i} className="bg-secondary p-3 rounded flex justify-between items-center">
                           <p className="truncate w-3/4">{q.questionText}</p>
                           <div>
                                <Button onClick={() => handleEditQuestion(q, i)} variant="secondary" className="mr-2 py-1 px-2 text-xs">Edit</Button>
                                <Button onClick={() => handleDeleteQuestion(i)} variant="danger" className="py-1 px-2 text-xs">Del</Button>
                           </div>
                        </div>
                    ))}
                </div>
                 <Button onClick={() => { setEditingQuestion(null); setEditingQuestionIndex(null); setQuestionModalOpen(true); }} variant="secondary" fullWidth>Add Question</Button>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button onClick={onClose} variant="secondary">Cancel</Button>
                <Button onClick={handleSaveQuiz}>Save Quiz</Button>
            </div>
            
            <Modal isOpen={isQuestionModalOpen} onClose={() => setQuestionModalOpen(false)} title={editingQuestion ? "Edit Question" : "Add Question"}>
                <QuestionFormComponent question={editingQuestion} onSave={handleSaveQuestion} onClose={() => setQuestionModalOpen(false)} />
            </Modal>
        </>
    );
};

const QuestionFormComponent: React.FC<{
    question: Question | null;
    onSave: (question: Question) => void;
    onClose: () => void;
}> = ({ question: initialQuestion, onSave, onClose }) => {
    const [questionText, setQuestionText] = useState(initialQuestion?.questionText || '');
    const [options, setOptions] = useState(initialQuestion?.options || ['', '', '', '']);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(initialQuestion?.correctAnswerIndex ?? -1);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSave = () => {
        if (questionText && options.every(o => o.trim() !== '') && correctAnswerIndex >= 0) {
            onSave({
                id: initialQuestion?.id || `q_${Date.now()}`,
                questionText,
                options,
                correctAnswerIndex
            });
        }
    };
    
    return (
        <div className="space-y-4">
            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Question Text" className="w-full bg-gray-700 p-2 rounded" />
            {options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                    <input type="radio" name="correctAnswer" checked={correctAnswerIndex === i} onChange={() => setCorrectAnswerIndex(i)} />
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} className="w-full bg-gray-700 p-2 rounded" />
                </div>
            ))}
             <div className="mt-6 flex justify-end space-x-2">
                <Button onClick={onClose} variant="secondary">Cancel</Button>
                <Button onClick={handleSave}>Save Question</Button>
            </div>
        </div>
    );
};


const QuizManager: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(api.getQuizzes());
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

    const refreshQuizzes = () => setQuizzes(api.getQuizzes());

    const handleSaveQuiz = (quiz: Quiz) => {
        const allQuizzes = api.getQuizzes();
        const index = allQuizzes.findIndex(q => q.id === quiz.id);
        if (index > -1) {
            allQuizzes[index] = quiz;
        } else {
            allQuizzes.push(quiz);
        }
        api.saveQuizzes(allQuizzes);
        refreshQuizzes();
        setModalOpen(false);
        setEditingQuiz(null);
    };

    const handleDeleteQuiz = (quizId: string) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            const updatedQuizzes = api.getQuizzes().filter(q => q.id !== quizId);
            api.saveQuizzes(updatedQuizzes);
            refreshQuizzes();
        }
    };
    
    const handleToggleActive = (quiz: Quiz) => {
        const updatedQuiz = { ...quiz, isActive: !quiz.isActive };
        handleSaveQuiz(updatedQuiz);
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Quizzes</h2>
                <Button onClick={() => { setEditingQuiz(null); setModalOpen(true); }}>Create New Quiz</Button>
            </div>
            <div className="space-y-3">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-secondary p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{quiz.title} <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${quiz.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>{quiz.isActive ? 'Active' : 'Inactive'}</span></h3>
                            <p className="text-sm text-textSecondary">{quiz.questions.length} Questions | {quiz.duration} mins</p>
                        </div>
                        <div className="flex space-x-2">
                             <Button onClick={() => handleToggleActive(quiz)} variant="secondary" className="text-xs py-1 px-2">{quiz.isActive ? 'Deactivate' : 'Activate'}</Button>
                            <Button onClick={() => { setEditingQuiz(quiz); setModalOpen(true); }} variant="secondary" className="text-xs py-1 px-2">Edit</Button>
                            <Button onClick={() => handleDeleteQuiz(quiz.id)} variant="danger" className="text-xs py-1 px-2">Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}>
                <QuizFormComponent quiz={editingQuiz} onSave={handleSaveQuiz} onClose={() => { setModalOpen(false); setEditingQuiz(null); }} />
            </Modal>
        </Card>
    );
};

const StudentReports: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        setStudents(api.getUsers().filter(u => u.role === 'student'));
        setAttempts(api.getAttempts());
        setQuizzes(api.getQuizzes());
    }, []);

    const getQuizTitle = (quizId: string) => quizzes.find(q => q.id === quizId)?.title || 'Unknown';
    
    return (
        <Card>
             <h2 className="text-2xl font-bold mb-4">Student Reports</h2>
             <div className="space-y-6">
                {students.map(student => {
                    const studentAttempts = attempts.filter(a => a.studentId === student.id);
                    return (
                        <div key={student.id} className="bg-secondary p-4 rounded-lg">
                            <h3 className="font-semibold text-lg">{student.name} ({student.registrationNumber})</h3>
                            {studentAttempts.length > 0 ? (
                                <ul className="mt-2 space-y-2 text-sm">
                                    {studentAttempts.map(attempt => (
                                        <li key={attempt.id} className="flex justify-between items-center">
                                            <span>{getQuizTitle(attempt.quizId)} - <span className="text-textSecondary">{new Date(attempt.endTime).toLocaleDateString()}</span></span>
                                            <span className={`font-bold ${attempt.score >= 50 ? 'text-green-400' : 'text-red-400'}`}>{attempt.score.toFixed(1)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-textSecondary mt-1">No attempts recorded.</p>
                            )}
                        </div>
                    );
                })}
             </div>
        </Card>
    );
};

const DashboardHome: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, quizzes: 0, attempts: 0 });

    useEffect(() => {
        setStats({
            students: api.getUsers().filter(u => u.role === 'student').length,
            quizzes: api.getQuizzes().length,
            attempts: api.getAttempts().length,
        });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
                <h3 className="text-lg font-semibold text-textSecondary">Total Students</h3>
                <p className="text-4xl font-bold text-accent">{stats.students}</p>
            </Card>
             <Card className="text-center">
                <h3 className="text-lg font-semibold text-textSecondary">Total Quizzes</h3>
                <p className="text-4xl font-bold text-accent">{stats.quizzes}</p>
            </Card>
             <Card className="text-center">
                <h3 className="text-lg font-semibold text-textSecondary">Total Attempts</h3>
                <p className="text-4xl font-bold text-accent">{stats.attempts}</p>
            </Card>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<AdminView>('dashboard');

    const renderContent = () => {
        switch (view) {
            case 'quizzes': return <QuizManager />;
            case 'reports': return <StudentReports />;
            case 'dashboard':
            default: return <DashboardHome />;
        }
    };
    
    return (
        <div>
            <Header onLogout={logout} name={user?.name} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 border-b border-gray-700">
                     <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                         <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                             Dashboard
                         </button>
                         <button onClick={() => setView('quizzes')} className={`${view === 'quizzes' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                             Quizzes
                         </button>
                         <button onClick={() => setView('reports')} className={`${view === 'reports' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                             Reports
                         </button>
                     </nav>
                 </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
