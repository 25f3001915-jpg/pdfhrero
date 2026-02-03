import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'

export default function Maintenance() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding flex items-center justify-center">
            <div className="container-custom max-w-2xl text-center">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <Construction className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4 gradient-text">Coming Soon!</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    We are working hard to bring you this feature. The PDFHero team is developing this tool to be perfect for you.
                </p>
                <Link to="/" className="btn-primary inline-flex items-center space-x-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Tools</span>
                </Link>
            </div>
        </div>
    )
}
