import { Link } from 'react-router-dom';
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiFacebook,
    FiTwitter,
    FiLinkedin,
    FiInstagram
} from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Footer links organized by category
    const footerLinks = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Demo', href: '#demo' },
        ],
        company: [
            { name: 'About Us', href: '#about' },
            { name: 'Our Story', href: '#story' },
            { name: 'Careers', href: '#careers' },
            { name: 'Contact', href: '#contact' },
        ],
        resources: [
            { name: 'Blog', href: '#blog' },
            { name: 'Help Center', href: '#help' },
            { name: 'User Guide', href: '#guide' },
            { name: 'FAQs', href: '#faq' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '#privacy' },
            { name: 'Terms of Service', href: '#terms' },
            { name: 'Refund Policy', href: '#refund' },
            { name: 'Cookie Policy', href: '#cookies' },
        ],
    };

    return (
        <footer className="bg-[#000047] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <h3 className="text-3xl font-bold text-primary mb-4">VyapaarSaathi</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            AI-powered operations assistant for small businesses.
                            24/7 monitoring, smart alerts, and automated decision-making –
                            All in one platform!
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <FiMail className="text-secondary mt-1 flex-shrink-0" />
                                <a href="mailto:support@opsagent.com" className="text-gray-300 hover:text-secondary transition-colors">
                                    support@vyapaarsaathi.com
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiPhone className="text-secondary mt-1 flex-shrink-0" />
                                <a href="tel:+911234567890" className="text-gray-300 hover:text-secondary transition-colors">
                                    +91 123-456-7890
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMapPin className="text-secondary mt-1 flex-shrink-0" />
                                <span className="text-gray-300">
                                    Mumbai, Maharashtra, India
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-secondary transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-secondary transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-secondary transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Newsletter Subscription */}
                <div className="border-t border-gray-700 pt-8 mb-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h4 className="text-xl font-bold mb-3">Stay Updated </h4>
                        <p className="text-gray-300 mb-4">
                            The latest tips, features, and offers directly to your inbox!                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-1 px-4 py-3 rounded-lg text-textMain  border-1 border-grey-700 outline-none"
                            />
                            <button className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:border-green-600 transition-colors border-1 border-white">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                        {/* Copyright */}
                        <p className="text-gray-400 text-sm">
                            © {currentYear} VyapaarSaathi. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-secondary transition-colors"
                            >
                                <FiFacebook className="text-2xl" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-secondary transition-colors"
                            >
                                <FiTwitter className="text-2xl" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-secondary transition-colors"
                            >
                                <FiLinkedin className="text-2xl" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-secondary transition-colors"
                            >
                                <FiInstagram className="text-2xl" />
                            </a>
                        </div>

                        {/* Legal Links */}
                        <div className="flex gap-4 text-sm">
                            {footerLinks.legal.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-gray-400 hover:text-secondary transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;