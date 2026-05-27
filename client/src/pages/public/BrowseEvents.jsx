import React, { useState, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import Header from '../../components/layout/Header';

import Footer from '../../components/layout/Footer';

import { Search, MapPin, Calendar } from 'lucide-react';

import api from '../../api/axios';



const BrowseEvents = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [location, setLocation] = useState('');

  const [priceRange, setPriceRange] = useState(500);

  const [startDate, setStartDate] = useState('');

  const [endDate, setEndDate] = useState('');

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);



  useEffect(() => {

    const fetchEvents = async () => {

      try {

        setLoading(true);

        const response = await api.get('/events/public');

        const formattedEvents = response.data.map(event => {

          const eventDate = new Date(event.event_date);

          const timeStr = event.start_time ? event.start_time.substring(0, 5) : '00:00';

          const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

         

          const minPrice = event.tickets && event.tickets.length > 0

            ? Math.min(...event.tickets.map(t => parseFloat(t.price) || 0))

            : 0;



          return {

            id: event.event_id,

            title: event.title,

            date: `${dateStr} • ${timeStr}`,

            eventDate: event.event_date,

            location: event.location,

            price: minPrice,

            image: event.banner_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400",

            color: event.category && ['Music & Concerts'].includes(event.category) ? 'orange' : 'blue',

            category: event.category || 'Other'

          };

        });

        setEvents(formattedEvents);

        setError(null);

      } catch (err) {

        console.error('Error fetching events:', err);

        setError('Failed to load events');

        setEvents([]);

      } finally {

        setLoading(false);

      }

    };



    fetchEvents();

  }, []);



  const handleCategoryChange = (category) => {

    setSelectedCategories(prev =>

      prev.includes(category)

        ? prev.filter(cat => cat !== category)

        : [...prev, category]

    );

  };



  const filteredEvents = events.filter(event => {

    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

                          event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);

    const matchesLocation = location === '' || event.location.toLowerCase().includes(location.toLowerCase());

    const matchesPrice = event.price <= priceRange;

    const matchesStartDate = startDate === '' || event.eventDate >= startDate;

    const matchesEndDate = endDate === '' || event.eventDate <= endDate;

   

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesStartDate && matchesEndDate;

  });



  return (

    <div className="font-sans bg-white min-h-screen flex flex-col">

      <Header />



      <section className="bg-slate-50 py-6 md:py-10 px-4 md:px-8">

        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <h1 className="font-bold text-4xl md:text-5xl text-black">Browse All Events</h1>

            <div className="bg-white border border-slate-300 rounded-lg flex items-center w-full md:w-150 px-4 py-2 flex-shrink-0">

              <input

                type="text"

                placeholder="Search by keyword..."

                value={searchQuery}

                onChange={(e) => setSearchQuery(e.target.value)}

                className="flex-1 border-none  outline-none font-semibold text-base text-blue-600 placeholder-blue-500"

              />

              <button className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 font-bold text-base hover:bg-blue-700 transition-colors flex-shrink-0">

                <span className="hidden sm:inline">Search</span>

                <Search size={20} strokeWidth={2.5} />

              </button>

            </div>

          </div>

        </div>

      </section>

      <main className="bg-[linear-gradient(90deg,#2563eb_34.135%,#1d4eb8_68.269%,#153885_83.173%)] py-8 md:py-12 px-4 md:px-8">

        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

           

            <aside className="lg:col-span-2 bg-slate-50 rounded-xl p-6 md:p-8 h-fit">

              <h2 className="font-bold text-2xl md:text-3xl text-black mb-6 md:mb-8">Filters</h2>



              <div className="mb-8">

                <h3 className="font-bold text-lg md:text-xl text-black mb-4">Category</h3>

                <div className="space-y-2">

                  {['Music & Concerts', 'Tech & Conferences', 'Workshops & Education', 'Community & Spirituality', 'Sports & Fitness', 'Family & Kids', 'Art & Culture', 'Food & Beverage'].map((cat) => (

                    <label key={cat} className="flex items-center gap-3 cursor-pointer">

                      <input

                        type="checkbox"

                        checked={selectedCategories.includes(cat)}

                        onChange={() => handleCategoryChange(cat)}

                        className="w-4 h-4 cursor-pointer accent-blue-600"

                      />

                      <span className="font-medium text-sm md:text-base text-slate-900">{cat}</span>

                    </label>

                  ))}

                </div>

              </div>



              <div className="mb-8">

                <h3 className="font-bold text-lg md:text-xl text-black mb-4">Start Date</h3>

                <input

                  type="date"

                  value={startDate}

                  onChange={(e) => setStartDate(e.target.value)}

                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-sm md:text-base text-blue-600 outline-none focus:border-blue-600"

                />

              </div>



              <div className="mb-8">

                <h3 className="font-bold text-lg md:text-xl text-black mb-4">End Date</h3>

                <input

                  type="date"

                  value={endDate}

                  onChange={(e) => setEndDate(e.target.value)}

                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-sm md:text-base text-blue-600 outline-none focus:border-blue-600"

                />

              </div>



              <div className="mb-8">

                <h3 className="font-bold text-lg md:text-xl text-black mb-4">Location</h3>

                <input

                  type="text"

                  placeholder="Enter city or venue..."

                  value={location}

                  onChange={(e) => setLocation(e.target.value)}

                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-sm md:text-base text-blue-600 placeholder-blue-500 outline-none focus:border-blue-600"

                />

              </div>



              <div>

                <h3 className="font-bold text-lg md:text-xl text-black mb-4">Price Range</h3>

                <div className="mt-6">

                  <input

                    type="range"

                    min="0"

                    max="500"

                    value={priceRange}

                    onChange={(e) => setPriceRange(e.target.value)}

                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"

                  />

                  <div className="text-center font-bold text-lg md:text-xl text-black mt-4">$0 - ${priceRange}</div>

                </div>

              </div>

            </aside>



            <div className="lg:col-span-3">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {loading ? (

                  <div className="col-span-full flex items-center justify-center py-12">

                    <p className="text-xl md:text-2xl font-bold text-white">Loading events...</p>

                  </div>

                ) : error ? (

                  <div className="col-span-full flex items-center justify-center py-12">

                    <div className="text-center">

                      <p className="text-xl md:text-2xl font-bold text-white mb-2">{error}</p>

                      <p className="text-gray-200">Please try again later</p>

                    </div>

                  </div>

                ) : filteredEvents.length > 0 ? filteredEvents.map((event) => (

                  <div key={event.id} className="bg-slate-50 rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 shadow-md">

                    <div className="w-full h-48 relative flex-shrink-0">

                      <img src={event.image} alt={event.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

                      <div className={`absolute top-4 right-4 text-white font-bold text-lg px-3 py-1 rounded-md z-10 ${event.color === 'orange' ? 'bg-orange-700' : 'bg-blue-600'}`}>

                        ${event.price}

                      </div>

                    </div>



                    <div className="p-5 md:p-6 flex flex-col flex-grow">

                      <h3 className="font-bold text-base md:text-lg text-slate-900 mb-4 line-clamp-2">{event.title}</h3>

                     

                      <div className="space-y-3 mb-6 flex-grow">

                        <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">

                          <Calendar size={18} className="flex-shrink-0" />

                          <span className="line-clamp-1">{event.date}</span>

                        </div>

                        <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">

                          <MapPin size={18} className="flex-shrink-0" />

                          <span className="line-clamp-1">{event.location}</span>

                        </div>

                      </div>



                      <button onClick={() => navigate(`/event/${event.id}`)} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-base hover:bg-blue-700 transition-colors">

                        View Event

                      </button>

                    </div>

                  </div>

                )) : (

                  <div className="col-span-full flex items-center justify-center py-12">

                    <div className="text-center">

                      <p className="text-xl md:text-2xl font-bold text-white mb-2">No events found</p>

                      <p className="text-gray-200">Try adjusting your filters or search criteria</p>

                    </div>

                  </div>

                )}

              </div>

            </div>



          </div>

        </div>

      </main>



      <Footer />

    </div>

  );

};



export default BrowseEvents;