
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';

type FormMode = 'studentLogin' | 'studentRegister' | 'adminLogin';

const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<FormMode>('studentLogin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const role = mode === 'adminLogin' ? 'admin' : 'student';
    try {
      const user = await login(identifier, password, role);
      if (!user) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if(!password) {
        setError('Password is required.');
        return;
    }
    setLoading(true);
    try {
        const user = await register(name, identifier, password);
        if (!user) {
            setError('Registration failed. This registration number may already be in use.');
        }
    } catch (err) {
        setError('An error occurred during registration.');
    } finally {
        setLoading(false);
    }
  };

  const renderForm = () => {
    const identifierLabel = mode === 'adminLogin' ? 'Username' : 'Registration Number';
    const identifierPlaceholder = mode === 'adminLogin' ? 'e.g., admin' : 'e.g., S001';

    if (mode === 'studentRegister') {
        return (
            <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="text-2xl font-bold text-center text-accent">Student Registration</h2>
                 <div>
                    <label className="block text-sm font-medium text-textSecondary">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-textSecondary">{identifierLabel}</label>
                    <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-textSecondary">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" />
                </div>
                <Button type="submit" fullWidth disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
            </form>
        );
    }
    
    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-accent">{mode === 'adminLogin' ? 'Admin Login' : 'Student Login'}</h2>
            <div>
                <label className="block text-sm font-medium text-textSecondary">{identifierLabel}</label>
                <input type="text" value={identifier} placeholder={identifierPlaceholder} onChange={(e) => setIdentifier(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
                <label className="block text-sm font-medium text-textSecondary">Password</label>
                <input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent" />
            </div>
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-textPrimary">Quiz Management System</h1>
        <Card>
          {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">{error}</div>}
          {renderForm()}
          <div className="mt-4 text-center text-sm">
            {mode === 'studentLogin' && <p>Don't have an account? <button onClick={() => setMode('studentRegister')} className="font-medium text-accent hover:underline">Register here</button></p>}
            {mode === 'studentRegister' && <p>Already have an account? <button onClick={() => setMode('studentLogin')} className="font-medium text-accent hover:underline">Login here</button></p>}
          </div>
        </Card>
        <div className="text-center mt-6">
            <button onClick={() => setMode(mode === 'adminLogin' ? 'studentLogin' : 'adminLogin')} className="text-textSecondary hover:text-accent transition-colors">
                {mode === 'adminLogin' ? 'Switch to Student Login' : 'Switch to Admin Login'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
