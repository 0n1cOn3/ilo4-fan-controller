import { NextApiRequest, NextApiResponse } from "next";
import { NodeSSH } from "node-ssh";

import { changeFanSpeedSchema } from "../../schemas/changeFanSpeed";
import { allowCors } from "../../lib/cors";
import { authenticate } from "../../lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticate(req, res);
    if (!user) return;
    try {
        const body = await changeFanSpeedSchema.validate(req.body);

        const ssh = new NodeSSH();

        await ssh.connect({
            host: process.env.ILO_HOST,
            username: process.env.ILO_USERNAME,
            password: process.env.ILO_PASSWORD,
            algorithms: {
                kex: ["diffie-hellman-group14-sha1"],
            },
        });

        for (let i = 0; i < body.fans.length; i++) {
            const fanID = i;
            const value = body.fans[i];

            const speed = ((value as any as number) / 100) * 255;

            await ssh.execCommand(`fan p ${fanID} lock ${speed}`);

            if (process.env.NODE_ENV === "development")
                console.log(
                    `DEBUG: Change Fan ${fanID} to speed ${speed} (SUCCESS)`
                );
        }
        ssh.dispose();

        res.json({ message: "ok" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export default allowCors(handler);
