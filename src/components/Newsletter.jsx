import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Newsletter() {

    const handleSubmit = (e) => {
        e.preventDefault();
        showToast('Thanks for subscribing! Keep an eye on your inbox.', 'success');
        e.target.reset();
    };

    return (
        <div className="bg-[var(--primary-color)] py-16" data-name="newsletter" data-file="components/Newsletter.js">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-white max-w-lg">
                        <h2 className="text-3xl font-bold mb-4">Subscribe to our newsletter</h2>
                        <p className="text-blue-100 text-lg">
                            Get the latest updates on new products and upcoming sales directly in your inbox.
                        </p>
                    </div>

                    <div className="w-full max-w-md">
                        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                            <button type="submit" className="bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                                Subscribe
                            </button>
                        </form>
                        <div className="text-blue-200 text-sm mt-3 flex items-center gap-1">
                            <div className="icon-lock text-xs"></div>
                            Your email is safe with us. No spam.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Newsletter;