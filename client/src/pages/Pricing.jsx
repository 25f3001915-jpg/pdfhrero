import { useState, useEffect } from 'react'
import { 
    Check, X, Star, Zap, 
    Users, HardDrive, Clock, 
    Shield, FileText, TrendingUp,
    Crown, Award, BadgeCheck
} from 'lucide-react'

export default function Pricing() {
    const [user, setUser] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState('pro')
    
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            period: 'forever',
            description: 'Perfect for getting started with basic PDF tools',
            features: [
                '100 files per month',
                '10MB file size limit',
                'Basic PDF tools (Merge, Split, Compress)',
                'Standard processing speed',
                'Email support'
            ],
            notIncluded: [
                'Batch processing',
                'Custom workflows',
                'Priority processing',
                'Advanced security features'
            ],
            popular: false,
            color: 'gray'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 999,
            period: 'per month',
            description: 'Ideal for professionals and small businesses',
            features: [
                '1,000 files per month',
                '50MB file size limit',
                'All PDF tools including advanced features',
                'Batch processing (3 concurrent jobs)',
                'Custom workflows',
                'Priority processing',
                'Email & chat support'
            ],
            notIncluded: [
                'Offline access',
                'Dedicated account manager'
            ],
            popular: true,
            color: 'blue'
        },
        {
            id: 'business',
            name: 'Business',
            price: 2999,
            period: 'per month',
            description: 'For teams and growing businesses',
            features: [
                '5,000 files per month',
                '100MB file size limit',
                'All Pro features',
                'Batch processing (5 concurrent jobs)',
                'Advanced security features',
                'Team collaboration tools',
                'API access',
                'Priority support with SLA'
            ],
            notIncluded: [
                'Custom development',
                'White-label solution'
            ],
            popular: false,
            color: 'purple'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 9999,
            period: 'per month',
            description: 'For large organizations with custom needs',
            features: [
                'Unlimited files per month',
                '500MB file size limit',
                'All Business features',
                'Batch processing (10 concurrent jobs)',
                'Offline desktop application',
                'Custom API integrations',
                'Dedicated account manager',
                '24/7 premium support',
                'Custom development available',
                'White-label solution'
            ],
            notIncluded: [],
            popular: false,
            color: 'yellow'
        }
    ]

    useEffect(() => {
        // Check user's current plan
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    const data = await response.json()
                    if (data.success) {
                        setUser(data.user)
                        // Set default selected plan based on current plan
                        if (data.user.subscription.tier !== 'free') {
                            setSelectedPlan(data.user.subscription.tier)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            }
        }
        fetchUser()
    }, [])

    const handleSubscribe = async (planId) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                window.location.href = '/login'
                return
            }

            const response = await fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId })
            })

            const data = await response.json()
            
            if (data.success) {
                if (data.checkoutUrl) {
                    // Redirect to Stripe checkout
                    window.location.href = data.checkoutUrl
                } else {
                    // Free plan - already handled
                    alert('Plan updated successfully!')
                    window.location.reload()
                }
            } else {
                alert(data.message || 'Failed to create checkout session')
            }
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Failed to process subscription')
        }
    }

    const getButtonClass = (planId) => {
        if (user?.subscription?.tier === planId) {
            return 'w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors'
        }
        if (planId === 'free') {
            return 'w-full py-3 px-6 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors'
        }
        return 'w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors'
    }

    const getButtonText = (planId) => {
        if (user?.subscription?.tier === planId) {
            return 'Current Plan'
        }
        if (planId === 'free') {
            return 'Get Started Free'
        }
        return 'Upgrade Now'
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            {/* Hero Section */}
            <section className="section-padding bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90">
                        Scale your PDF processing from individual use to enterprise needs. 
                        All plans include our core PDF tools with no hidden fees.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {plans.map((plan) => (
                            <div 
                                key={plan.id}
                                className={`card relative overflow-hidden ${
                                    plan.popular 
                                        ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-dark-bg' 
                                        : ''
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {plan.description}
                                        </p>
                                        
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                ₹{plan.price}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                                    /{plan.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Included Features
                                        </h3>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {plan.notIncluded.length > 0 && (
                                        <div className="space-y-4 mb-8">
                                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <X className="w-5 h-5 text-red-500" />
                                                Not Included
                                            </h3>
                                            <ul className="space-y-3">
                                                {plan.notIncluded.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-500 dark:text-gray-500">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        className={getButtonClass(plan.id)}
                                        disabled={user?.subscription?.tier === plan.id}
                                    >
                                        {getButtonText(plan.id)}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="section-padding bg-white dark:bg-dark-card">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Feature Comparison
                    </h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Feature</th>
                                    {plans.map((plan) => (
                                        <th key={plan.id} className="text-center py-4 px-6">
                                            <span className={`font-semibold ${
                                                plan.id === 'free' ? 'text-gray-700 dark:text-gray-300' :
                                                plan.id === 'pro' ? 'text-blue-600' :
                                                plan.id === 'business' ? 'text-purple-600' :
                                                'text-yellow-600'
                                            }`}>
                                                {plan.name}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                                <tr>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Monthly File Limit</td>
                                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">100</td>
                                    <td className="py-4 px-6 text-center text-blue-600 font-semibold">1,000</td>
                                    <td className="py-4 px-6 text-center text-purple-600 font-semibold">5,000</td>
                                    <td className="py-4 px-6 text-center text-yellow-600 font-semibold">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">File Size Limit</td>
                                    <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">10MB</td>
                                    <td className="py-4 px-6 text-center text-blue-600 font-semibold">50MB</td>
                                    <td className="py-4 px-6 text-center text-purple-600 font-semibold">100MB</td>
                                    <td className="py-4 px-6 text-center text-yellow-600 font-semibold">500MB</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Batch Processing</td>
                                    <td className="py-4 px-6 text-center">
                                        <X className="w-5 h-5 text-red-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Custom Workflows</td>
                                    <td className="py-4 px-6 text-center">
                                        <X className="w-5 h-5 text-red-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Priority Processing</td>
                                    <td className="py-4 px-6 text-center">
                                        <X className="w-5 h-5 text-red-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-padding">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Frequently Asked Questions
                    </h2>
                    
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="card p-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                                Can I change my plan later?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes, you can upgrade or downgrade your plan at any time. 
                                Upgrades are prorated, and downgrades take effect at the end of your billing cycle.
                            </p>
                        </div>
                        
                        <div className="card p-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We accept all major credit cards through our secure payment processor. 
                                All transactions are encrypted and PCI compliant.
                            </p>
                        </div>
                        
                        <div className="card p-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                                Is there a free trial?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! You can start with our free plan to test all basic features. 
                                Premium plans come with a 14-day money-back guarantee.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}