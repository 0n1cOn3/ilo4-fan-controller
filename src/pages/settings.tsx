import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";

interface User {
    username: string;
    role: string;
}

const Settings = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch("/api/users")
            .then((r) => r.json())
            .then(setUsers);
    }, []);

    return (
        <div className="h-screen text-white bg-gray-800 p-4">
            <h1 className="text-2xl mb-4">User Management</h1>
            <ul className="space-y-2">
                {users.map((u) => (
                    <li key={u.username} className="bg-gray-900 p-2 rounded">
                        {u.username} - {u.role}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const auth = req.cookies["session"];
    if (!auth) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }
    return { props: {} };
};

export default Settings;
