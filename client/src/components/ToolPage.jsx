import { useState } from 'react';

import { logProcessing } from '../lib/logging';

const ToolPage = ({ title, children, onConvert }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleConvert = async () => {
        setLoading(true);
        setProgress(0);
        try {
            await onConvert(setProgress);
            // Log Success
            logProcessing(title, true);
        } catch (err) {
            // Log Failure
            logProcessing(title, false);
            alert('Error: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white">
            <h1 className="text-3xl font-bold mb-6 gradient-text text-center">{title}</h1>
            <div className="card p-8 shadow-lg">
                {children}

                <button
                    onClick={handleConvert}
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg disabled:opacity-50 transition-all shadow-md"
                >
                    {loading ? `Processing... ${progress > 0 ? progress.toFixed(0) + '%' : ''}` : 'Start Processing'}
                </button>
            </div>

        </div>
    );
};

export default ToolPage;
