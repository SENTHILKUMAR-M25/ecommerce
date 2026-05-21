import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle, ArrowRight, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/5 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-extrabold tracking-wider text-white">
              AURA
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Curating high-end digital gears, active apparel, and futuristic living decors tailored to redefine your daily lifestyle.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Community">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Shop Catalog</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/products?category=tech-gadgets" className="hover:text-cyan-400 transition-colors">
                  Tech & Smart Gadgets
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion-apparel" className="hover:text-cyan-400 transition-colors">
                  Fashion & Apparels
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="hover:text-cyan-400 transition-colors">
                  Minimalist Home Decor
                </Link>
              </li>
              <li>
                <Link to="/products?category=fitness-outdoor" className="hover:text-cyan-400 transition-colors">
                  Fitness & Outdoor Gears
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Customer Care</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/profile" className="hover:text-cyan-400 transition-colors">
                  Manage Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-cyan-400 transition-colors">
                  Track Purchases
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Returns & Refunds
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase">Stay Updated</h3>
            <p className="text-sm text-slate-400">
              Subscribe to unlock early access, seasonal launches, and members-only pricing.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-l-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                type="submit"
                className="bg-white hover:bg-cyan-500 hover:text-white text-slate-950 font-bold px-4 rounded-r-xl transition-all flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Legal & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} AURA Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using the MERN Stack.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
