
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Quiz, Attempt } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Timer from '../common/Timer';
import { PASSING_SCORE_PERCENTAGE } from '../../constants';

const Header: React.FC<{ onLogout: () => void; name: string | undefined }> = ({ onLogout, name }) => (
    <header className="bg-dark p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-accent">Student Dashboard</h1>
        <div className="flex items-center space-x-4">
            <span className="text-textSecondary hidden sm:block">Welcome, {name}</span>
            <Button onClick={onLogout} variant="danger" className="py-1 px-3 text-sm">Logout</Button>
        </div>
    </header>
);

const QuizListComponent: React.FC<{ onAttemptQuiz: (quizId: string) => void }> = ({ onAttemptQuiz }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);

    useEffect(() => {
        setQuizzes(api.getQuizzes().filter(q => q.isActive));
        if (user) {
            setAttempts(api.getAttemptsByStudent(user.id));
        }
    }, [user]);

    const canRetryQuiz = (quizId: string) => {
        const lastAttempt = attempts.filter(a => a.quizId === quizId).sort((a, b) => b.endTime - a.endTime)[0];
        return !lastAttempt || lastAttempt.score < PASSING_SCORE_PERCENTAGE;
    };

    return (
        <Card className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
            <div className="space-y-4">
                {quizzes.length > 0 ? quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">{quiz.title}</h3>
                            <p className="text-textSecondary text-sm">{quiz.description}</p>
                            <p className="text-textSecondary text-sm">{quiz.questions.length} Questions | {quiz.duration} Minutes</p>
                        </div>
                        {canRetryQuiz(quiz.id) ? (
                             <Button onClick={() => onAttemptQuiz(quiz.id)}>Attempt</Button>
                        ) : (
                             <Button disabled>Passed</Button>
                        )}
                    </div>
                )) : <p>No active quizzes available at the moment.</p>}
            </div>
        </Card>
    );
};

const AttemptComponent: React.FC<{ quiz: Quiz; onFinishAttempt: (attempt: Attempt) => void }> = ({ quiz, onFinishAttempt }) => {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));

    const handleSubmit = useCallback(() => {
        if (!user) return;
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (q.correctAnswerIndex === answers[index]) {
                score++;
            }
        });
        const scorePercentage = (score / quiz.questions.length) * 100;
        const newAttempt: Attempt = {
            id: '', // Will be set by API
            quizId: quiz.id,
            studentId: user.id,
            startTime: Date.now() - quiz.duration * 60 * 1000,
            endTime: Date.now(),
            score: scorePercentage,
            answers,
        };
        const savedAttempt = api.saveAttempt(newAttempt);
        onFinishAttempt(savedAttempt);
    }, [user, quiz, answers, onFinishAttempt]);

    const handleSelectOption = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const question = quiz.questions[currentQuestionIndex];
    
    return (
        <div className="p-4 md:p-8">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{quiz.title}</h2>
                <Timer duration={quiz.duration * 60} onTimeUp={handleSubmit} />
            </header>
            <Card>
                <p className="text-textSecondary mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                <h3 className="text-xl font-semibold mb-6">{question.questionText}</h3>
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button key={index} onClick={() => handleSelectOption(index)} className={`block w-full text-left p-3 rounded-md border-2 transition-colors ${answers[currentQuestionIndex] === index ? 'bg-accent border-accent text-white' : 'bg-secondary border-gray-600 hover:border-accent'}`}>
                            {option}
                        </button>
                    ))}
                </div>
            </Card>
            <div className="flex justify-between mt-8">
                <Button onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>Previous</Button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button onClick={handleSubmit}>Submit</Button>
                ) : (
                    <Button onClick={() => setCurrentQuestionIndex(p => p + 1)}>Next</Button>
                )}
            </div>
        </div>
    );
};

