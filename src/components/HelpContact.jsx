import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/simpleToast.js';

function HelpContact() {
    const [activeSection, setActiveSection] = useState('faq');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        // Handle hash navigation to specific sections
        // Check both search params and hash params (for hash routing: #help?section=shipping)
        const getSectionFromUrl = () => {
            // Try standard search params
            let params = new URLSearchParams(window.location.search);
            let section = params.get('section');

            // If not found, try parsing from hash
            if (!section && window.location.hash.includes('?')) {
                const hashQuery = window.location.hash.split('?')[1];
                params = new URLSearchParams(hashQuery);
                section = params.get('section');
            }

            if (section && ['faq', 'contact', 'shipping', 'returns', 'seller'].includes(section)) {
                setActiveSection(section);
            }
        };

        getSectionFromUrl();

        // Listen for hash changes to update section if user clicks footer links while already on help page
        window.addEventListener('hashchange', getSectionFromUrl);
        return () => window.removeEventListener('hashchange', getSectionFromUrl);
    }, []);

    const faqData = [
        {
            question: "How do I track my order?",
            answer: "Once your order has shipped, you will receive an email confirmation with a tracking number. You can also view tracking information in your Account Summary under 'Purchase History'."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for most items. Items must be in their original condition. Please visit our Returns section for more details and to initiate a return."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times vary by location and are calculated at checkout."
        },
        {
            question: "How can I contact customer support?",
            answer: "You can contact our customer support team via the Contact Form on this page, or by emailing support@luxemarket.com. We aim to respond within 24 hours."
        },
        {
            question: "Are my payment details secure?",
            answer: "Absolutely. We use industry-standard encryption and secure payment gateways to ensure your personal and payment information is protected."
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Contact Form Submitted:', contactForm);
        showToast('Message sent successfully! We will get back to you soon.', 'success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'faq':
                return (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
                        {faqData.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <details className="group">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <span>{item.question}</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                        </span>
                                    </summary>
                                    <div className="text-gray-600 p-4 border-t border-gray-200 bg-white group-open:animate-[slideDown_0.2s_ease-out]">
                                        {item.answer}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                );
            case 'contact':
                return (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={contactForm.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={contactForm.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    value={contactForm.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="Order Status">Order Status</option>
                                    <option value="Returns & Refunds">Returns & Refunds</option>
                                    <option value="Product Inquiry">Product Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    required
                                    value={contactForm.message}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[var(--primary-color)] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all shadow-md active:scale-[0.98]"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shipping Information</h2>
                        <div className="prose prose-blue text-gray-600 max-w-none">
                            <p>We are dedicated to delivering your order as quickly and efficiently as possible.</p>

                            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Shipping Methods & Delivery Times</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Standard Shipping:</strong> 3-5 business days. Free for orders over $50.</li>
                                <li><strong>Expedited Shipping:</strong> 2-3 business days. $15 flat rate.</li>
                                <li><strong>Overnight Shipping:</strong> 1 business day. $30 flat rate.</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Order Processing</h3>
                            <p>Orders designated for shipment will be processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.</p>

                            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">International Shipping</h3>
                            <p>We ship internationally to most countries. International shipping rates and delivery times vary depending on the destination and shipping method selected at checkout. Please note that customs duties and taxes may apply and are the responsibility of the customer.</p>
                        </div>
                    </div>
                );
            case 'returns':
                return (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Returns & Refunds</h2>
                        <div className="prose prose-blue text-gray-600 max-w-none">
                            <p>If you are not 100% satisfied with your purchase, you can return the product and get a full refund or exchange the product for another one, be it similar or not.</p>

                            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Return Policy</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You can return a product for up to 30 days from the date you purchased it.</li>
                                <li>Any product you return must be in the same condition you received it and in the original packaging.</li>
                                <li>Please keep the receipt.</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">How to Initiate a Return</h3>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>Go to your Account Summary.</li>
                                <li>Select "Purchase History".</li>
                                <li>Find the order you wish to return and click "Return Item".</li>
                                <li>Follow the on-screen instructions to print your shipping label.</li>
                            </ol>
                        </div>
                    </div>
                );
            case 'seller':
                return (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Seller Information Center</h2>
                        <div className="prose prose-blue text-gray-600 max-w-none">
                            <p>Welcome to the LuxeMarket Seller Hub. Here you can find resources to help you start, manage, and grow your business.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('contact')}>
                                    <h4 className="font-bold text-[var(--primary-color)] mb-2">Getting Started</h4>
                                    <p className="text-sm">Learn the basics of setting up your store and listing your first item.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('contact')}>
                                    <h4 className="font-bold text-[var(--primary-color)] mb-2">Seller Policies</h4>
                                    <p className="text-sm">Understand the rules and guidelines for selling on LuxeMarket.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('contact')}>
                                    <h4 className="font-bold text-[var(--primary-color)] mb-2">Fees & Billing</h4>
                                    <p className="text-sm">Everything you need to know about selling fees and how you get paid.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('contact')}>
                                    <h4 className="font-bold text-[var(--primary-color)] mb-2">Seller Tools</h4>
                                    <p className="text-sm">Explore tools that can help you manage your inventory and orders more efficiently.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="container-custom py-8 min-h-[60vh]">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-bold text-gray-700">Help Center</h3>
                        </div>
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveSection('faq')}
                                className={`text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${activeSection === 'faq' ? 'border-[var(--primary-color)] bg-blue-50 font-bold text-[var(--primary-color)]' : 'border-transparent text-gray-600'}`}
                            >
                                FAQ
                            </button>
                            <button
                                onClick={() => setActiveSection('contact')}
                                className={`text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${activeSection === 'contact' ? 'border-[var(--primary-color)] bg-blue-50 font-bold text-[var(--primary-color)]' : 'border-transparent text-gray-600'}`}
                            >
                                Contact Us
                            </button>
                            <button
                                onClick={() => setActiveSection('shipping')}
                                className={`text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${activeSection === 'shipping' ? 'border-[var(--primary-color)] bg-blue-50 font-bold text-[var(--primary-color)]' : 'border-transparent text-gray-600'}`}
                            >
                                Shipping
                            </button>
                            <button
                                onClick={() => setActiveSection('returns')}
                                className={`text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${activeSection === 'returns' ? 'border-[var(--primary-color)] bg-blue-50 font-bold text-[var(--primary-color)]' : 'border-transparent text-gray-600'}`}
                            >
                                Returns Info
                            </button>
                            <button
                                onClick={() => setActiveSection('seller')}
                                className={`text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-4 ${activeSection === 'seller' ? 'border-[var(--primary-color)] bg-blue-50 font-bold text-[var(--primary-color)]' : 'border-transparent text-gray-600'}`}
                            >
                                Seller Info
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}

export default HelpContact;
