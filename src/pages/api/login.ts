import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import { User } from "../../types/User";
import { serialize } from "cookie";
import { allowCors } from "../../lib/cors";
import { createSession } from "../../lib/auth";

const attempts: Record<string, { count: number; time: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).end();
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

    let record = attempts[ip];
    if (!record) record = attempts[ip] = { count: 0, time: Date.now() };
    if (Date.now() - record.time > WINDOW_MS) {
        record.count = 0;
        record.time = Date.now();
    }
    if (record.count >= MAX_ATTEMPTS) {
        return res
            .status(429)
            .json({ message: "Too many login attempts. Try again later." });
    }

    const { username, password } = req.body;
    const file = path.join(process.cwd(), "data", "users.json");
    const data = JSON.parse(await fs.readFile(file, "utf-8")) as User[];
    const user = data.find(
        (u) => u.username === username && u.password === password
    );
    if (!user) {
        record.count++;
        return res.status(401).json({ message: "Invalid credentials" });
    }

    record.count = 0;
    const token = await createSession(user.username);
    const cookie = serialize("session", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.setHeader("Set-Cookie", cookie);
    res.json({ message: "ok" });
};

export default allowCors(handler);
