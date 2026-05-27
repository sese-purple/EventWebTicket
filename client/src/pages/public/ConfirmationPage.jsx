import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { event, totalAmount, bookingRef, paymentMethod, tickets, quantities } = location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/confirmation' } });
    }
  }, [isAuthenticated, navigate]);

  const getPaymentMethodDisplay = () => {
    const methods = {
      'credit-card': 'Credit/Debit Card',
      'mobile-money': 'Mobile Money',
      'paypal': 'PayPal'
    };
    return methods[paymentMethod] || 'Payment Method';
  };
 

  const handleViewTickets = () => {
    navigate('/dashboard/user', { state: { section: 'tickets' } });
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="font-sans bg-white text-[#1e1e1e] min-h-screen flex flex-col">
      <Header />

      <section className="h-auto p-4 md:py-0 md:h-[167px] bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] flex items-center">
        <div className="max-w-[1498px] mx-auto w-full px-3 sm:px-4 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-5">
          <h2 className="text-lg md:text-2xl lg:text-[40px] font-bold text-black text-center md:text-left">
            <span className="text-black">Checkout :</span>
            <span className="text-[#f8fafc] text-base md:text-lg lg:text-[32px] ml-2 block md:inline">{event?.title || 'Event'}</span>
          </h2>
        </div>
      </section>

      <main className="flex-1 max-w-[700px] mx-auto py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 w-full mt-8 md:mt-12 lg:mt-16 mb-12 md:mb-16 lg:mb-20 flex items-center justify-center">
        <div className="bg-[#f8fafc] shadow-[0px_4px_12px_rgba(0,0,0,0.25)] p-4 md:p-6 lg:p-8 rounded-lg text-center w-full">
          
          <div className="w-24 md:w-28 lg:w-[160px] h-24 md:h-28 lg:h-[160px] mx-auto mb-4 md:mb-6 lg:mb-8">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0ZM143.75 78.125L93.75 128.125C92.5 129.375 90.625 130 88.75 130C86.875 130 85 129.375 83.75 128.125L56.25 100.625C53.75 98.125 53.75 94.375 56.25 91.875C58.75 89.375 62.5 89.375 65 91.875L88.75 115.625L134.375 70C136.875 67.5 140.625 67.5 143.125 70C145.625 72.5 146.25 75.625 143.75 78.125Z" fill="#14AE5C"/>
            </svg>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-[40px] font-bold text-black mb-3 md:mb-4 lg:mb-6">Payment Successful !</h1>
          
          <p className="text-sm md:text-base lg:text-[24px] font-medium text-black mb-4 md:mb-6 lg:mb-8">Your booking for <span className="font-bold">{event?.title || 'your event'}</span> is confirmed</p>
          
          <div className="border-t border-black mt-6 md:mt-8 lg:mt-10 mb-4 md:mb-6 lg:mb-8"></div>
          
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div className="flex justify-between items-center mb-4 md:mb-5 lg:mb-6 flex-wrap gap-2">
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-black">Booking Ref :</span>
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-black">{bookingRef || '#56rty75'}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4 md:mb-5 lg:mb-6 flex-wrap gap-2">
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-black">Payment Method:</span>
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-black">{getPaymentMethodDisplay()}</span>
            </div>

            {tickets && quantities && (
              <div className="mb-4 md:mb-5 lg:mb-6 text-left bg-[#ecfdf5] border-2 border-[#10b981] rounded-lg p-3 md:p-4 lg:p-5">
                <p className="text-sm md:text-base lg:text-lg font-bold text-[#0f172a] mb-2 md:mb-3">Tickets Booked:</p>
                {tickets.map((ticket) => {
                  if (quantities[ticket.id] > 0) {
                    return (
                      <div key={ticket.id} className="flex justify-between text-xs md:text-sm lg:text-base text-[#0f172a] mb-2">
                        <span>{ticket.title} x{quantities[ticket.id]}</span>
                        <span>${(quantities[ticket.id] * ticket.price).toFixed(2)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-black">Amount Paid:</span>
              <span className="text-sm md:text-base lg:text-[24px] font-bold text-[#2563eb]">${totalAmount || 0}</span>
            </div>
          </div>

          <button 
            onClick={handleViewTickets}
            className="w-full h-9 md:h-11 lg:h-14 bg-[#2563eb] text-[#f8fafc] text-xs md:text-sm lg:text-lg font-bold rounded-lg hover:bg-[#1d4ed8] transition shadow-lg mb-2 md:mb-3 lg:mb-4"
          >
            View My Tickets
          </button>
          
          <button 
            onClick={handleBackHome}
            className="w-full h-9 md:h-11 lg:h-14 bg-[#dbdbdb] text-[#0f172a] text-xs md:text-sm lg:text-lg font-bold rounded-lg hover:bg-[#cbcbcb] transition"
          >
            Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmationPage;
