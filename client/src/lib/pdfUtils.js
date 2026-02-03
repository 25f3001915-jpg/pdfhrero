import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Helper: Download PDF
const downloadPdf = (pdfBytes, filename) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, filename);
};

// 1. Merge PDF
export const mergePdfs = async (files, onProgress) => {
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await pdfDoc.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
        if (onProgress) onProgress(((i + 1) / files.length) * 100);
    }

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'merged.pdf');
};

// 2. Split PDF
export const splitPdf = async (file, ranges, onProgress) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPageIndices();

    const newPdf = await PDFDocument.create();
    // ranges e.g. "1,3-5"
    const rangeArray = ranges.split(',').flatMap((r) => {
        if (r.includes('-')) {
            const [start, end] = r.split('-').map(Number);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
        }
        return [Number(r) - 1];
    });

    for (let i = 0; i < rangeArray.length; i++) {
        const pageIndex = rangeArray[i];
        if (pageIndex >= 0 && pageIndex < pages.length) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
            newPdf.addPage(copiedPage);
        }
        if (onProgress) onProgress(((i + 1) / rangeArray.length) * 100);
    }

    const pdfBytes = await newPdf.save();
    downloadPdf(pdfBytes, 'split.pdf');
};

// 3. Compress PDF (Advanced - remove objects, useObjectStreams false)
export const compressPdf = async (file, level = 'medium') => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Note: pdf-lib compression is limited, this mainly optimizes structure
    const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
    });

    downloadPdf(pdfBytes, 'compressed.pdf');
};

// 4. JPG to PDF (Batch + Scaling)
export const imagesToPdf = async (files, onProgress) => {
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(arrayBuffer);
        else if (file.type === 'image/png') image = await pdfDoc.embedPng(arrayBuffer);
        else throw new Error('Only JPG/PNG supported');

        const page = pdfDoc.addPage([image.width * 0.8, image.height * 0.8]);
        const { width, height } = page.getSize();
        page.drawImage(image, {
            x: 40,
            y: 40,
            width: width - 80,
            height: height - 80,
        });

        if (onProgress) onProgress(((i + 1) / files.length) * 100);
    }

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'images-to-pdf.pdf');
};

// 6. Rotate PDF
export const rotatePdf = async (file, degrees) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => page.setRotation(degrees));

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'rotated.pdf');
};

// 7. Watermark (Text/Image)
export const addWatermark = async (file, text, opacity = 0.3) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(text, {
            x: width / 2 - 100,
            y: height / 2,
            size: 50,
            font,
            color: rgb(0.8, 0.8, 0.8),
            opacity,
            rotate: { type: 'degrees', angle: -45 },
        });
    });

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'watermarked.pdf');
};

// 8. Add Page Numbers
export const addPageNumbers = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        page.drawText(`${index + 1}`, {
            x: width - 50,
            y: 30,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        });
    });

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'numbered.pdf');
};

// 9. Protect PDF (Password)
export const protectPdf = async (file, password) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false,
        },
    });

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'protected.pdf');
};

// 10. Unlock PDF (if password known)
export const unlockPdf = async (file, password) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'unlocked.pdf');
};

// 11. Crop PDF (Advanced - select area)
export const cropPdf = async (file, cropData) => {
    // cropData: { x, y, width, height }
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
        page.setCropBox(cropData.x, cropData.y, cropData.width, cropData.height);
    });

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'cropped.pdf');
};

// 12. Organize PDF (Rearrange + Delete pages)
export const organizePdf = async (file, newOrder) => { // newOrder = [2,1,4,3] for rearrange
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    for (const index of newOrder) {
        if (index > 0 && index <= pdfDoc.getPageCount()) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [index - 1]);
            newPdf.addPage(copiedPage);
        }
    }

    const pdfBytes = await newPdf.save();
    downloadPdf(pdfBytes, 'organized.pdf');
};

// 13. Basic Edit PDF (Add text at position)
export const editPdf = async (file, edits) => { // edits: [{ page: 1, text: '', x: 0, y: 0 }]
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    edits.forEach((edit) => {
        if (edit.page <= pdfDoc.getPageCount()) {
            const page = pdfDoc.getPage(edit.page - 1);
            page.drawText(edit.text, {
                x: edit.x,
                y: edit.y,
                size: 20,
                font,
                color: rgb(0, 0, 0),
            });
        }
    });

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'edited.pdf');
};

// 14. PDF/A Conversion (Basic - add metadata)
export const toPdfA = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.setTitle('PDF/A Document');
    pdfDoc.setCreator('PDFMasterPro');
    pdfDoc.setProducer('PDFMasterPro');

    const pdfBytes = await pdfDoc.save();
    downloadPdf(pdfBytes, 'pdf-a.pdf');
};
