import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { compressPdf } from '../../lib/pdfUtils';

export default function CompressPDF() {
    const [file, setFile] = useState(null);
    const [level, setLevel] = useState('medium');

    return (
        <ToolPage title="Compress PDF" onConvert={() => file ? compressPdf(file, level) : alert('Select PDF')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Compression Level</label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                    >
                        <option value="low">Low (Max Compression, Lower Quality)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Best Quality, Less Compression)</option>
                    </select>
                </div>
            </div>
        </ToolPage>
    );
}
