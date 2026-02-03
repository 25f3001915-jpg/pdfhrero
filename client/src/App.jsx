import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import OfflineIndicator from './components/OfflineIndicator'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import MergePDF from './pages/tools/MergePDF'
import SplitPDF from './pages/tools/SplitPDF'
import CompressPDF from './pages/tools/CompressPDF'
import ImageToPDF from './pages/tools/ImageToPDF'
import OCR from './pages/tools/OCR'
import OrganizePDF from './pages/tools/OrganizePDF'
import PageNumbers from './pages/tools/PageNumbers'
import CompressImage from './pages/tools/CompressImage'
import ConvertImage from './pages/tools/ConvertImage'
import PDFToImage from './pages/tools/PDFToImage'
import RotatePDF from './pages/tools/RotatePDF'
import WatermarkPDF from './pages/tools/WatermarkPDF'
import ProtectPDF from './pages/tools/ProtectPDF'
import UnlockPDF from './pages/tools/UnlockPDF'
import WordToPDF from './pages/tools/WordToPDF'
import PDFToWord from './pages/tools/PDFToWord'
import SignPDF from './pages/tools/SignPDF'
import RedactPDF from './pages/tools/RedactPDF'
import ComparePDF from './pages/tools/ComparePDF'
import Maintenance from './pages/tools/Maintenance'
import HtmlToPDF from './pages/tools/HtmlToPDF'
import RepairPDF from './pages/tools/RepairPDF'
import PdfToPdfA from './pages/tools/PdfToPdfA'
import ExcelToPDF from './pages/tools/ExcelToPDF'
import PowerPointToPDF from './pages/tools/PowerPointToPDF'
import CropPDF from './pages/tools/CropPDF'
import EditPDF from './pages/tools/EditPDF'

function App() {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setDarkMode(true)
            document.documentElement.classList.add('dark')
        }
    }, [])



    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        if (!darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pricing" element={<Pricing />} />

                        {/* PDF Tools Routes */}
                        <Route path="/merge-pdf" element={<MergePDF />} />
                        <Route path="/split-pdf" element={<SplitPDF />} />
                        <Route path="/compress-pdf" element={<CompressPDF />} />
                        <Route path="/image-to-pdf" element={<ImageToPDF />} />
                        <Route path="/ocr" element={<OCR />} />
                        <Route path="/organize" element={<OrganizePDF />} />
                        <Route path="/page-numbers" element={<PageNumbers />} />
                        <Route path="/compress-image" element={<CompressImage />} />
                        <Route path="/convert-image" element={<ConvertImage />} />
                        <Route path="/pdf-to-image" element={<PDFToImage />} />
                        <Route path="/rotate-pdf" element={<RotatePDF />} />
                        <Route path="/watermark-pdf" element={<WatermarkPDF />} />
                        <Route path="/protect-pdf" element={<ProtectPDF />} />
                        <Route path="/unlock-pdf" element={<UnlockPDF />} />
                        <Route path="/word-to-pdf" element={<WordToPDF />} />
                        <Route path="/pdf-to-word" element={<PDFToWord />} />
                        <Route path="/sign-pdf" element={<SignPDF />} />
                        <Route path="/redact-pdf" element={<RedactPDF />} />
                        <Route path="/compare-pdf" element={<ComparePDF />} />

                        {/* Maintenance Routes for New Features */}
                        {/* Advanced Features Routes */}
                        <Route path="/pdf-to-powerpoint" element={<Maintenance />} /> {/* PDF->Office requires separate tool */}
                        <Route path="/pdf-to-excel" element={<Maintenance />} />
                        <Route path="/pdf-to-pdfa" element={<PdfToPdfA />} />
                        <Route path="/powerpoint-to-pdf" element={<PowerPointToPDF />} />
                        <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
                        <Route path="/edit-pdf" element={<EditPDF />} />
                        <Route path="/html-to-pdf" element={<HtmlToPDF />} />
                        <Route path="/repair-pdf" element={<RepairPDF />} />
                        <Route path="/scan-pdf" element={<Maintenance />} />
                        <Route path="/crop-pdf" element={<CropPDF />} />
                    </Routes>
                </main>
                <Footer />
                <OfflineIndicator />
                <InstallPrompt />
            </div>
        </Router>
    )
}

export default App
