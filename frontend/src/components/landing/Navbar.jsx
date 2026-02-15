import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Problem', href: '#problem' },
    { name: 'Solution', href: '#solution' },
    { name: 'Why Choose Us', href: '#whychooseus' },

  ];

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 transition-colors">
              VyapaarSathi
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-700 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <button className="text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-300 font-medium">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-300 font-medium">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col space-y-2 px-3 py-2">
              <Link to="/login">
                <button className="w-full text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-300 font-medium">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="w-full bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-300 font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;