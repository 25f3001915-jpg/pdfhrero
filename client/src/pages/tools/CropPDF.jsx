import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { cropPdf } from '../../lib/pdfUtils';

export default function CropPDF() {
    const [file, setFile] = useState(null);
    const [x, setX] = useState(50);
    const [y, setY] = useState(50);
    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(700);

    return (
        <ToolPage title="Crop PDF" onConvert={() => file ? cropPdf(file, { x, y, width, height }) : alert('Select PDF')}>
            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">X Coordinate</label>
                        <input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Y Coordinate</label>
                        <input type="number" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Width</label>
                        <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Height</label>
                        <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full border rounded p-2 text-black" />
                    </div>
                </div>
                <p className="text-sm text-gray-500">Note: Enter coordinates to crop. (Interactive visual cropper coming soon)</p>
            </div>
        </ToolPage>
    );
}
