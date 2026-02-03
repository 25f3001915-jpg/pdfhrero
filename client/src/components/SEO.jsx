import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, keywords, canonicalUrl }) {
    const siteTitle = 'PDFMasterPro - All-in-One PDF & Image Tools'
    const defaultDescription = 'Merge, Split, Compress, Convert, Edit PDF and Images for Free. The best online PDF and Image tools trusted by millions.'
    const defaultKeywords = 'pdf, image, merge pdf, split pdf, compress pdf, convert pdf, edit pdf, ocr, free pdf tools'
    const siteUrl = 'https://pdfmasterpro.com' // Replace with actual domain

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title ? `${title} | PDFMasterPro` : siteTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <link rel="canonical" href={canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || defaultDescription} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />

            {/* Structured Data for Software Application */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "PDFMasterPro",
                    "applicationCategory": "Productivity",
                    "operatingSystem": "Web",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "description": description || defaultDescription
                })}
            </script>
        </Helmet>
    )
}
