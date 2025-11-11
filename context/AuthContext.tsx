
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password?: string, role?: 'student' | 'admin') => Promise<User | null>;
  register: (name: string, registrationNumber: string, password?: string) => Promise<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (identifier: string, password?: string, role: 'student' | 'admin' = 'student'): Promise<User | null> => {
    const foundUser = api.findUserByCredentials(identifier, password, role);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  };

  const register = async (name: string, registrationNumber: string, password?: string): Promise<User | null> => {
    const newUser = api.registerStudent(name, registrationNumber, password);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return newUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
