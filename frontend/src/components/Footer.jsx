import React from 'react';

const Footer = () => {
    const footerLinks = {
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press', href: '#' },
            { label: 'Blog', href: '#' },
        ],
        support: [
            { label: 'Help Center', href: '#' },
            { label: 'FAQ', href: '#' },
            { label: 'Contact', href: '#' },
            { label: 'Status', href: '#' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
        ],
    };

    const socialIcons = [
        { name: 'Twitter', icon: '𝕏' },
        { name: 'LinkedIn', icon: 'in' },
        { name: 'GitHub', icon: '◉' },
    ];

    return (
        <footer className="relative z-20 bg-black border-t border-gray-900 mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <div className="text-2xl font-black tracking-tight mb-4">
                            TRACK<span className="text-[#5ac53b]">BETS</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            AI-powered investment tracking and insights for smarter decisions.
                        </p>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support links */}
                    <div>
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-900">
                    {/* Social icons */}
                    <div className="flex gap-4 mb-4 md:mb-0">
                        {socialIcons.map((social) => (
                            <a
                                key={social.name}
                                href="#"
                                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-bold text-sm"
                                aria-label={social.name}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className="text-gray-600 text-sm">
                        © 2026 TrackBets. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
