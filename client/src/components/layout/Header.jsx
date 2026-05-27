import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user?.role) return '/';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'organizer') return '/dashboard/organizer';
    return '/dashboard/user';
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-[#0f172a] h-16 md:h-[119px] relative z-50 overflow-visible">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[44px] h-full flex items-center justify-between overflow-visible py-0">
        <Link to="/" className="font-bold text-lg md:text-[40px] text-[#f8fafc] no-underline hover:text-[#2563eb] transition-colors duration-300 flex-shrink-0">
          VIBELY
        </Link>

        <nav className="hidden md:flex gap-8 md:gap-[58px] mx-auto items-center">
          <Link to="/" className="font-bold text-sm md:text-[18px] text-[#2563eb] no-underline transition-colors duration-300">
            Home
          </Link>
          <Link to="/events" className="font-bold text-sm md:text-[18px] text-[#f8fafc] no-underline hover:text-[#2563eb] transition-colors duration-300">
            Browse Events
          </Link>
          <Link to="/categories" className="font-bold text-sm md:text-[18px] text-[#f8fafc] no-underline hover:text-[#2563eb] transition-colors duration-300">
            Categories
          </Link>
          {isAuthenticated && user?.role === 'organizer' && (
            <Link to="/organizer/create-event" className="font-bold text-sm md:text-[18px] text-[#f8fafc] no-underline hover:text-[#2563eb] transition-colors duration-300">
            Create Event
            </Link>
          )}
        </nav>

        <div className="flex gap-2 md:gap-[24px] items-center overflow-visible">
          {isAuthenticated ? (
            <div className="flex gap-2 md:gap-[16px] items-center overflow-visible">
              <div className="relative overflow-visible">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 md:w-[45px] h-9 md:h-[45px] rounded-full bg-[#2563eb] text-[#f8fafc] hover:bg-[#1d4ed8] transition-all duration-300 flex items-center justify-center border-2 border-[#f8fafc] flex-shrink-0"
                  title={user?.name || 'User'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute mr-[340px] right-[-840%]  transform translate-y-[10px] origin-top-right z-10  mt-2 bg-white rounded-[8px] shadow-lg w-[160px] overflow-visible p-2">
                    
                    <Link to={getDashboardPath()} className="no-underline block mb-2">
                      <button 
                        onClick={() => setShowMenu(false)}
                        className="w-full h-9 bg-[#2563eb] text-[#f8fafc] font-bold text-xs rounded-[8px] hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM15 3V9H21V3H15Z" fill="currentColor"/>
                        </svg>
                        Dashboard
                      </button>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full h-9 bg-[#2563eb] text-[#f8fafc] font-bold text-xs rounded-[8px] hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 16L21 12M21 12L17 8M21 12H9M15 16V17C15 18.0609 14.5786 19.0783 13.8284 19.8284C13.0783 20.5786 12.0609 21 11 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3H11C12.0609 3 13.0783 3.42143 13.8284 4.17157C14.5786 4.92172 15 5.93913 15 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="no-underline">
                <button className="px-3 md:px-6 py-1.5 md:py-0 md:w-[120px] md:h-[45px] h-8 rounded-[8px] font-bold text-xs md:text-[16px] flex items-center justify-center transition-all duration-300 bg-[#0f172a] text-[#f8fafc] border border-[#f8fafc] hover:bg-[#1e293b]">
                  LOGIN
                </button>
              </Link>
              <Link to="/register" className="no-underline">
                <button className="px-3 md:px-6 py-1.5 md:py-0 md:w-[120px] md:h-[45px] h-8 rounded-[8px] font-bold text-xs md:text-[16px] flex items-center justify-center transition-all duration-300 bg-[#2563eb] text-[#f8fafc] hover:bg-[#1d4ed8]">
                  Sign Up
                </button>
              </Link>
            </>
          )}
          <button 
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-[#f8fafc] hover:bg-[#1d4ed8] rounded-lg transition-colors flex-shrink-0"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="md:hidden bg-[#153885] border-t border-[#2563eb] py-4 px-4">
          <div className="flex flex-col gap-3">
            <Link to="/" className="font-bold text-sm text-[#2563eb] no-underline py-2 transition-colors duration-300">
              Home
            </Link>
            <Link to="/events" className="font-bold text-sm text-[#f8fafc] no-underline py-2 hover:text-[#2563eb] transition-colors duration-300">
              Browse Events
            </Link>
            <Link to="/categories" className="font-bold text-sm text-[#f8fafc] no-underline py-2 hover:text-[#2563eb] transition-colors duration-300">
              Categories
            </Link>
            {isAuthenticated && user?.role === 'organizer' && (
              <Link to="/organizer/create-event" className="font-bold text-sm text-[#f8fafc] no-underline py-2 hover:text-[#2563eb] transition-colors duration-300">
                Create Event
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
