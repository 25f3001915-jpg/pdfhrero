import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!showNotification) return null

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
        }`}>
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <Wifi className="w-5 h-5" />
                ) : (
                    <WifiOff className="w-5 h-5" />
                )}
                <span className="font-medium">
                    {isOnline ? 'Back online' : 'Offline mode'}
                </span>
            </div>
        </div>
    )
}