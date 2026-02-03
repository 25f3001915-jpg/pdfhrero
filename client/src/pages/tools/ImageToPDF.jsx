import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import ToolPage from '../../components/ToolPage';

export default function ImageToPDF() {
    const [files, setFiles] = useState([]);

    const convertToPdf = async () => {
        if (files.length === 0) throw new Error('Select images');

        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            let image;

            if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(arrayBuffer);
            else if (file.type === 'image/png') image = await pdfDoc.embedPng(arrayBuffer);
            else throw new Error('Only JPG/PNG supported');

            // Auto orientation & margins
            const isLandscape = image.width > image.height;
            // Basic page size based on image dimensions
            const page = pdfDoc.addPage(isLandscape ? [image.width, image.height] : [image.height, image.width]);

            const { width, height } = page.getSize();

            // Smart scaling with margins (50px padding support)
            // If image is huge, this scales it to fit page. If page is exactly image size, it might crop?
            // User code: page size = [w, h]. Then draws at x/2, y/2 with scale.
            // Wait, if page size matches image size, we don't need to scale down unless we WANT margins.
            // User Logic: `const scale = Math.min((width - 100) / image.width, (height - 100) / image.height);`
            // This enforces 50px margin on all sides.

            const scale = Math.min((width - 100) / image.width, (height - 100) / image.height);

            page.drawImage(image, {
                x: width / 2 - (image.width * scale) / 2,
                y: height / 2 - (image.height * scale) / 2,
                width: image.width * scale,
                height: image.height * scale,
            });

            // Report progress via custom event or callback if ToolPage supported it?
            // ToolPage.jsx template has local state `progress` but doesn't accept a setter from `onConvert` directly unless passed.
            // My `ToolPage.jsx` definition: `await onConvert();`
            // It does NOT pass `setProgress`.
            // I need to update ToolPage.jsx to pass `setProgress` to `onConvert`!
            // FAILURE POINT: The user's ToolPage template DOES pass `setProgress`?
            // Step 646: `onConvert: () => Promise<void>` in interface. But logic: `const handleConvert = ... await onConvert();`.
            // The previous `mergePdfs` used `onProgress`.
            // I need to Fix `ToolPage.jsx` to pass `setProgress`.
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, 'images-to-pdf.pdf');
    };

    return (
        <ToolPage title="JPG/PNG to PDF (Advanced)" onConvert={convertToPdf}>
            <div className="space-y-6">
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-gray-600 dark:text-gray-400">
                    {files.length} images selected.
                    Smart auto-orientation and margins included.
                </p>
            </div>
        </ToolPage>
    );
}
