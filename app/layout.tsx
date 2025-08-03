import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "Image Palette - Extract Dominant Colors from Any Image",
    template: "%s | Image Palette"
  },
  description: "Extract dominant colors from any image instantly. Advanced color extraction tool with HEX and RGB outputs. Perfect for designers, developers, and creatives.",
  
  // Keywords for SEO
  keywords: [
    "color extractor",
    "image palette",
    "color picker",
    "dominant colors",
    "hex color",
    "rgb color",
    "design tools",
    "color analysis",
    "palette generator",
    "image colors",
    "color extraction",
    "web design",
    "graphic design",
    "color scheme",
    "brutalist design"
  ],

  // Author and creator info
  authors: [{ name: "Shaikh Rumman Fardeen" }],
  creator: "Shaikh Rumman Fardeen",
  publisher: "Image Palette",

  // Canonical URL
  metadataBase: new URL('https://color-palette-gen-from-image.netlify.app'),
  alternates: {
    canonical: '/',
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://color-palette-gen-from-image.netlify.app',
    title: 'Image Palette - Extract Dominant Colors from Any Image',
    description: 'Extract dominant colors from any image instantly. Advanced color extraction tool with HEX and RGB outputs. Perfect for designers, developers, and creatives.',
    siteName: 'Image Palette',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Image Palette - Color Extraction Tool',
        type: 'image/png',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Image Palette - Extract Dominant Colors from Any Image',
    description: 'Extract dominant colors from any image instantly. Advanced color extraction tool with HEX and RGB outputs.',
    images: ['/images/og-image.png'],
    creator: '@srummanf', 
  },

  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // App-specific
  applicationName: 'Image Palette',
  category: 'Design Tools',
  
  // Favicon and app icons
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },

  // Manifest for PWA
  manifest: '/site.webmanifest',

  // Verification (add your verification codes)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   other: {
  //     'msvalidate.01': 'your-bing-verification-code',
  //   },
  // },

  // Additional structured data
  other: {
    'theme-color': '#000000',
    'color-scheme': 'dark light',
    'format-detection': 'telephone=no',
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased vsc-domain-localhost vsc-initialized`}
      >
        {children}
      </body>
    </html>
  );
}
