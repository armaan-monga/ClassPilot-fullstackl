import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginTeacher, registerTeacher, getProfile } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("classpilot_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((res) => setTeacher(res.data.data))
      .catch(() => {
        localStorage.removeItem("classpilot_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginTeacher({ email, password });
    const { token, ...teacherData } = res.data.data;
    localStorage.setItem("classpilot_token", token);
    setTeacher(teacherData);
    return teacherData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerTeacher(payload);
    const { token, ...teacherData } = res.data.data;
    localStorage.setItem("classpilot_token", token);
    setTeacher(teacherData);
    return teacherData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("classpilot_token");
    setTeacher(null);
  }, []);

  const updateLocalTeacher = useCallback((partial) => {
    setTeacher((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ teacher, loading, login, register, logout, updateLocalTeacher }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
