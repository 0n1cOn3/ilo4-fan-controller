import { NextApiRequest, NextApiResponse } from "next";
import { NodeSSH } from "node-ssh";
import { allowCors } from "../../lib/cors";
import { authenticate } from "../../lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticate(req, res);
    if (!user) return;
    try {
        const ssh = new NodeSSH();

        await ssh.connect({
            host: process.env.ILO_HOST,
            username: process.env.ILO_USERNAME,
            password: process.env.ILO_PASSWORD,
            algorithms: {
                kex: ["diffie-hellman-group14-sha1"],
            },
        });

        await ssh.execCommand(`fan p global unlock`);
        res.json({ message: "ok" });
        ssh.dispose();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export default allowCors(handler);
