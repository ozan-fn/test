"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            window.location.replace("/");
        }
    }, [loading, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting
    }

    return <>{children}</>;
};
