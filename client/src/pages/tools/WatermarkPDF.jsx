import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { addWatermark } from '../../lib/pdfUtils';

export default function WatermarkPDF() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('CONFIDENTIAL');

    return (
        <ToolPage title="Watermark PDF" onConvert={() => file ? addWatermark(file, text) : alert('Select PDF')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Watermark Text</label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                        placeholder="Enter watermark text..."
                    />
                </div>
            </div>
        </ToolPage>
    );
}