const ResultComponent: React.FC<{ attempt: Attempt, onBack: () => void }> = ({ attempt, onBack }) => {
    const quiz = api.getQuizById(attempt.quizId);
    const passed = attempt.score >= PASSING_SCORE_PERCENTAGE;

    if (!quiz) return <p>Quiz not found.</p>;
    
    return (
        <div className="p-4 md:p-8">
            <Card>
                <h2 className="text-3xl font-bold text-center mb-4">Quiz Result</h2>
                <h3 className="text-xl font-semibold text-center mb-6">{quiz.title}</h3>
                <div className={`text-center p-6 rounded-lg ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
                    <p className="text-lg text-white">You {passed ? 'Passed' : 'Failed'}</p>
                    <p className="text-5xl font-bold text-white my-2">{attempt.score.toFixed(2)}%</p>
                </div>
                <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">Review Your Answers:</h4>
                    {quiz.questions.map((q, index) => {
                        const userAnswer = attempt.answers[index];
                        const isCorrect = userAnswer === q.correctAnswerIndex;
                        return (
                            <div key={q.id} className="mb-4 p-3 bg-secondary rounded-md">
                                <p className="font-semibold">{index + 1}. {q.questionText}</p>
                                <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    Your answer: {userAnswer !== null ? q.options[userAnswer] : 'Not answered'}
                                </p>
                                {!isCorrect && <p className="text-sm text-green-400">Correct answer: {q.options[q.correctAnswerIndex]}</p>}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-8">
                    <Button onClick={onBack}>Back to Dashboard</Button>
                </div>
            </Card>
        </div>
    );
};

const HistoryComponent: React.FC = () => {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const quizzes = api.getQuizzes();
    
    useEffect(() => {
        if (user) {
            setAttempts(api.getAttemptsByStudent(user.id).sort((a, b) => b.endTime - a.endTime));
        }
    }, [user]);

    const getQuizTitle = (quizId: string) => quizzes.find(q => q.id === quizId)?.title || 'Unknown Quiz';

    return (
        <Card className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Quiz History</h2>
            <div className="space-y-4">
                {attempts.length > 0 ? attempts.map(attempt => (
                    <div key={attempt.id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">{getQuizTitle(attempt.quizId)}</h3>
                            <p className="text-textSecondary text-sm">Attempted on: {new Date(attempt.endTime).toLocaleString()}</p>
                        </div>
                        <div className={`text-lg font-bold ${attempt.score >= PASSING_SCORE_PERCENTAGE ? 'text-green-400' : 'text-red-400'}`}>
                            {attempt.score.toFixed(2)}%
                        </div>
                    </div>
                )) : <p>You have not attempted any quizzes yet.</p>}
            </div>
        </Card>
    );
};


type StudentView = 'list' | 'attempt' | 'result' | 'history';

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<StudentView>('list');
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
    const [currentTab, setCurrentTab] = useState<'quizzes' | 'history'>('quizzes');


    const handleAttemptQuiz = (quizId: string) => {
        const quiz = api.getQuizById(quizId);
        if (quiz) {
            setActiveQuiz(quiz);
            setView('attempt');
        }
    };
    
    const handleFinishAttempt = (attempt: Attempt) => {
        setLastAttempt(attempt);
        setView('result');
    }
    
    const renderContent = () => {
        switch (view) {
            case 'attempt':
                return activeQuiz ? <AttemptComponent quiz={activeQuiz} onFinishAttempt={handleFinishAttempt} /> : null;
            case 'result':
                return lastAttempt ? <ResultComponent attempt={lastAttempt} onBack={() => { setView('list'); setCurrentTab('quizzes'); }} /> : null;
            case 'list':
            default:
                return (
                    <>
                        <div className="mb-6 border-b border-gray-700">
                             <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                 <button onClick={() => setCurrentTab('quizzes')} className={`${currentTab === 'quizzes' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                     Available Quizzes
                                 </button>
                                 <button onClick={() => setCurrentTab('history')} className={`${currentTab === 'history' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                     My History
                                 </button>
                             </nav>
                         </div>
                         {currentTab === 'quizzes' && <QuizListComponent onAttemptQuiz={handleAttemptQuiz} />}
                         {currentTab === 'history' && <HistoryComponent />}
                    </>
                );
        }
    }
    
    return (
        <div>
            <Header onLogout={logout} name={user?.name} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard;

