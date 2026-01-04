
import Link from 'next/link';
import {
    BookOpen,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Mail,
    MapPin,
    Phone
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
            { name: 'Terms of Service', href: '/terms' }
        ],
        Resources: [
            { name: 'Blog', href: '/blog' },
            { name: 'Community', href: '/community' },
            { name: 'Career Center', href: '/careers' },
            { name: 'Privacy Policy', href: '/privacy' }
        ]
    };
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">EduLearn</span>
                        </Link>
                        <p className="text-gray-400 mb-4">
                            Empowering learners worldwide with quality education and practical skills for the future.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-semibold mb-4">{title}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-semibold mb-4">Subscribe to our Newsletter</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Get the latest courses and updates delivered to your inbox.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>support@edulearn.com</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>Cairo, Egypt</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-gray-950 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                        <p className="text-gray-500">
                            © 2024 EduLearn. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-2 sm:mt-0">
                            <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Privacy
                            </Link>
                            <Link href="/cookies" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}