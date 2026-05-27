import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../api/axios';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { event, tickets, quantities, totalAmount } = location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  const [selectedMethod, setSelectedMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 3) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    setCvc(value.substring(0, 3));
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const bookingRef = '#' + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      const ticketSelections = {};
      if (tickets && quantities) {
        tickets.forEach(ticket => {
          if (quantities[ticket.id] > 0) {
            ticketSelections[ticket.id] = quantities[ticket.id];
          }
        });
      }

      console.log('Booking data:', {
        eventId: event.event_id || event.id,
        ticketSelections,
        totalAmount,
        paymentMethod: selectedMethod,
        bookingRef
      });

      const response = await api.post('/events/booking/create', {
        eventId: event.event_id || event.id,
        ticketSelections,
        totalAmount,
        paymentMethod: selectedMethod,
        bookingRef
      });

      console.log('Booking response:', response.data);

      navigate('/confirmation', {
        state: {
          event,
          totalAmount,
          bookingRef,
          paymentMethod: selectedMethod,
          tickets,
          quantities
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error.response?.data || error.message);
      alert('Failed to create booking. ' + (error.response?.data?.message || error.message));
      setIsProcessing(false);
    }
  };

  return (
    <div className={`font-sans bg-white text-[#1e1e1e] min-h-screen flex flex-col ${isProcessing ? 'opacity-60' : ''}`}>
      <Header />

      <section className="h-auto p-4 md:p-6 lg:p-8 md:py-0 lg:h-[167px] bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] flex items-center">
        <div className="max-w-[1440px] mx-auto w-full px-3 md:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <h2 className="text-lg md:text-2xl lg:text-[40px] font-bold text-black text-center md:text-left w-full md:w-auto">
            <span className="text-black">Checkout :</span>
            <span className="text-[#f8fafc] text-base md:text-xl lg:text-[32px] ml-2 block md:inline">{event?.title || 'Event'}</span>
          </h2>
        </div>
      </section>

      <main className="flex-1 max-w-[1440px] mx-auto py-6 md:py-10 lg:py-16 px-3 md:px-6 lg:px-12 w-full">
        <h2 className="text-lg md:text-2xl lg:text-[32px] font-light text-[#0f172a] mb-6 md:mb-8 lg:mb-12">Complete your purchase</h2>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          <div className="flex-1 w-full lg:w-auto">
            <div className="bg-[#f8fafc] p-4 md:p-6 lg:p-8 shadow-md rounded-lg">
              <h3 className="text-lg md:text-2xl lg:text-[32px] font-bold text-black mb-4 md:mb-6">Payment Method</h3>
              
              <div className="border-t border-black mb-6 md:mb-8"></div>
              
              <h4 className="text-base md:text-lg lg:text-2xl font-bold text-black mb-6 md:mb-8">Choose Payment Method</h4>

              <div
                className={`border border-black rounded-lg p-4 md:p-5 mb-4 md:mb-6 transition-all ${selectedMethod === 'credit-card' ? 'bg-[#cbd2e3]' : 'bg-white'}`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <input 
                      type="radio" 
                      id="credit-card-radio"
                      name="payment-method"
                      value="credit-card"
                      checked={selectedMethod === 'credit-card'}
                      onChange={() => handleMethodSelect('credit-card')}
                      className="w-5 md:w-6 h-5 md:h-6 cursor-pointer"
                    />
                    <label htmlFor="credit-card-radio" className="flex items-center gap-2 md:gap-3 cursor-pointer text-sm md:text-base lg:text-lg font-bold text-black flex-1">
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 md:w-8 md:h-8">
                        <path d="M35 8.33333H5C3.61929 8.33333 2.5 9.45262 2.5 10.8333V29.1667C2.5 30.5474 3.61929 31.6667 5 31.6667H35C36.3807 31.6667 37.5 30.5474 37.5 29.1667V10.8333C37.5 9.45262 36.3807 8.33333 35 8.33333Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 16.6667H37.5" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Credit/ Debit Card</span>
                    </label>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="w-10 md:w-12 h-auto flex-shrink-0" />
                </div>

                <div className="border-t border-gray-300 pt-4 space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength="19"
                      className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="3"
                        value={cvc}
                        onChange={handleCvcChange}
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" id="save-card" className="w-4 h-4" />
                    <span className="text-xs md:text-sm font-medium text-black">Save card for future bookings</span>
                  </label>
                </div>
              </div>

              <div
                className={`border border-black rounded-lg p-4 md:p-5 mb-4 md:mb-6 transition-all ${selectedMethod === 'mobile-money' ? 'bg-[#cbd2e3]' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <input 
                      type="radio" 
                      id="mobile-money-radio"
                      name="payment-method"
                      value="mobile-money"
                      checked={selectedMethod === 'mobile-money'}
                      onChange={() => handleMethodSelect('mobile-money')}
                      className="w-5 md:w-6 h-5 md:h-6 cursor-pointer"
                    />
                    <label htmlFor="mobile-money-radio" className="cursor-pointer text-sm md:text-base lg:text-lg font-bold text-black">
                      <span>Mobile Money</span>
                    </label>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 md:w-8 md:h-8">
                    <circle cx="20" cy="20" r="15" stroke="#0F172A" strokeWidth="0.5"/>
                    <path d="M18 13L18 21" stroke="#0F172A" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 13L22 21" stroke="#0F172A" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 17L20 22L26 17" stroke="#0F172A" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 21C12 21 14 24 20 24C26 24 28 21 28 21" stroke="#0F172A" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {selectedMethod === 'mobile-money' && (
                  <div className="border-t border-gray-300 pt-4 space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+250 700 000 000"
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">PIN</label>
                      <input
                        type="password"
                        placeholder="••••"
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`border border-black rounded-lg p-4 md:p-5 mb-4 md:mb-6 transition-all ${selectedMethod === 'paypal' ? 'bg-[#cbd2e3]' : 'bg-white'}`}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-4">
                  <input 
                    type="radio" 
                    id="paypal-radio"
                    name="payment-method"
                    value="paypal"
                    checked={selectedMethod === 'paypal'}
                    onChange={() => handleMethodSelect('paypal')}
                    className="w-5 md:w-6 h-5 md:h-6 cursor-pointer"
                  />
                  <label htmlFor="paypal-radio" className="cursor-pointer text-sm md:text-base lg:text-lg font-bold text-black">
                    <span>PayPal</span>
                  </label>
                </div>

                {selectedMethod === 'paypal' && (
                  <div className="border-t border-gray-300 pt-4 space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">PayPal Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm lg:text-base font-bold text-black mb-2">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-9 md:h-10 lg:h-12 bg-white border border-black rounded-lg px-3 md:px-4 text-xs md:text-sm lg:text-base font-sans focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-auto lg:flex-shrink-0 lg:max-w-sm">
            <div className="bg-[#f8fafc] shadow-md rounded-lg p-4 md:p-6 lg:p-8">
              <h3 className="text-lg md:text-2xl lg:text-[32px] font-bold text-black mb-6 md:mb-8 lg:mb-10">Order Summary</h3>

              <div className="mb-6 md:mb-8 space-y-4">
                {tickets && quantities ? (
                  tickets.map((ticket) => {
                    if (quantities[ticket.id] > 0) {
                      return (
                        <div key={ticket.id} className="flex justify-between items-center text-sm md:text-base lg:text-lg font-normal text-black">
                          <span>x{quantities[ticket.id]} {ticket.title}</span>
                          <span>${quantities[ticket.id] * ticket.price}</span>
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <p className="text-gray-500 text-sm md:text-base italic">No tickets selected</p>
                )}
              </div>

              <div className="h-px bg-black mb-6"></div>

              <div className="flex justify-between items-center mb-8 md:mb-10 lg:mb-12">
                <span className="text-base md:text-lg lg:text-xl font-bold text-black">Total Amount :</span>
                <span className="text-base md:text-lg lg:text-xl font-bold text-black">${totalAmount || 0}</span>
              </div>

              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className={`w-full h-10 md:h-12 lg:h-14 text-sm md:text-base lg:text-lg font-bold rounded-lg transition shadow-lg flex items-center justify-center ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#2563eb] text-[#f8fafc] hover:bg-[#1d4ed8]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <span className="text-[#f8fafc]">Confirm Payment</span>
                )}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
