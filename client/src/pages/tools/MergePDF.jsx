import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { mergePdfs } from '../../lib/pdfUtils';

export default function MergePDF() {
    const [files, setFiles] = useState([]);

    return (
        <ToolPage title="Merge PDF" onConvert={() => files.length > 1 ? mergePdfs(files) : alert('Select at least 2 PDFs')}>
            <div className="space-y-4">
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {files.length > 0 && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-semibold mb-2">{files.length} PDFs selected:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 max-h-40 overflow-y-auto">
                            {files.map((f, i) => <li key={i}>{f.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </ToolPage>
    );
}
