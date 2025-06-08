import { useState } from "react";
import { useRouter } from "next/router";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const r = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (r.ok) {
            router.push("/");
        } else {
            const data = await r.json();
            setError(data.message);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-800 text-white">
            <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded shadow w-80">
                <h1 className="text-xl mb-4 font-semibold text-center">Login</h1>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <input
                    className="w-full mb-2 p-2 bg-gray-800 rounded"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full mb-4 p-2 bg-gray-800 rounded"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 p-2 rounded" type="submit">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
