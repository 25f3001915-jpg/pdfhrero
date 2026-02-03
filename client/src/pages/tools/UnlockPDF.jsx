import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { unlockPdf } from '../../lib/pdfUtils';

export default function UnlockPDF() {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');

    return (
        <ToolPage title="Unlock PDF" onConvert={() => file && password ? unlockPdf(file, password) : alert('Select PDF and enter password')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                        placeholder="Enter password to unlock..."
                    />
                </div>
            </div>
        </ToolPage>
    );
}
