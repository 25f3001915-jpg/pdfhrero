import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { rotatePdf } from '../../lib/pdfUtils';

export default function RotatePDF() {
    const [file, setFile] = useState(null);
    const [degrees, setDegrees] = useState(90);

    return (
        <ToolPage title="Rotate PDF" onConvert={() => file ? rotatePdf(file, degrees) : alert('Select PDF')}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div>
                    <label className="block text-sm font-medium mb-2">Rotation Angle</label>
                    <select
                        value={degrees}
                        onChange={(e) => setDegrees(Number(e.target.value))}
                        className="w-full border p-3 rounded-lg text-black bg-gray-50"
                    >
                        <option value={90}>90° Clockwise</option>
                        <option value={180}>180°</option>
                        <option value={270}>270° Clockwise (90° Counter-Clockwise)</option>
                    </select>
                </div>
            </div>
        </ToolPage>
    );
}
