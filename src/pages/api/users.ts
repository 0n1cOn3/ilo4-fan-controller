import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import { User } from "../../types/User";
import { allowCors } from "../../lib/cors";
import { authenticate } from "../../lib/auth";

const file = path.join(process.cwd(), "data", "users.json");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticate(req, res);
    if (!user) return;
    const data = JSON.parse(await fs.readFile(file, "utf-8")) as User[];
    if (req.method === "GET") {
        return res.json(data.map(({ password, ...rest }) => rest));
    }
    if (req.method === "POST") {
        const { username, password, role } = req.body;
        if (!username || !password || !role)
            return res.status(400).json({ message: "Missing fields" });
        if (data.find((u) => u.username === username))
            return res.status(409).json({ message: "User exists" });
        data.push({ username, password, role });
        await fs.writeFile(file, JSON.stringify(data, null, 4));
        return res.json({ message: "created" });
    }
    if (req.method === "DELETE") {
        const { username } = req.body;
        const idx = data.findIndex((u) => u.username === username);
        if (idx === -1) return res.status(404).json({ message: "User not found" });
        data.splice(idx, 1);
        await fs.writeFile(file, JSON.stringify(data, null, 4));
        return res.json({ message: "deleted" });
    }
    res.status(405).end();
};

export default allowCors(handler);
