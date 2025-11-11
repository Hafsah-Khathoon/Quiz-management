
import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/auth/LoginScreen';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const App: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    if (!user) {
      return <LoginScreen />;
    }

    if (user.role === 'student') {
      return <StudentDashboard />;
    }

    if (user.role === 'admin') {
      return <AdminDashboard />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-secondary text-textPrimary">
      {renderContent()}
    </div>
  );
};

export default App;
