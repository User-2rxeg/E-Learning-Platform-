// src/Components/layout/Header.tsx

import { useAuth } from '../../contexts/authContext';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center">
                <h2 className="text-xl font-semibold">Dashboard</h2>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border rounded-full py-1 px-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        🔍
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        🔔
                    </button>

                    <div className="flex items-center cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            {user?.fullName ? user.fullName.charAt(0) : '?'}
                        </div>
                        <span className="ml-2">{user?.fullName || 'User'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}