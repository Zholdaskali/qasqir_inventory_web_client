import React from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, Bell } from 'lucide-react';

const DashboardPage = () => {
    const stats = [
        { title: 'Receivable', value: '7,265', change: '+11.02%', increase: true },
        { title: 'Credit Items', value: '3,671', change: '-0.03%', increase: false },
        { title: 'Stock Alert', value: '156', change: '+15.03%', increase: true },
        { title: 'Pending Weaving', value: '2,318', change: '+6.08%', increase: true },
    ];

    const activities = [
        { text: 'Changed the style.', time: 'Just now', user: 'User 1' },
        { text: 'Released a new version.', time: '59 minutes ago', user: 'User 2' },
        { text: 'Submitted a bug.', time: '12 hours ago', user: 'User 3' },
        { text: 'Modified A data in Page X.', time: 'Today, 11:59 AM', user: 'User 4' },
        { text: 'Deleted a page in Project X.', time: 'Feb 2, 2024', user: 'User 5' },
    ];

    const suppliers = [
        'Natali Craig',
        'Drew Cano',
        'Andi Lane',
        'Koray Okumus',
        'Kate Morrison',
        'Melody Macy',
    ];

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель аналитики</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`p-4 rounded-xl ${index % 4 === 0 ? 'bg-red-50' :
                            index % 4 === 1 ? 'bg-blue-50' :
                                index % 4 === 2 ? 'bg-pink-50' :
                                    'bg-purple-50'
                        }`}>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-bold">{stat.value}</span>
                            <div className={`flex items-center ${stat.increase ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.increase ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span className="text-sm">{stat.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold">Sales</h2>
                        <button className="p-2">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {['Linux', 'Mac', 'iOS', 'Windows', 'Android', 'Other'].map((platform) => (
                            <div key={platform} className="flex-1">
                                <div className="bg-blue-400 h-32 rounded-t-lg"></div>
                                <p className="text-xs text-center mt-2">{platform}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold">Sales</h2>
                        <button className="p-2">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {['Linux', 'Mac', 'iOS', 'Windows', 'Android', 'Other'].map((platform) => (
                            <div key={platform} className="flex-1">
                                <div className="bg-blue-400 h-32 rounded-t-lg"></div>
                                <p className="text-xs text-center mt-2">{platform}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="font-semibold mb-4">Upcoming Deadline</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="text-sm text-gray-600">
                                <th className="text-left pb-2">Order No.</th>
                                <th className="text-left pb-2">Deadline Date</th>
                                <th className="text-left pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((item) => (
                                <tr key={item} className="text-sm">
                                    <td className="py-2">Order No.</td>
                                    <td className="py-2">Deadline Date</td>
                                    <td className="py-2">Status</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="font-semibold mb-4">Overdue Deadline</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="text-sm text-gray-600">
                                <th className="text-left pb-2">Order No.</th>
                                <th className="text-left pb-2">Deadline Date</th>
                                <th className="text-left pb-2">Status</th>
                                <th className="text-left pb-2">Overdue Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((item) => (
                                <tr key={item} className="text-sm">
                                    <td className="py-2">Order No.</td>
                                    <td className="py-2">Deadline Date</td>
                                    <td className="py-2">Status</td>
                                    <td className="py-2">2 days</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;