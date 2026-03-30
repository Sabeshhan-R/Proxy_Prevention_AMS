import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (credentials) => {
    if (credentials.role === 'teacher' && credentials.email === 'teacher@ams.edu') {
      setUser({ id: 't1', name: 'Dr. Smith', role: 'teacher', email: credentials.email });
      return true;
    } else if (credentials.role === 'student' && credentials.email === 'student@ams.edu') {
      setUser({ id: 's1', name: 'John Doe', role: 'student', email: credentials.email, labIp: '192.168.1.50' });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
