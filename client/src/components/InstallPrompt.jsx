import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later
            setDeferredPrompt(e)
            // Show the install prompt
            setShowInstallPrompt(true)
        }

        const handleAppInstalled = () => {
            // Clear the deferredPrompt
            setDeferredPrompt(null)
            // Hide the install prompt
            setShowInstallPrompt(false)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
        
        if (outcome === 'accepted') {
            setShowInstallPrompt(false)
        }
    }

    const handleClose = () => {
        setShowInstallPrompt(false)
        // Don't show again for this session
        sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    // Don't show if user already dismissed or app is already installed
    if (!showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Install PDFMasterPro
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add to your home screen for quick access and offline use
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium py-2 px-4 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    )
}