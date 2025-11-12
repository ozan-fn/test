"use server";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function register(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        throw new Error("Email and password required");
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.insert(users).values({ email, password: hashedPassword });

    return { success: true };
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        throw new Error("Email and password required");
    }

    // Restrict to specific email
    if (email !== "ozan6825@gmail.com") {
        throw new Error("Access denied: Only authorized email allowed");
    }

    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
        throw new Error("Invalid credentials");
    }

    const user = userResult[0]!;

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    return { token, user: { id: user.id, email: user.email } };
}
