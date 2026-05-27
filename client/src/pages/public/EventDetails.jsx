import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Plus, Minus, Share2, Heart, Users, Clock, MapPin, DollarSign } from 'lucide-react';
import api from '../../api/axios';

const EventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, eventId } = useParams();
  const eventIdentifier = id || eventId;
  const isOrganizerView = location.pathname.startsWith('/organizer/event');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState({});
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const endpoint = isOrganizerView 
          ? `/events/organizer/${eventIdentifier}`
          : `/events/public/${eventIdentifier}`;
        const response = await api.get(endpoint);
        setEvent(response.data);
        
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorited(favorites.includes(response.data.event_id));
        
        const initialTickets = {};
        if (response.data?.tickets && response.data.tickets.length > 0) {
          response.data.tickets.forEach(ticket => {
            initialTickets[ticket.ticket_id] = 0;
          });
        }
        setTickets(initialTickets);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventIdentifier, isOrganizerView]);

  const formatEventDate = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `${formattedDate} • ${timeStr?.slice(0, 5) || '00:00'}`;
  };

  const updateTicket = (ticketKey, operation) => {
    setTickets(prev => ({
      ...prev,
      [ticketKey]: operation === 'add' ? prev[ticketKey] + 1 : Math.max(0, prev[ticketKey] - 1)
    }));
  };

  const total = event?.tickets?.reduce((sum, ticket) => {
    const ticketKey = ticket.ticket_id;
    return sum + ((tickets[ticketKey] || 0) * parseFloat(ticket.price || 0));
  }, 0) || 0;

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = isFavorited
      ? favorites.filter(id => id !== event.event_id)
      : [...favorites, event.event_id];
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorited(!isFavorited);
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/event/${event.event_id}`;
    const title = event.title;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=Check out ${title}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=Check out ${title} ${url}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Event link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const faqs = ['Are tickets refundable?', 'What is the age limit?', 'Is there parking?'];

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

      <section className="relative w-full h-40 md:h-30 lg:h-[400px] bg-gray-200">
        <img 
          src={event?.banner_image || 'https://via.placeholder.com/1498x655?text=Event'} 
          alt={event?.title} 
          className="w-full h-full object-cover"
        />
        
        {event && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 backdrop-blur-md rounded-xl  md:px-8 md:py-3 z-10 flex items-center gap-8">
            <div className="flex items-center gap-3 text-white whitespace-nowrap">
              <svg className="w-6 h-5 flex-shrink-0" viewBox="0 0 27.2319 23" fill="none">
                <path d="M18.1546 1.91667V5.75M9.07731 1.91667V5.75M3.40399 9.58333H23.8279M5.67332 3.83333H21.5586C22.8119 3.83333 23.8279 4.69145 23.8279 5.75V19.1667C23.8279 20.2252 22.8119 21.0833 21.5586 21.0833H5.67332C4.42 21.0833 3.40399 20.2252 3.40399 19.1667V5.75C3.40399 4.69145 4.42 3.83333 5.67332 3.83333Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-sm md:text-base">{formatEventDate(event.event_date, event.start_time)}</span>
            </div>
            <div className="flex items-center gap-3 text-white whitespace-nowrap">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12ZM12 22C9.31667 19.7167 7.3125 17.5958 5.9875 15.6375C4.6625 13.6792 4 11.8667 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 11.8667 19.3375 13.6792 18.0125 15.6375C16.6875 17.5958 14.6833 19.7167 12 22Z" fill="white"/>
              </svg>
              <span className="font-bold text-sm md:text-base">{event.location}</span>
            </div>
          </div>
        )}
      </section>

      <main className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-16 h-16 p-2 border-2 border-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                  <path d="M33.3333 35V31.6667C33.3333 29.8986 32.631 28.2029 31.3807 26.9526C30.1305 25.7024 28.4348 25 26.6667 25H13.3333C11.5652 25 9.86953 25.7024 8.61929 26.9526C7.36905 28.2029 6.66667 29.8986 6.66667 31.6667V35M26.6667 11.6667C26.6667 15.3486 23.6819 18.3333 20 18.3333C16.3181 18.3333 13.3333 15.3486 13.3333 11.6667C13.3333 7.98477 16.3181 5 20 5C23.6819 5 26.6667 7.98477 26.6667 11.6667Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-lg md:text-xl font-bold text-slate-900">Organized by {event.organizer_name}</p>
            </div>

            <section className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">About This Event</h2>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                {event?.description}
              </p>
            </section>

            <section>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Rules & FAQs</h2>
              <div className="space-y-0 border border-slate-300 rounded-lg overflow-hidden">
                {faqs.map((q, i) => (
                  <div key={i}>
                    <button 
                      onClick={() => toggleFAQ(i)}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-slate-50 border-b border-slate-300 last:border-b-0 transition-colors"
                    >
                      <span className="text-lg md:text-xl font-semibold text-slate-900 flex-1 text-left">{q}</span>
                      <div 
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                        style={{ transform: `rotate(${expandedFAQ === i ? 180 : 0}deg)` }}
                      >
                        <Plus className="w-6 h-6 text-slate-700" />
                      </div>
                    </button>
                    {expandedFAQ === i && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-300">
                        <p className="text-base md:text-lg text-slate-700">Answer to: {q}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-slate-50 rounded-xl overflow-hidden shadow-lg  top-[119px] max-h-[calc(100vh-119px)] flex flex-col">
              <div className="bg-slate-900 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">Select Tickets</h3>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                
                {event?.tickets && event.tickets.length > 0 ? (
                  <>
                    {event.tickets.map((ticket) => {
                      const ticketKey = ticket.ticket_id;
                      const ticketName = ticket.ticket_name || ticket.ticket_type || 'Ticket';
                      const ticketPrice = parseFloat(ticket.price || 0);
                      const available = ticket.quantity_available || 0;
                      const selectedQuantity = tickets[ticketKey] || 0;
                      const remainingAfterSelection = available - selectedQuantity;
                      
                      return (
                        <div key={ticketKey} className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900">{ticketName} - ${ticketPrice.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">{remainingAfterSelection} left</p>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-200 p-2 rounded-lg flex-shrink-0">
                            <button onClick={() => updateTicket(ticketKey, 'sub')} className="p-1.5 hover:bg-white rounded transition-colors"><Minus size={16} className="text-slate-700" /></button>
                            <span className="font-bold text-slate-900 min-w-[20px] text-center text-sm">{tickets[ticketKey] || 0}</span>
                            <button onClick={() => updateTicket(ticketKey, 'add')} className="p-1.5 hover:bg-white rounded transition-colors"><Plus size={16} className="text-slate-700" /></button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                      <span className="font-bold text-slate-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-base font-semibold text-slate-600">No tickets available</p>
                )}

                <button onClick={() => navigate(`/book-ticket/${eventIdentifier}`, { 
                  state: { 
                    selectedTickets: tickets,
                    event: event
                  }
                })} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Book Ticket
                </button>

              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
