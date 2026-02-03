import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
    FileText, TrendingUp, CheckCircle, BarChart3,
    Crown, Zap, Clock
} from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProcessed: 0,
        thisMonth: 0,
        successRate: 0,
        storageUsed: 0,
        totalUsers: 0
    });
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null)

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Fetch Stats
            // 1. Total Processed (Site Wide if admin, or just count)
            // Ideally site-wide.
            const { count: totalProcessed } = await supabase.from('processing_logs').select('*', { count: 'exact', head: true });

            // 2. This Month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: thisMonth } = await supabase.from('processing_logs')
                .select('*', { count: 'exact', head: true })
                .gte('timestamp', startOfMonth.toISOString());

            // 3. Success Rate
            const { data: successLogs } = await supabase.from('processing_logs').select('success');
            const totalLogs = successLogs?.length || 0;
            const successCount = successLogs?.filter(l => l.success).length || 0;
            const successRate = totalLogs > 0 ? (successCount / totalLogs) * 100 : 100;

            // 4. Storage Used (User Specific)
            // Using file_size in bytes.
            let storageUsed = 0;
            if (user) {
                const { data: userFiles } = await supabase.from('processing_logs').select('file_size').eq('user_id', user.id);
                if (userFiles) {
                    const totalBytes = userFiles.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
                    storageUsed = totalBytes / (1024 * 1024); // MB
                }
            }

            // 5. Unique Users (Site Wide)
            // Note: distinct count on user_id?
            // "select user_id"
            // This might be heavy if many rows. But for now ok.
            // Using a hack for distinct count in JS for now as Supabase simple count API is limited on distinct.
            // Or use an RPC if available. For now, just getting all user_ids (might be slow later).
            // Better: just count total logs for now if performance issue.
            // But let's try distinct logic client side for small scale.
            const { data: usersData } = await supabase.from('processing_logs').select('user_id');
            const uniqueUsers = new Set(usersData?.map(u => u.user_id).filter(id => id)).size;

            setStats({
                totalProcessed: totalProcessed || 0,
                thisMonth: thisMonth || 0,
                successRate: Math.round(successRate),
                storageUsed: Math.round(storageUsed * 100) / 100, // 2 decimals
                totalUsers: uniqueUsers || 0,
            });

            // Fetch History (Last 10)
            let query = supabase.from('processing_logs').select('*').order('timestamp', { ascending: false }).limit(10);
            if (user) {
                // If logged in, show USER history? Or global?
                // User probably wants their own history or global if admin?
                // Usually dashboard is personal.
                query = query.eq('user_id', user.id);
            }
            const { data: hist } = await query;
            setHistory(hist || []);
        };

        fetchStats();

        // Realtime Subscription
        const channel = supabase.channel('dashboard_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'processing_logs' }, () => {
                fetchStats(); // Refresh on new log
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Real-Time Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {user ? `Welcome back, ${user.email}` : 'Live System Stats'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    <div className="card p-6 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Processed</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProcessed}</p>
                        <FileText className="absolute top-6 right-6 text-blue-100 dark:text-blue-900 w-8 h-8" />
                    </div>
                    <div className="card p-6 border-l-4 border-green-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
                        <CalendarIcon className="absolute top-6 right-6 text-green-100 dark:text-green-900 w-8 h-8" />
                    </div>
                    <div className="card p-6 border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
                        <CheckCircle className="absolute top-6 right-6 text-yellow-100 dark:text-yellow-900 w-8 h-8" />
                    </div>
                    <div className="card p-6 border-l-4 border-purple-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Unique Users</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        <UsersIcon className="absolute top-6 right-6 text-purple-100 dark:text-purple-900 w-8 h-8" />
                    </div>
                    <div className="card p-6 border-l-4 border-red-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.storageUsed} MB</p>
                        <BarChart3 className="absolute top-6 right-6 text-red-100 dark:text-red-900 w-8 h-8" />
                    </div>
                </div>

                {/* History Table */}
                <div className="card p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        Live Processing History
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-dark-border text-left">
                                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Tool</th>
                                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">File Size</th>
                                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg animate-fade-in">
                                        <td className="py-3 px-4 font-medium capitalize text-gray-900 dark:text-white">{log.tool}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {log.file_size ? (log.file_size / 1024).toFixed(1) + ' KB' : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No activity recorded yet. Use a tool to see live updates!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CalendarIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

function UsersIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
