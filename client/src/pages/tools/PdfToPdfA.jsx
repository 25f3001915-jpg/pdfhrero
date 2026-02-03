import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { toPdfA } from '../../lib/pdfUtils';

export default function PdfToPdfA() {
    const [file, setFile] = useState(null);

    return (
        <ToolPage title="Convert PDF to PDF/A" onConvert={() => file ? toPdfA(file) : alert('Select PDF')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-gray-600 dark:text-gray-400">
                    Converts document to PDF/A format (ISO standard for long-term archiving).
                    Sets metadata Creator and Producer to PDFMasterPro.
                </p>
            </div>
        </ToolPage>
    );
}
