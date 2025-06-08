import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { User } from "../types/User";

const dataDir = process.env.DATA_DIR || process.cwd();
const usersFile = path.join(dataDir, "data", "users.json");
const sessionsFile = path.join(dataDir, "data", "sessions.json");

export const createSession = async (username: string): Promise<string> => {
    const token = crypto.randomBytes(24).toString("hex");
    let sessions: Record<string, string> = {};
    try {
        sessions = JSON.parse(await fs.readFile(sessionsFile, "utf-8"));
    } catch {
        /* empty */
    }
    sessions[token] = username;
    await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 4));
    return token;
};

export const authenticate = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<User | null> => {
    const data: User[] = JSON.parse(await fs.readFile(usersFile, "utf-8"));

    const session = req.cookies["session"];
    if (session) {
        try {
            const sessions = JSON.parse(
                await fs.readFile(sessionsFile, "utf-8")
            ) as Record<string, string>;
            const username = sessions[session];
            if (username) {
                const user = data.find((u) => u.username === username);
                if (user) return user;
            }
        } catch {
            /* ignore */
        }
    }

    const header = req.headers["authorization"];
    if (header && header.startsWith("Basic ")) {
        const decoded = Buffer.from(header.slice(6), "base64").toString();
        const [username, password] = decoded.split(":");
        const user = data.find(
            (u) => u.username === username && u.password === password
        );
        if (user) return user;
    }

    res.status(401).json({ message: "Unauthorized" });
    return null;
};
