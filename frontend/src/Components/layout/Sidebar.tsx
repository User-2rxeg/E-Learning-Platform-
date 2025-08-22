// src/Components/layout/Sidebar.tsx

import Link from 'next/link';
import { useAuth } from '../../contexts/authContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">EduLearn</h1>
            </div>

            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/courses" className="block p-2 hover:bg-gray-700 rounded">
                            Courses
                        </Link>
                    </li>
                    <li>
                        <Link href="/assignments" className="block p-2 hover:bg-gray-700 rounded">
                            Assignments
                        </Link>
                    </li>
                    <li>
                        <Link href="/progress" className="block p-2 hover:bg-gray-700 rounded">
                            My Progress
                        </Link>
                    </li>
                    <li>
                        <Link href="/calendar" className="block p-2 hover:bg-gray-700 rounded">
                            Calendar
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="mt-auto pt-8">
                <button
                    onClick={logout}
                    className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}