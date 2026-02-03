import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { splitPdf } from '../../lib/pdfUtils';

export default function SplitPDF() {
    const [file, setFile] = useState(null);
    const [ranges, setRanges] = useState('1');

    return (
        <ToolPage title="Split PDF" onConvert={() => file ? splitPdf(file, ranges) : alert('Select PDF')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Page Ranges</label>
                    <input
                        type="text"
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        placeholder="e.g. 1, 3-5 (Extracts pages 1, 3, 4, 5)"
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter page numbers or ranges separated by commas.</p>
                </div>
            </div>
        </ToolPage>
    );
}
