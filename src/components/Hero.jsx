import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Hero() {
    const [currentSlide, setCurrentSlide] = React.useState(0);

    const handleComingSoon = (e, feature) => {
        if (e) e.preventDefault();
        showToast(`${feature} feature coming soon!`, 'info');
    };

    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            subtitle: "NEW SEASON ARRIVALS",
            title: "Elevate Your Style With Premium Essentials",
            description: "Discover our curated collection of high-quality products designed to enhance your lifestyle.",
            ctaPrimary: "Shop Now",
            ctaSecondary: "View Collections",
            linkPrimary: "#featured-products",
            linkSecondary: "#featured-products"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            subtitle: "LATEST TECH",
            title: "Next Gen Electronics For Your Home",
            description: "Upgrade your space with smart home devices and premium audio equipment.",
            ctaPrimary: "Shop Electronics",
            ctaSecondary: "See All Deals",
            linkPrimary: "?category=Electronics#featured-products",
            linkSecondary: "#featured-products"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            subtitle: "COMFORT & DESIGN",
            title: "Modern Furniture For Modern Living",
            description: "Transform your workspace and living area with our ergonomic furniture collection.",
            ctaPrimary: "Browse Furniture",
            ctaSecondary: "Read Blog",
            linkPrimary: "?category=Furniture#featured-products",
            linkSecondary: "#"
        }
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="hero-section relative bg-gray-900 overflow-hidden h-[300px] md:h-[400px] lg:h-[500px] group hero-carousel" data-name="hero-carousel" data-file="components/Hero.js">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`hero-carousel-slide transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 active' : 'opacity-0'}`}
                >
                    <div className="absolute inset-0">
                        <img
                            className={`w-full h-full object-cover opacity-60 transition-opacity duration-1000 ${index === currentSlide ? 'animate-zoom' : ''}`}
                            src={slide.image}
                            alt={slide.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
                    </div>

                    <div className="relative container-custom h-full flex items-center">
                        <div className="max-w-2xl animate-[fadeIn_0.8s_ease-out]">
                            <span className="inline-block py-1 px-3 rounded bg-[var(--primary-color)] bg-opacity-20 text-[var(--accent-color)] text-sm font-semibold tracking-wider mb-4 border border-[var(--primary-color)] border-opacity-30">
                                {slide.subtitle}
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
                                {slide.title}
                            </h1>
                            <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-xl drop-shadow-md">
                                {slide.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href={slide.linkPrimary} className="btn bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                                    {slide.ctaPrimary}
                                </a>
                                {slide.linkSecondary === "#" ? (
                                    <button onClick={(e) => handleComingSoon(e, slide.ctaSecondary)} className="btn bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 text-lg px-10 py-4 rounded-full backdrop-blur-md font-semibold transition-all hover:border-white/60">
                                        {slide.ctaSecondary}
                                    </button>
                                ) : (
                                    <a href={slide.linkSecondary} className="btn bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 text-lg px-10 py-4 rounded-full backdrop-blur-md font-semibold transition-all hover:border-white/60">
                                        {slide.ctaSecondary}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="hero-carousel-controls absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <div className="icon-chevron-left text-2xl"></div>
            </button>
            <button
                onClick={nextSlide}
                className="hero-carousel-controls absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <div className="icon-chevron-right text-2xl"></div>
            </button>

            {/* Indicators */}
            <div className="hero-carousel-indicators absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[var(--primary-color)] w-8' : 'bg-white/50 hover:bg-white/80'}`}
                    ></button>
                ))}
            </div>
        </div>
    );
}
export default Hero;