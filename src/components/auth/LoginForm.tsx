"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { login as serverLogin } from "../../actions/auth";

export const LoginForm: React.FC = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");
        try {
            const result = await serverLogin(formData);
            localStorage.setItem("token", result.token);
            // Update auth context
            // Since server action, perhaps revalidate or set user
            window.location.reload(); // Simple way
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input type="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium">
                    Password
                </label>
                <input type="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50">
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
};
