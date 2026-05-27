import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] py-8 md:py-12 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-3 md:px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 mb-8 md:mb-12">
          <div className="text-slate-200">
            <h3 className="font-bold text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6">VIBELY</h3>
            <p className="font-normal text-xs md:text-sm lg:text-base leading-relaxed max-w-xs">"The easiest way to discover and book tickets for your favorite events."</p>
          </div>
          
          <div className="text-slate-200">
            <h4 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4">Company</h4>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Contact Support', 'Terms of Service'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-200 no-underline font-medium text-xs md:text-sm lg:text-base hover:text-blue-500 transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-slate-200">
            <h4 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Music & Concerts', 'Tech Conferences', 'Workshops', 'Community & Church'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-200 no-underline font-medium text-xs md:text-sm lg:text-base hover:text-blue-500 transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-slate-200">
            <h4 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4">Get in Touch</h4>
            <ul className="space-y-2 font-semibold text-xs md:text-sm lg:text-base mb-4 md:mb-6">
              <li>📧 support@evently.com</li>
              <li>📞 +250 788 123 456</li>
              <li>📍 Kigali, Rwanda</li>
            </ul>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110 flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none"><path d="M36.6667 20C36.6667 10.8 29.2 3.33333 20 3.33333C10.8 3.33333 3.33333 10.8 3.33333 20C3.33333 28.0667 9.06667 34.7833 16.6667 36.3333V25H13.3333V20H16.6667V15.8333C16.6667 12.6167 19.2833 10 22.5 10H26.6667V15H23.3333C22.4167 15 21.6667 15.75 21.6667 16.6667V20H26.6667V25H21.6667V36.5833C30.0833 35.75 36.6667 28.65 36.6667 20Z" fill="#2563EB"/></svg>
              </a>
              <a href="#" className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110 flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none"><path d="M2.6543 1.70796C2.95605 1.67146 3.26165 1.7215 3.53807 1.85269C3.81448 1.98387 4.0512 2.19121 4.22263 2.4523C6.68263 6.19825 9.63596 7.75632 12.9143 8.11027C13.0743 6.6511 13.4526 5.20928 14.1643 3.93923C15.2076 2.07579 16.9043 0.705108 19.3276 0.198476C22.6776 -0.502482 25.2276 0.76063 26.706 2.30655L29.6926 1.72531C30.0052 1.66435 30.3279 1.69773 30.6228 1.82152C30.9177 1.9453 31.1725 2.15433 31.357 2.42392C31.5415 2.69352 31.6481 3.01243 31.6641 3.34303C31.6802 3.67363 31.6051 4.00211 31.4476 4.28971L28.581 9.53301C28.8426 17.0995 26.8226 22.381 22.516 26.0194C20.2326 27.9487 16.9626 29.0436 13.3743 29.3819C9.75763 29.722 5.6693 29.3108 1.60596 28.0754C1.25878 27.97 0.953965 27.7499 0.737507 27.4483C0.521049 27.1467 0.404699 26.7799 0.406017 26.4035C0.407334 26.027 0.526246 25.6612 0.744809 25.3612C0.963371 25.0613 1.26972 24.8434 1.61763 24.7407C3.66096 24.1351 5.21763 23.6129 6.62263 22.6985C4.6243 21.595 3.15263 20.1515 2.11096 18.5066C0.664298 16.2199 0.127631 13.6693 0.0209646 11.3704C-0.0857021 9.07148 0.232631 6.94085 0.569298 5.40534C0.760965 4.52914 0.984298 3.65121 1.29263 2.81145C1.40139 2.51543 1.58596 2.25608 1.8263 2.06155C2.06664 1.86702 2.35191 1.74473 2.6543 1.70796Z" fill="#2563EB"/></svg>
              </a>
              <a href="#" className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110 flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none">
                  <defs>
                    <radialGradient id="instagramGradient1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10.625 43.0808) rotate(-90) scale(39.643 36.8711)"><stop stopColor="#FFDD55"/><stop offset="0.1" stopColor="#FFDD55"/><stop offset="0.5" stopColor="#FF543E"/><stop offset="1" stopColor="#C837AB"/></radialGradient>
                    <radialGradient id="instagramGradient2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-6.70016 2.88141) rotate(78.681) scale(17.7206 73.045)"><stop stopColor="#3771C8"/><stop offset="0.128" stopColor="#3771C8"/><stop offset="1" stopColor="#6600FF" stopOpacity="0"/></radialGradient>
                  </defs>
                  <path d="M30.625 0H9.375C4.19733 0 0 4.19733 0 9.375V30.625C0 35.8027 4.19733 40 9.375 40H30.625C35.8027 40 40 35.8027 40 30.625V9.375C40 4.19733 35.8027 0 30.625 0Z" fill="url(#instagramGradient1)"/>
                  <path d="M30.625 0H9.375C4.19733 0 0 4.19733 0 9.375V30.625C0 35.8027 4.19733 40 9.375 40H30.625C35.8027 40 40 35.8027 40 30.625V9.375C40 4.19733 35.8027 0 30.625 0Z" fill="url(#instagramGradient2)"/>
                  <path d="M20.0014 4.375C15.758 4.375 15.2253 4.39359 13.5588 4.46938C11.8953 4.54563 10.7598 4.80891 9.76641 5.19531C8.73859 5.59437 7.86688 6.12828 6.99844 6.99703C6.12922 7.86562 5.59531 8.73734 5.195 9.76469C4.8075 10.7584 4.54391 11.8944 4.46906 13.557C4.39453 15.2237 4.375 15.7566 4.375 20.0002C4.375 24.2438 4.39375 24.7747 4.46938 26.4412C4.54594 28.1047 4.80922 29.2402 5.19531 30.2336C5.59469 31.2614 6.12859 32.1331 6.99734 33.0016C7.86563 33.8708 8.73734 34.4059 9.76438 34.805C10.7586 35.1914 11.8942 35.4547 13.5573 35.5309C15.2241 35.6067 15.7563 35.6253 19.9995 35.6253C24.2434 35.6253 24.7744 35.6067 26.4409 35.5309C28.1044 35.4547 29.2411 35.1914 30.2353 34.805C31.2627 34.4059 32.1331 33.8708 33.0012 33.0016C33.8705 32.1331 34.4042 31.2614 34.8047 30.2341C35.1887 29.2402 35.4525 28.1044 35.5306 26.4416C35.6055 24.775 35.625 24.2438 35.625 20.0002C35.625 15.7566 35.6055 15.2241 35.5306 13.5573C35.4525 11.8939 35.1887 10.7586 34.8047 9.76516C34.4042 8.73734 33.8705 7.86562 33.0012 6.99703C32.1322 6.12797 31.263 5.59406 30.2344 5.19547C29.2383 4.80891 28.1022 4.54547 26.4387 4.46938C24.772 4.39359 24.2414 4.375 19.9966 4.375H20.0014ZM18.5997 7.19078C19.0158 7.19016 19.48 7.19078 20.0014 7.19078C24.1734 7.19078 24.6678 7.20578 26.3153 7.28063C27.8387 7.35031 28.6656 7.60484 29.2164 7.81875C29.9456 8.10188 30.4655 8.44047 31.012 8.9875C31.5589 9.53438 31.8973 10.0552 32.1813 10.7844C32.3952 11.3344 32.65 12.1613 32.7194 13.6847C32.7942 15.3319 32.8105 15.8266 32.8105 19.9966C32.8105 24.1666 32.7942 24.6614 32.7194 26.3084C32.6497 27.8319 32.3952 28.6587 32.1813 29.2089C31.8981 29.9381 31.5589 30.4573 31.012 31.0039C30.4652 31.5508 29.9459 31.8892 29.2164 32.1725C28.6663 32.3873 27.8387 32.6413 26.3153 32.7109C24.6681 32.7858 24.1734 32.802 20.0014 32.802C15.8292 32.802 15.3347 32.7858 13.6877 32.7109C12.1642 32.6406 11.3373 32.3861 10.7861 32.1722C10.057 31.8889 9.53609 31.5505 8.98922 31.0036C8.44234 30.4567 8.10391 29.9372 7.82 29.2077C7.60609 28.6577 7.35156 27.8308 7.28188 26.3073C7.20703 24.6603 7.19203 24.1655 7.19203 19.9955C7.19203 15.8255 7.20703 15.3308 7.28188 13.6838C7.35156 12.1603 7.60609 11.3333 7.82 10.7822C8.10328 10.053 8.44172 9.53406 8.98859 8.98719C9.53547 8.44031 10.0547 8.10188 10.7842 7.81859C11.3353 7.60469 12.1622 7.35016 13.6856 7.28047C15.3325 7.20578 15.8273 7.19078 20.0014 7.19078H18.5997ZM20.0014 11.0883C15.1453 11.0883 11.0892 15.1444 11.0892 20.0005C11.0892 24.8566 15.1453 28.9127 20.0014 28.9127C24.8575 28.9127 28.9136 24.8566 28.9136 20.0005C28.9136 15.1444 24.8575 11.0883 20.0014 11.0883ZM20.0014 25.6325C16.8628 25.6325 14.3694 23.1391 14.3694 20.0005C14.3694 16.8619 16.8628 14.3685 20.0014 14.3685C23.1399 14.3685 25.6333 16.8619 25.6333 20.0005C25.6333 23.1391 23.1399 25.6325 20.0014 25.6325ZM30.1994 10.7711C30.1994 12.1536 31.3139 13.2681 32.6953 13.2681C34.0768 13.2681 35.1917 12.1536 35.1917 10.7711C35.1917 9.38859 34.0768 8.27406 32.6953 8.27406C31.3139 8.27406 30.1994 9.38859 30.1994 10.7711Z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="bg-[linear-gradient(90deg,#2563eb_34.135%,#1d4eb8_68.269%,#153885_83.173%)] py-4 md:py-6 px-3 md:px-0 text-center border-t border-slate-700">
          <p className="text-white font-normal text-xs md:text-sm lg:text-base">© 2025 Vibely. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;