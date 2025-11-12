"use client";

import { Link } from "waku";
import { Counter } from "./counter";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";

export function AuthContent() {
    const { user, logout, loading } = useAuth();

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4">Loading...</p>
            </div>
        );

    if (user) {
        return (
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Welcome, {user.email}!</h1>
                <p>You are logged in.</p>
                <Counter />
                <button onClick={logout} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                    Logout
                </button>
                <Link to="/about" className="mt-4 inline-block underline">
                    About page
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-4xl font-bold tracking-tight">Login or Register</h1>
            <p>Login or register to access the app.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h2 className="text-2xl mb-4">Login</h2>
                    <LoginForm />
                </div>
                <div>
                    <h2 className="text-2xl mb-4">Register</h2>
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
