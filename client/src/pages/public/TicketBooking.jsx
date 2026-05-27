import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { User, Minus, Plus } from 'lucide-react';
import api from '../../api/axios';

const TicketBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/book-ticket/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (event) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const response = await api.get(`/events/public/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, event]);

  useEffect(() => {
    if (event?.tickets) {
      const initialQuantities = {};
      event.tickets.forEach(ticket => {
        initialQuantities[ticket.ticket_id] = location.state?.selectedTickets?.[ticket.ticket_id] || 0;
      });
      setQuantities(initialQuantities);
    }
  }, [event, location.state]);

  const buildTicketsFromEvent = () => {
    if (!event || !event.tickets) return [];
    
    return event.tickets.map(t => ({
      id: t.ticket_id,
      title: t.ticket_name || t.ticket_type || 'General Admission',
      description: (t.ticket_name || t.ticket_type || '').toLowerCase().includes('vip') ? 'Premium seating, dedicated bar & facilities' : 'Access to main stage and event areas',
      price: parseFloat(t.price) || 0,
      status: t.quantity_available > 0 ? 'available' : 'sold-out'
    }));
  };

  const tickets = buildTicketsFromEvent();

  const updateQuantity = (id, change) => {
    setQuantities(prev => {
      const newVal = prev[id] + change;
      if (newVal < 0) return prev;
      return { ...prev, [id]: newVal };
    });
  };

  const totalAmount = tickets.reduce((sum, ticket) => {
    return sum + (quantities[ticket.id] * ticket.price);
  }, 0);

  if (loading) {
    return (
      <div className="font-sans bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-2xl text-gray-600">Loading event details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="font-sans bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl text-red-600 mb-4">{error || 'Event not found'}</p>
            <button 
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              Back to home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-sans bg-white min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] py-6 md:py-10 lg:py-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-slate-900 text-center md:text-left">
            Booking For: <span className="text-white text-base md:text-xl lg:text-3xl">{event?.title}</span>
          </h2>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-8 md:py-12 lg:py-20">
        <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-slate-900 mb-6 md:mb-8 lg:mb-12">Select Your Tickets</h2>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          
          <div className="flex-1 flex flex-col gap-4 md:gap-5 lg:gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-slate-50 shadow-md p-4 md:p-5 lg:p-6 flex flex-col justify-between rounded-lg hover:shadow-lg transition-shadow">
                
                <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-5 lg:mb-6">
                  <div className="flex justify-between items-start gap-3 md:gap-4">
                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-slate-900 flex-1">{ticket.title}</h3>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 flex-shrink-0">${ticket.price}</p>
                  </div>
                  <p className="text-xs md:text-sm lg:text-base font-normal text-slate-700 leading-relaxed">{ticket.description}</p>
                </div>

                <div className="flex justify-between items-center gap-3 md:gap-4">
                  <p className={`text-xs md:text-sm lg:text-base font-semibold ${ticket.status === 'sold-out' ? 'text-red-600' : 'text-slate-900'}`}>
                    {ticket.status === 'sold-out' ? 'Sold Out' : 'Available'}
                  </p>

                  <div className={`flex items-center gap-2 bg-slate-200 p-1.5 md:p-2 rounded-lg ${ticket.status === 'sold-out' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <button 
                      onClick={() => updateQuantity(ticket.id, -1)}
                      disabled={ticket.status === 'sold-out'}
                      className="p-1 md:p-1.5 hover:bg-white rounded transition disabled:cursor-not-allowed"
                    >
                      <Minus size={14} className="md:w-4 md:h-4 text-slate-700" />
                    </button>
                    
                    <span className="font-bold text-slate-900 w-5 md:w-6 text-center text-xs md:text-sm">{quantities[ticket.id]}</span>
                    
                    <button 
                      onClick={() => updateQuantity(ticket.id, 1)} 
                      disabled={ticket.status === 'sold-out'}
                      className="p-1 md:p-1.5 hover:bg-white rounded transition disabled:cursor-not-allowed"
                    >
                      <Plus size={14} className="md:w-4 md:h-4 text-slate-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-slate-50 shadow-lg p-4 md:p-6 lg:p-8 rounded-lg top-[119px] max-h-[calc(100vh-119px)] overflow-y-auto">
              <h3 className="text-base md:text-lg lg:text-2xl font-bold text-slate-900 mb-4 md:mb-6 lg:mb-8">Order Summary</h3>

              <div className="mb-4 md:mb-6 lg:mb-8 space-y-2 md:space-y-3 lg:space-y-4">
                {tickets.map((ticket) => {
                  if (quantities[ticket.id] > 0) {
                    return (
                      <div key={ticket.id} className="flex justify-between items-center text-xs md:text-sm lg:text-base font-semibold text-slate-900">
                        <span>x{quantities[ticket.id]} {ticket.title}</span>
                        <span>${(quantities[ticket.id] * ticket.price).toFixed(2)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                {totalAmount === 0 && <p className="text-slate-500 text-xs md:text-sm italic">No tickets selected</p>}
              </div>

              <div className="border-t border-slate-300 pt-4 md:pt-5 lg:pt-6 mb-4 md:mb-6 lg:mb-8">
                <div className="flex justify-between items-center gap-3 md:gap-4">
                  <span className="text-sm md:text-base lg:text-lg font-bold text-slate-900">Total Amount:</span>
                  <span className="text-base md:text-lg lg:text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout', { state: { event, tickets, quantities, totalAmount } })} className="w-full py-2 md:py-3 lg:py-4 bg-blue-600 text-white text-xs md:text-sm lg:text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors h-9 md:h-11 lg:h-12 flex items-center justify-center">
                Proceed to Payment
              </button>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TicketBooking;
