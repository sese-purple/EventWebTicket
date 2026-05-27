import React from 'react';
import { Link } from 'react-router-dom';

const AuthHeader = () => {
  return (
    <header className="bg-[#0f172a] h-[30px] md:h-[70px] flex items-center px-5 md:px-[48px]">
      <Link to="/" className="font-bold text-[30px] md:text-[40px] text-[#f8fafc] no-underline hover:text-[#2563eb] transition-colors duration-300">
        VIBELY
      </Link>
    </header>
  );
};

export default AuthHeader;
