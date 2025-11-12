"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as serverLogin, register as serverRegister } from "../actions/auth";

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage
        const token = localStorage.getItem("token");
        if (token) {
            // Verify token or fetch user
            // For simplicity, assume token is valid
            const payload = token.split(".")[1];
            if (payload) {
                const decoded = JSON.parse(atob(payload));
                setUser({ id: decoded.id, email: decoded.email });
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        const result = await serverLogin(formData);
        localStorage.setItem("token", result.token);
        setUser(result.user);
    };

    const register = async (email: string, password: string) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        await serverRegister(formData);
        // After register, auto login
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
};
