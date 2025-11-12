"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { register as serverRegister } from "../../actions/auth";

export const RegisterForm: React.FC = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");
        try {
            await serverRegister(formData);
            // After register, auto login
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            await login(email, password);
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
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50">
                {loading ? "Registering..." : "Register"}
            </button>
        </form>
    );
};
