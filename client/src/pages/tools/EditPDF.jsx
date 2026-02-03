import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { editPdf } from '../../lib/pdfUtils';

export default function EditPDF() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [page, setPage] = useState(1);
    const [x, setX] = useState(100);
    const [y, setY] = useState(500);

    const edits = [
        { page, text, x, y },
    ];

    return (
        <ToolPage title="Edit PDF (Add Text)" onConvert={() => file ? editPdf(file, edits) : alert('Select PDF')}>
            <div className="space-y-4">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Text to Add</label>
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2 text-black" placeholder="Enter text..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Page Number</label>
                        <input type="number" value={page} onChange={(e) => setPage(Number(e.target.value))} className="w-full border rounded p-2 text-black" min="1" />
                    </div>
                    <div>
                        {/* Spacer */}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">X Position</label>
                        <input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Y Position</label>
                        <input type="number" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                </div>
            </div>
        </ToolPage>
    );
}
