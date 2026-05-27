import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Make sure you installed lucide-react

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#0f172a] h-[119px] relative z-50">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[44px] h-full flex items-center justify-between">
        {/* Logo */}
        <div className="text-white font-bold text-[30px] md:text-[40px]">VIBELY</div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-[58px]">
          <Link to="/" className="text-[#2563eb] font-bold text-2xl">Home</Link>
          <Link to="/events" className="text-slate-50 font-bold text-2xl hover:text-[#2563eb] transition">Browse Events</Link>
          <Link to="/categories" className="text-slate-50 font-bold text-2xl hover:text-[#2563eb] transition">Categories</Link>
          <Link to="/create-event" className="text-slate-50 font-bold text-2xl hover:text-[#2563eb] transition">Create Event</Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-6">
          <Link to="/login">
            <button className="w-[178px] h-[60px] rounded-[10px]  border border-white bg-[#0f172a] text-slate-50 font-bold text-2xl hover:bg-slate-800 transition">
              LOGIN
            </button>
          </Link>
          <Link to="/register">
            <button className="w-[178px] h-[60px] rounded-[10px] bg-[#2563eb] text-slate-50 font-bold text-2xl hover:bg-blue-700 transition">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden absolute top-[119px] left-0 w-full bg-[#0f172a] flex flex-col items-center py-10 gap-6 shadow-xl">
           <Link to="/" className="text-[#2563eb] font-bold text-xl">Home</Link>
           <Link to="/events" className="text-white font-bold text-xl">Browse Events</Link>
           <Link to="/login" className="text-white font-bold text-xl">Login</Link>
           <Link to="/register" className="text-white font-bold text-xl">Sign Up</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;