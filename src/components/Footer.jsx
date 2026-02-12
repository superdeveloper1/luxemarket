import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Footer() {
    const currentYear = new Date().getFullYear();

    const handleComingSoon = (e, feature) => {
        if (e && !feature.startsWith('#')) e.preventDefault();
        // If it sends us to a hash link, don't show toast
        if (feature.startsWith('#')) {
            window.location.hash = feature;
            return;
        }
        showToast(`${feature} feature coming soon!`, 'info');
    };

    const linkGroups = [
        {
            title: "Buy",
            links: ["Registration", "Money Back Guarantee", "Bidding & buying help", "Stores", "Charity Shop", "Seasonal Sales"]
        },
        {
            title: "Sell",
            links: ["Start selling", "Learn to sell", "Affiliates", "Seller Information Center"]
        },
        {
            title: "Stay Connected",
            links: ["LuxeMarket Blog", "Facebook", "Twitter", "Instagram", "Pinterest"]
        },
        {
            title: "About LuxeMarket",
            links: ["Company Info", "News", "Investors", "Careers", "Government Relations", "Advertise with us", "Policies"]
        },
        {
            title: "Help & Contact",
            links: [
                { name: "Seller Information Center", url: "#help?section=seller" },
                { name: "Contact Us", url: "#help?section=contact" },
                { name: "Resolution Center", url: "#help?section=contact" }, // Map to contact for now
                { name: "Returns", url: "#help?section=returns" },
                { name: "Shipping", url: "#help?section=shipping" }
            ]
        }
    ];

    return (
        <footer className="bg-white border-t border-gray-200 pt-12 pb-6 text-[13px]" data-name="footer" data-file="components/Footer.js">
            <div className="container-custom">
                {/* Main Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
                    {linkGroups.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="font-bold text-gray-700 mb-4">{group.title}</h3>
                            <ul className="space-y-2">
                                {group.links.map(link => {
                                    const isObject = typeof link === 'object';
                                    const name = isObject ? link.name : link;
                                    const url = isObject ? link.url : "#";
                                    const clickHandler = isObject ? undefined : (e) => handleComingSoon(e, name);

                                    return (
                                        <li key={name}>
                                            <a href={url} onClick={clickHandler} className="text-gray-600 hover:text-[var(--primary-color)] hover:underline transition-colors block">
                                                {name}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                            {group.title === "Stay Connected" && (
                                <div className="flex gap-3 mt-4">
                                    <a href="#" onClick={(e) => handleComingSoon(e, 'Facebook')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition-colors">
                                        <div className="icon-facebook text-sm"></div>
                                    </a>
                                    <a href="#" onClick={(e) => handleComingSoon(e, 'Twitter')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-sky-400 hover:text-white transition-colors">
                                        <div className="icon-twitter text-sm"></div>
                                    </a>
                                    <a href="#" onClick={(e) => handleComingSoon(e, 'Instagram')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white transition-colors">
                                        <div className="icon-instagram text-sm"></div>
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-2 md:mb-0">
                            <a href="#" onClick={(e) => handleComingSoon(e, 'Accessibility')} className="hover:underline">Accessibility</a>
                            <span className="hidden md:inline">|</span>
                            <a href="#" onClick={(e) => handleComingSoon(e, 'User Agreement')} className="hover:underline">User Agreement</a>
                            <span className="hidden md:inline">|</span>
                            <a href="#" onClick={(e) => handleComingSoon(e, 'Privacy')} className="hover:underline">Privacy</a>
                            <span className="hidden md:inline">|</span>
                            <a href="#" onClick={(e) => handleComingSoon(e, 'Payments Terms of Use')} className="hover:underline">Payments Terms of Use</a>
                            <span className="hidden md:inline">|</span>
                            <a href="#" onClick={(e) => handleComingSoon(e, 'Cookies')} className="hover:underline">Cookies</a>
                            <span className="hidden md:inline">|</span>
                            <a href="#" onClick={(e) => handleComingSoon(e, 'Individual Privacy Rights')} className="hover:underline">Do not sell my personal info</a>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Copyright © 1995-{currentYear} LuxeMarket Inc. All Rights Reserved.</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;