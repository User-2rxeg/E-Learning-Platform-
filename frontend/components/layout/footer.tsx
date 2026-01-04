'use client';

import Link from 'next/link';
import {
    BookOpen,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Youtube,
    ArrowRight
} from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        Platform: [
            { name: 'About Us', href: '/about' },
            { name: 'How It Works', href: '/how-it-works' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Testimonials', href: '/testimonials' }
        ],
        Learn: [
            { name: 'Browse Courses', href: '/courses' },
            { name: 'Categories', href: '/categories' },
            { name: 'Instructors', href: '/instructors' },
            { name: 'Certificates', href: '/certificates' }
        ],
        Support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Feedback', href: '/feedback' }
        ],
        Resources: [
            { name: 'Blog', href: '/blog' },
            { name: 'Community', href: '/community' },
            { name: 'Career Center', href: '/careers' },
            { name: 'Privacy Policy', href: '/privacy' }
        ]
    };

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-gray-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-6 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                EduLearn
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering learners worldwide with quality education, practical skills, and expert mentorship for a brighter future.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 hover:border-transparent transition-all duration-300"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-semibold mb-5 text-lg">{title}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <div className="mt-16 pt-10 border-t border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-gray-400">
                                Subscribe to get the latest courses, learning tips, and exclusive offers.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                                Subscribe
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-10 pt-8 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                <span className="text-white font-medium">support@edulearn.com</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                                <span className="text-white font-medium">+1 (555) 123-4567</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                                <span className="text-white font-medium">Cairo, Egypt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-black/20 py-5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} EduLearn. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6">
                            <Link href="/terms" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">
                                Terms of Service
                            </Link>
                            <Link href="/privacy" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">
                                Privacy Policy
                            </Link>
                            <Link href="/cookies" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

