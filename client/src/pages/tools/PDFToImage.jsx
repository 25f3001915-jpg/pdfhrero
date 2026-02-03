import { useState } from 'react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import ToolPage from '../../components/ToolPage';

// pdf.js worker setup
// Using CDN for worker to ensure it loads correctly without complex build config
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFToImage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const convertToJpg = async () => {
        if (!file) return alert('Select PDF');

        setLoading(true);
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 }); // High quality (Scale 2.0)

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                // Convert canvas to blob and save
                await new Promise((resolve) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            saveAs(blob, `page-${pageNum}.jpg`);
                            resolve();
                        }
                    }, 'image/jpeg', 0.95); // High quality JPEG
                });

                setProgress((pageNum / numPages) * 100);
            }

            // alert('All pages converted to JPG!'); // ToolPage handles alerting? No, let's keep it clean.
            // ToolPage doesn't have consistent success feedback yet other than finishing.
            // I'll leave the success alert in the finally block if needed, but the ToolPage template doesn't handle success message distinctively.
            // saveAs triggers download, so user knows.
        } catch (err) {
            console.error(err);
            throw new Error(err.message); // Propagate to ToolPage error handler
        } finally {
            // setLoading(false); // ToolPage handles this
            // setProgress(0);
        }
    };

    return (
        <ToolPage title="PDF to JPG" onConvert={convertToJpg}>
            <div className="space-y-6">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-gray-600 dark:text-gray-400">
                    Converts each page of your PDF into substantial quality JPG images.
                    Processed entirely in your browser.
                </p>
            </div>
        </ToolPage>
    );
}
