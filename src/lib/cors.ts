import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const allowCors = (handler: NextApiHandler): NextApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET,POST,DELETE,OPTIONS"
        );
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        return handler(req, res);
    };
};
