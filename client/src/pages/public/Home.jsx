import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, ArrowRight, Users, Zap, TrendingUp, ChevronRight, Mail, Sparkles, Ticket, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/public');
        const formattedEvents = response.data.slice(0, 3).map(event => {
          return {
            id: event.event_id,
            title: event.title,
            date: formatEventDate(event.event_date, event.start_time),
            location: event.location,
            price: event.tickets && event.tickets.length > 0 ? `$${event.tickets[0].price}` : '$0',
            img: event.banner_image || 'https://images.unsplash.com/photo-1551883709-2516220df0bc?auto=format&fit=crop&w=400',
          };
        });
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatEventDate = (eventDate, startTime) => {
    if (!eventDate) return '-';
    const date = new Date(eventDate);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = startTime ? new Date(`1970-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return `${dateStr}${timeStr ? ' • ' + timeStr : ''}`;
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
      setEmail('');
      setTimeout(() => setEmailSubmitted(false), 3000);
    }
  };

  // --- Static Data ---
  const categories = [
    { id: 'music', name: "Music & Concerts", img: "https://images.unsplash.com/photo-1648260029310-5f1da359af9d?auto=format&fit=crop&w=800" },
    { id: 'tech', name: "Tech & Conferences", img: "https://images.unsplash.com/photo-1582192904915-d89c7250b235?auto=format&fit=crop&w=800" },
    { id: 'workshops', name: "Workshops & Education", img: "https://images.unsplash.com/photo-1762158007836-25d13ab34c1c?auto=format&fit=crop&w=800" },
    { id: 'community', name: "Community & Spirituality", img: "https://images.unsplash.com/photo-1695938542997-a2c3f39d0dbf?auto=format&fit=crop&w=800" },
  ];

  const stats = [
    { label: "Active Events", value: "500+", icon: TrendingUp, color: "text-[#2563eb]" },
    { label: "Happy Attendees", value: "50K+", icon: Users, color: "text-[#2563eb]" },
    { label: "Organizers", value: "1K+", icon: Sparkles, color: "text-[#2563eb]" },
    { label: "Cities", value: "50+", icon: MapPin, color: "text-[#2563eb]" },
  ];

  const howItWorks = [
    { step: 1, title: "Browse Events", description: "Explore thousands of events across various categories and find what interests you.", icon: Search, bgColor: "bg-blue-100", iconColor: "text-[#2563eb]" },
    { step: 2, title: "Select & Book", description: "Choose your ticket type and quantity, then proceed to secure checkout.", icon: Ticket, bgColor: "bg-blue-100", iconColor: "text-[#2563eb]" },
    { step: 3, title: "Get Ticket", description: "Receive your ticket confirmation via email with QR code for entry.", icon: Mail, bgColor: "bg-blue-100", iconColor: "text-[#2563eb]" },
    { step: 4, title: "Enjoy Event", description: "Show your QR code at the venue entrance and enjoy the experience!", icon: Zap, bgColor: "bg-blue-100", iconColor: "text-[#2563eb]" },
  ];

  const organizerBenefits = [
    { title: "Easy Event Creation", description: "Set up your event page in minutes with our intuitive tools." },
    { title: "Real-time Analytics", description: "Track sales, attendees, and revenue as they happen." },
    { title: "Secure Payments", description: "Instant payouts and secure transaction processing." },
    { title: "Attendee Management", description: "Easily manage guest lists and check-ins via QR code." },
  ];

  return (
    <div className="font-sans bg-[#F8FAFC]">
      <Header />

      {/* === Hero Section === */}
      <section 
        className="relative h-[500px] lg:h-[600px] bg-cover bg-fixed bg-center flex items-center justify-center px-4"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/80 via-[#1d4eb8]/80 to-[#0f172a]/80"></div>

        <div className="relative z-10 w-fullmax-w-4xl text-center">
          <h1 className="bg-[linear-gradient(90deg,rgba(26,73,181,0.4)_0%,rgba(69,63,255,0.4)_46.635%,rgba(76,201,232,0.4)_100%)] backdrop-blur-sm text-white font-bold text-2xl md:text-4xl lg:text-5xl px-3 md:px-6 py-2 md:py-3 rounded-xl shadow-lg w-fit mx-auto mb-6 md:mb-12 lg:mb-20 inline-block">
            MAKE YOUR OWN SHOW
          </h1>
          <p className="text-blue-100 mt-[-45] text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Your gateway to the best concerts, conferences, workshops, and community gatherings in your city.
          </p>

          <div className="bg-white p-2 rounded-full shadow-2xl flex items-center w-full max-w-2xl mx-auto transition-transform focus-within:scale-105">
            <div className="pl-4 text-gray-400">
                <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for events, artists, or venues..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 border-none outline-none rounded-full font-medium text-gray-700 px-4 py-3 text-base placeholder-gray-400"
            />
            <button 
                onClick={handleSearch} 
                className="bg-[#2563eb] text-white border-none rounded-full px-6 py-3 font-bold text-base hover:bg-[#1d4eb8] transition-colors duration-300 flex items-center gap-2"
            >
              Search
            </button>
          </div>
        </div>
      </section>

       {/* === Stats Banner === */}
       <section className="bg-white py-12 shadow-sm relative z-20 -mt-8 mx-4 md:mx-8 lg:mx-auto max-w-6xl rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                    <stat.icon className={`w-10 h-10 mb-3 ${stat.color}`} />
                    <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                    <p className="text-gray-500 font-medium">{stat.label}</p>
                </div>
            ))}
        </div>
       </section>

      {/* === Categories Section === */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-600 text-lg">Find events that match your interests.</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center gap-1 font-semibold text-[#2563eb] hover:text-[#1d4eb8] transition-colors">
            View all categories <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link to={`/events?category=${cat.id}`} key={idx} className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-64">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white font-bold text-xl mb-2 drop-shadow-md">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center text-blue-200 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Explore <ArrowRight size={16} className="ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 md:hidden text-center">
            <Link to="/categories" className="inline-flex items-center gap-1 font-semibold text-[#2563eb]">
                View all categories <ChevronRight size={20} />
            </Link>
        </div>
      </section>

      {/* Upcoming Events Section */}

      <section className="bg-[linear-gradient(180deg,#2563eb_0.962%,#1d4eb8_51.923%,#153885_85.577%)] py-8 md:py-12 lg:py-20">

        <div className="max-w-[1440px] mx-auto px-3 md:px-4 lg:px-8">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-12 lg:mb-16 gap-3 md:gap-0">

            <h2 className="font-bold text-xl md:text-2xl lg:text-3xl text-white">Upcoming Events</h2>

            <Link to="/events" className="font-bold text-base md:text-lg lg:text-2xl text-white no-underline hover:opacity-80 transition-opacity">view all &gt;</Link>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

            {loading ? (

              <p className="text-white text-center col-span-full text-sm md:text-base">Loading events...</p>

            ) : events.length === 0 ? (

              <p className="text-white text-center col-span-full text-sm md:text-base">No events yet</p>

            ) : (

              events.map((event) => (

                <div

                  key={event.id}

                  className={`rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 flex flex-col

                    ${event.color === 'orange' ? 'bg-[linear-gradient(180deg,#ff6e14_0%,#f9a977_78.365%)]' : 'bg-[linear-gradient(180deg,#2836ff_0%,#2b7cce_59.39%,#2f97ff_100%)]'}

                  `}

                >

                  {/* Image Container */}

                  <div className="relative overflow-hidden h-40 md:h-48 lg:h-56">

                    <img

                      src={event.img}

                      alt={event.title}

                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"

                    />



                    {/* Price Tag */}

                    <div className={`absolute top-3 md:top-4 left-3 md:left-4 text-white font-bold text-sm md:text-base lg:text-lg px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg

                      ${event.color === 'orange' ? 'bg-[#c06612]' : 'bg-[#2563eb]'}

                    `}>

                      {event.price}

                    </div>

                  </div>



                  {/* Content */}

                  <div className="p-3 md:p-4 lg:p-6 flex flex-col flex-grow">

                    <h3 className="text-white font-bold mb-3 md:mb-4 text-sm md:text-base lg:text-lg line-clamp-2">{event.title}</h3>

                   

                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-grow">

                      <div className="flex items-center gap-2 md:gap-3 text-white font-semibold text-xs md:text-sm">

                        <Calendar className="w-4 md:w-5 h-4 md:h-5 shrink-0" strokeWidth={2} />

                        <span className="line-clamp-1">{event.date}</span>

                      </div>

                     

                      <div className="flex items-center gap-2 md:gap-3 text-white font-semibold text-xs md:text-sm">

                        <MapPin className="w-4 md:w-5 h-4 md:h-5 shrink-0" strokeWidth={2} />

                        <span className="line-clamp-1">{event.location}</span>

                      </div>

                    </div>



                    <button onClick={() => navigate(`/event/${event.id}`)} className={`text-white font-bold py-2 md:py-2.5 lg:py-3 px-3 md:px-4 rounded-lg w-full cursor-pointer hover:opacity-90 transition-opacity duration-300 border-none text-xs md:text-sm lg:text-base

                      ${event.color === 'orange' ? 'bg-[linear-gradient(90deg,#ff6e14_0%,#a8490e_69.712%)]' : 'bg-[linear-gradient(90deg,#2563eb_0%,#153885_69.712%)]'}

                    `}>

                      View Event

                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </section>      {/* === How It Works Section === */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto">Discovering and attending your next favorite event is as easy as 1-2-3-4.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
                {howItWorks.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center relative bg-white p-4">
                        <div className={`w-24 h-24 ${item.bgColor} rounded-full flex items-center justify-center mb-6 shadow-sm relative z-10`}>
                            <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {item.step}. {item.title}
                        </h3>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* === Organizer CTA Section === */}
      <section className="py-20 bg-[#2563eb] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
                        Host Your Next Event With Us
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl">
                        Powerful tools specifically designed for event organizers. From ticketing to check-ins, we've got you covered.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mb-10 text-white">
                        {organizerBenefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-blue-200 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
                                    <p className="text-blue-100 text-sm font-medium">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isAuthenticated && user?.role === 'organizer' ? (
                        <button onClick={() => navigate('/organizer/create-event')} className="bg-white text-[#2563eb] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition-all">
                            Create an Event Now
                        </button>
                    ) : (
                        <Link to="/register" className="inline-block">
                            <button className="bg-white text-[#2563eb] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition-all">
                                Create an Event Now
                            </button>
                        </Link>
                    )}
                </div>
                <div className="flex-1 hidden lg:block relative">
                     <img 
                        src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80" 
                        alt="Event Organizing" 
                        className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/10"
                     />
                </div>
            </div>
        </div>
      </section>

      {/* === Newsletter Section === */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Mail className="w-12 h-12 text-[#2563eb] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Never Miss an Event</h2>
            <p className="text-gray-600 text-lg mb-8">
                Subscribe to our newsletter for exclusive updates, early bird tickets, and personalized recommendations.
            </p>

            {emailSubmitted ? (
                <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl font-medium animate-fade-in inline-flex items-center gap-2">
                    <CheckCircle size={20} />
                    Thanks for subscribing! Keep an eye on your inbox.
                </div>
            ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input 
                        type="email" 
                        placeholder="Enter your email address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-lg"
                    />
                    <button type="submit" className="bg-[#2563eb] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#1d4eb8] transition-colors shadow-md whitespace-nowrap">
                        Subscribe
                    </button>
                </form>
            )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
