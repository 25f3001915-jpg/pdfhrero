import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { organizePdf } from '../../lib/pdfUtils';

export default function OrganizePDF() {
    const [file, setFile] = useState(null);
    const [order, setOrder] = useState('1,2,3');

    const handleConvert = () => {
        if (!file) return alert('Select PDF');
        const newOrder = order.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
        return organizePdf(file, newOrder);
    };

    return (
        <ToolPage title="Organize PDF" onConvert={handleConvert}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Page Order (Comma separated)</label>
                    <input
                        type="text"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="e.g. 3, 1, 2 (Rearranges pages)"
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter page numbers in the desired new order.</p>
                </div>
            </div>
        </ToolPage>
    );
}
