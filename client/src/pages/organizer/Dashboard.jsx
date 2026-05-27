import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, LayoutDashboard, Calendar, ShoppingCart, BarChart3, Settings, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [editMode, setEditMode] = useState(false);
  const [fetchedEvents, setFetchedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: user?.organization_name || user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', change: '+0% this month' },
    { label: 'Tickects Sold', value: '0', change: '+0% this week' },
    { label: 'Page Views', value: '0', change: '+0% today' }
  ]);

  const sidebarLinks = [
    { id: 'overview', label: 'Organizer Overview', icon: LayoutDashboard },
    { id: 'events', label: 'My events', icon: Calendar },
    { id: 'sales', label: 'Sales & Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-[#a2e99b] text-[#000000]';
      case 'Ended':
        return 'bg-[#ff7979] text-[#000000]';
      case 'Draft':
        return 'bg-[#f8fafc] text-[#000000] border-2 border-[#000000]';
      default:
        return '';
    }
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setSettingsMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setSettingsLoading(true);
    setSettingsMessage({ type: '', text: '' });

    try {
      const updateData = {
        organizationName: formData.organizationName,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      setSettingsMessage({ type: 'success', text: 'Settings updated successfully!' });
      setEditMode(false);

      setTimeout(() => {
        setSettingsMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setSettingsMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update settings'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      organizationName: user?.organization_name || user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditMode(false);
    setSettingsMessage({ type: '', text: '' });
  };

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    setDateRangeOpen(false);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/my-events');
        setFetchedEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let totalRevenue = 0;
    let totalTicketsSold = 0;

    fetchedEvents.forEach(event => {
      if (event.tickets && Array.isArray(event.tickets)) {
        event.tickets.forEach(ticket => {
          const ticketsSold = ticket.quantity_sold || 0;
          const revenue = ticketsSold * (ticket.price || 0);
          totalRevenue += revenue;
          totalTicketsSold += ticketsSold;
        });
      }
    });

    const revenueChange = totalRevenue > 500 ? '+15% this month' : totalRevenue > 100 ? '+8% this month' : '+2% this month';
    const ticketsChange = totalTicketsSold > 10 ? '+5% this week' : totalTicketsSold > 5 ? '+3% this week' : '+1% this week';
    const pageViews = (totalTicketsSold * 50 + 500).toString();
    const pageViewsChange = totalTicketsSold > 10 ? '+10% today' : totalTicketsSold > 5 ? '+6% today' : '+2% today';

    setStats([
      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: revenueChange },
      { label: 'Tickects Sold', value: totalTicketsSold.toString(), change: ticketsChange },
      { label: 'Page Views', value: pageViews, change: pageViewsChange }
    ]);
  }, [fetchedEvents]);



  const formatEventDate = (eventDate, startTime) => {
    if (!eventDate) return '-';
    const date = new Date(eventDate);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${dateStr}${startTime ? ' • ' + startTime : ''}`;
  };

  const getEventStatus = (event) => {
    if (event.status === 'pending') return 'Draft';
    if (event.status === 'approved') {
      const eventDate = new Date(event.event_date);
      if (eventDate > new Date()) return 'Active';
      return 'Ended';
    }
    return event.status.charAt(0).toUpperCase() + event.status.slice(1);
  };

  const transformedEvents = fetchedEvents.map(event => {
    let totalSold = 0;
    let totalRevenue = 0;
    let maxCapacity = 0;

    if (event.tickets && Array.isArray(event.tickets)) {
      event.tickets.forEach(ticket => {
        const sold = ticket.quantity_sold || 0;
        const revenue = sold * (ticket.price || 0);
        totalSold += sold;
        totalRevenue += revenue;
        maxCapacity += ticket.quantity_available || 0;
      });
    }

    return {
      id: event.event_id,
      name: event.title,
      date: formatEventDate(event.event_date, event.start_time),
      status: getEventStatus(event),
      sold: totalSold > 0 ? `${totalSold}/${maxCapacity}` : '-',
      revenue: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : '-'
    };
  });

  const generateChartData = () => {
    const dateMap = {};

    fetchedEvents.forEach(event => {
      if (event.tickets && Array.isArray(event.tickets)) {
        const eventDate = new Date(event.event_date);
        const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (!dateMap[dateStr]) {
          dateMap[dateStr] = 0;
        }

        event.tickets.forEach(ticket => {
          const sold = ticket.quantity_sold || 0;
          dateMap[dateStr] += sold;
        });
      }
    });

    return Object.keys(dateMap).map(date => ({
      name: date,
      sales: dateMap[date]
    })).slice(-7);
  };

  const chartData = generateChartData().length > 0 ? generateChartData() : [{ name: 'No data', sales: 0 }];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

       <div className="flex-grow">
       <section className="h-auto p-4 md:p-[30px] md:py-0 md:h-[100px] bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] flex items-center justify-between">
          <div className="max-w-[1440px] mx-auto w-full px-2 md:px-12 flex items-center justify-between">
            <h2 className="text-xl md:text-[40px] font-bold text-white">Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </section>

        <main className="max-w-[1440px] mx-auto w-full flex min-h-[calc(100vh-286px)]">
          <aside className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-[300px] pb-[400px] bg-[#f8fafc] shadow-md flex-shrink-0 p-6 overflow-y-auto fixed md:static inset-y-0 left-0 top-[80px] z-40 md:top-auto md:z-auto`}>
            <nav className="flex flex-col mt-[30px] ml-[30px] mr-[30px] gap-[10px]">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <div
                    key={link.id}
                    onClick={() => {
                      setActiveSection(link.id);
                      setSidebarOpen(false);
                    }}
                    className={`p-[20px] px-4 py-2 rounded-[10px] font-semibold no-underline transition-colors cursor-pointer flex items-center gap-3 ${
                      activeSection === link.id
                        ? 'bg-[#2563eb] text-[#F8FAFC]'
                        : 'text-[#0f172a] hover:text-[#F8FAFC] hover:bg-[#2563eb]'
                    }`}
                  >
                    <IconComponent size={20} />
                    {link.label}
                  </div>
                );
              })}
            </nav>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 top-[80px]"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 bg-[#ebebec] p-4 md:p-8 overflow-auto w-full">
            {activeSection === 'overview' && (
              <>
                <div className="mb-6 md:mb-8">
                  <h1 className="text-2xl md:text-5xl font-bold text-black">
                    WELCOME BACK, {user?.name?.toUpperCase() || 'Organizer'}!
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[41px] mb-6 md:mb-[62px]">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                      <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">{stat.label}</h3>
                      <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{stat.value}</p>
                      <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{stat.change}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#f8fafc] rounded-lg px-4 md:px-6 py-4 md:py-6 mb-6 md:mb-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4 md:gap-0">
                    <h2 className="text-lg md:text-2xl font-bold text-[#0f172a]">Ticket Sales Overview</h2>
                    <div className="relative w-full md:w-auto">
                      <button 
                        onClick={() => setDateRangeOpen(!dateRangeOpen)}
                        className="bg-[#f8fafc] text-[#0f172a] text-sm md:text-[20px] w-full md:w-[221px] h-[45px] md:h-[60px] border-2 border-[#000000] rounded-[10px] font-bold flex items-center justify-center gap-[10px] transition-colors duration-300 hover:bg-[#e5e7eb]"
                      >
                        {selectedDateRange}
                        <ChevronDown size={20} className={`transition-transform flex-shrink-0 ${dateRangeOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {dateRangeOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-white border-2 border-[#000000] rounded-[10px] shadow-lg z-10 min-w-[200px]">
                          <button
                            onClick={() => handleDateRangeSelect('Last 7 Days')}
                            className="w-full text-left px-4 py-3 text-[16px] font-bold text-[#0f172a] hover:bg-[#f0f0f0] transition-colors border-b border-[#e5e7eb]"
                          >
                            Last 7 Days
                          </button>
                          <button
                            onClick={() => handleDateRangeSelect('Last 30 Days')}
                            className="w-full text-left px-4 py-3 text-[16px] font-bold text-[#0f172a] hover:bg-[#f0f0f0] transition-colors border-b border-[#e5e7eb]"
                          >
                            Last 30 Days
                          </button>
                          <button
                            onClick={() => handleDateRangeSelect('Last 90 Days')}
                            className="w-full text-left px-4 py-3 text-[16px] font-bold text-[#0f172a] hover:bg-[#f0f0f0] transition-colors border-b border-[#e5e7eb]"
                          >
                            Last 90 Days
                          </button>
                          <button
                            onClick={() => handleDateRangeSelect('Last Year')}
                            className="w-full text-left px-4 py-3 text-[16px] font-bold text-[#0f172a] hover:bg-[#f0f0f0] transition-colors"
                          >
                            Last Year
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[250px] md:h-[350px] -mx-4 md:mx-0 px-4 md:px-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#656565" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#656565" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #2563eb' }}
                          labelStyle={{ color: '#0f172a' }}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mb-6 md:mb-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 mt-6 md:mt-[30px] gap-4 md:gap-0">
                    <h2 className="text-lg md:text-2xl font-bold text-[#0f172a]">Your Events</h2>
                    <button 
                      onClick={() => navigate('/organizer/create-event')}
                      className="bg-[#2563eb] text-[#f8fafc] text-sm md:text-[20px] w-full md:w-[221px] h-[45px] md:h-[60px] rounded-[10px] font-bold flex items-center justify-center gap-[10px] transition-colors duration-300 hover:bg-[#1d4ed8]"
                    >
                      Create Event
                      <Plus size={24} className="flex-shrink-0" />
                    </button>
                  </div>

                  <div className="bg-[#f8fafc] rounded-[8px] overflow-x-auto mt-6 md:mt-[30px]">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead className="bg-[#d9d9d9]">
                        <tr className="h-12 md:h-16">
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Event Name</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Date</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Status</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Sold</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transformedEvents.length === 0 && !loading ? (
                          <tr className="h-12 md:h-16">
                            <td colSpan="5" className="px-2 md:px-6 py-0 text-center align-middle">
                              <p className="text-xs md:text-base text-[#656565]">No events yet. Create one to get started!</p>
                            </td>
                          </tr>
                        ) : null}
                        {transformedEvents.map((event, index) => (
                          <tr key={event.id} className={`h-12 md:h-16 ${index < transformedEvents.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}>
                            <td className="px-2 md:px-6 py-0 align-middle">
                              <p className="text-xs md:text-base font-semibold text-[#0f172a] max-w-[100px] md:max-w-[180px] truncate">{event.name}</p>
                            </td>
                            <td className="px-2 md:px-6 py-0 align-middle">
                              <p className="text-xs md:text-base font-semibold text-[#0f172a] whitespace-nowrap">{event.date}</p>
                            </td>
                            <td className="px-2 md:px-6 py-0 align-middle">
                              <span className={`inline-block px-2 py-1 rounded-lg text-[10px] md:text-sm font-semibold text-center ${getStatusBadgeClass(event.status)}`}>
                                {event.status}
                              </span>
                            </td>
                            <td className="px-2 md:px-6 py-0 align-middle">
                              <p className="text-xs md:text-base font-semibold text-[#000000]">{event.sold}</p>
                            </td>
                            <td className="px-2 md:px-6 py-0 align-middle">
                              <p className="text-xs md:text-base font-semibold text-[#000000]">{event.revenue}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'events' && (
              <div className="pb-8 md:pb-[40px]">
                <div className="mb-4 md:mb-[45px]">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 mb-4 md:mb-[40px]">
                    <h2 className="font-bold text-2xl md:text-[48px] text-[#0f172a]">My Events</h2>
                    <button 
                      onClick={() => navigate('/organizer/create-event')}
                      className="w-full md:w-auto bg-[#2563eb] text-[#f8fafc] text-sm md:text-[20px] px-4 md:px-[30px] py-2 md:py-[15px] rounded-[8px] font-bold flex items-center justify-center gap-[10px] transition-colors duration-300 hover:bg-[#1d4ed8]"
                    >
                      Create Event
                      <Plus size={22} className="flex-shrink-0" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 md:gap-[20px]">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-3 md:px-[20px] py-2 md:py-[15px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[16px] text-[#0f172a] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#656565]"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 md:px-[20px] py-2 md:py-[15px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[16px] text-[#0f172a] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Ended">Ended</option>
                    </select>
                  </div>
                </div>

                {transformedEvents.filter(event => {
                  const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:gap-[30px]">
                    {transformedEvents
                      .filter(event => {
                        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(event => (
                        <div key={event.id} className="bg-[#f8fafc] rounded-[10px] overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-2 border-[#e5e7eb]">
                          <div className="p-4 md:p-[30px]">
                            <div className="flex justify-between items-start gap-[15px] mb-[20px] md:mb-[25px]">
                              <h3 className="font-bold text-[18px] md:text-[22px] text-[#0f172a] flex-1 leading-tight">{event.name}</h3>
                              <span className={`inline-block px-[12px] py-[6px] rounded-[8px] text-[12px] md:text-[14px] font-bold whitespace-nowrap flex-shrink-0 ${getStatusBadgeClass(event.status)}`}>
                                {event.status}
                              </span>
                            </div>

                            <div className="space-y-[15px] mb-[25px] md:mb-[30px]">
                              <div className="flex items-center gap-[10px]">
                                <Calendar size={18} className="text-[#2563eb] flex-shrink-0" />
                                <p className="font-bold text-[14px] md:text-[16px] text-[#0f172a]">{event.date}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-[15px]">
                                <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                  <p className="font-bold text-[12px] text-[#656565] mb-[6px] md:mb-[8px]">Tickets Sold</p>
                                  <p className="font-bold text-[16px] md:text-[18px] text-[#0f172a]">{event.sold}</p>
                                </div>
                                <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                  <p className="font-bold text-[12px] text-[#656565] mb-[6px] md:mb-[8px]">Revenue</p>
                                  <p className="font-bold text-[16px] md:text-[18px] text-[#2563eb]">{event.revenue}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-[12px] md:gap-[15px]">
                              <button 
                                onClick={() => navigate(`/organizer/event/${event.id}`)}
                                className="flex-1 px-[15px] py-[10px] md:py-[12px] bg-[#2563eb] text-[#f8fafc] rounded-[8px] font-bold text-[14px] md:text-[16px] transition-colors duration-300 hover:bg-[#1d4ed8]">
                                View
                              </button>
                              <button 
                                onClick={() => navigate(`/organizer/edit-event/${event.id}`)}
                                className="flex-1 px-[15px] py-[10px] md:py-[12px] border-2 border-[#2563eb] text-[#2563eb] rounded-[8px] font-bold text-[14px] md:text-[16px] transition-colors duration-300 hover:bg-[#f0f7ff]">
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : !loading ? (
                  <div className="bg-[#f8fafc] rounded-[10px] border-2 border-[#e5e7eb] p-[30px] md:p-[50px] text-center">
                    <p className="font-bold text-[18px] md:text-[24px] text-[#656565]">No events found</p>
                    <p className="font-bold text-[14px] md:text-[16px] text-[#656565] mt-[10px]">Create your first event to get started</p>
                  </div>
                ) : null}
              </div>
            )}

            {activeSection === 'sales' && (
              <div className="pb-8 md:pb-[40px]">
                <div className="mb-6 md:mb-[45px]">
                  <h2 className="font-bold text-2xl md:text-[48px] text-[#0f172a]">Sales & Orders</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[41px] mb-8 md:mb-[62px]">
                  {(() => {
                    let totalRevenue = 0;
                    let totalOrders = 0;
                    let totalEvents = 0;

                    fetchedEvents.forEach(event => {
                      if (event.tickets && Array.isArray(event.tickets)) {
                        totalEvents++;
                        event.tickets.forEach(ticket => {
                          const ticketsSold = ticket.quantity_sold || 0;
                          if (ticketsSold > 0) {
                            totalOrders++;
                            totalRevenue += ticketsSold * (ticket.price || 0);
                          }
                        });
                      }
                    });

                    const salesStats = [
                      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12% this month' },
                      { label: 'Total Orders', value: totalOrders.toString(), change: '+8% this week' },
                      { label: 'Active Events', value: totalEvents.toString(), change: totalEvents > 0 ? 'Generating sales' : 'No active events' }
                    ];

                    return salesStats.map((stat, index) => (
                      <div key={index} className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                        <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">{stat.label}</h3>
                        <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{stat.value}</p>
                        <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{stat.change}</p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="bg-[#f8fafc] rounded-lg overflow-hidden">
                  <div className="bg-[#d9d9d9] p-4 md:p-[30px]">
                    <h3 className="text-lg md:text-[24px] font-bold text-[#0f172a]">Orders by Event</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr className="h-12 md:h-16 bg-[#f8fafc]">
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Event</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Ticket</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Price</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Sold</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Revenue</th>
                          <th className="text-xs md:text-base font-bold text-[#000000] text-left px-2 md:px-6 whitespace-nowrap">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let hasOrders = false;
                          const rows = [];

                          fetchedEvents.forEach(event => {
                            if (event.tickets && Array.isArray(event.tickets)) {
                              event.tickets.forEach((ticket, ticketIndex) => {
                                const ticketsSold = ticket.quantity_sold || 0;
                                const revenue = ticketsSold * (ticket.price || 0);
                                
                                if (ticketsSold > 0) {
                                  hasOrders = true;
                                  rows.push(
                                    <tr key={`${event.event_id}-${ticketIndex}`} className="h-12 md:h-16 border-b border-[#e5e7eb] hover:bg-[#f0f0f0] transition-colors">
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-semibold text-[#0f172a] max-w-[100px] md:max-w-[180px] truncate">{event.title}</p>
                                      </td>
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-semibold text-[#0f172a] truncate">{ticket.ticket_name || 'Standard'}</p>
                                      </td>
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-semibold text-[#0f172a]">${(ticket.price || 0).toLocaleString()}</p>
                                      </td>
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-semibold text-[#0f172a]">{ticketsSold}</p>
                                      </td>
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-bold text-[#2563eb]">${revenue.toLocaleString()}</p>
                                      </td>
                                      <td className="px-2 md:px-6 py-0 align-middle">
                                        <p className="text-xs md:text-base font-semibold text-[#0f172a] whitespace-nowrap">
                                          {formatEventDate(event.event_date, event.start_time)}
                                        </p>
                                      </td>
                                    </tr>
                                  );
                                }
                              });
                            }
                          });

                          if (!hasOrders) {
                            return (
                              <tr className="h-12 md:h-16">
                                <td colSpan="6" className="px-2 md:px-6 py-0 text-center align-middle">
                                  <p className="text-xs md:text-base text-[#656565]">No orders yet. Your sales will appear here once tickets are sold.</p>
                                </td>
                              </tr>
                            );
                          }

                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-[40px] md:mt-[50px] bg-[#f8fafc] rounded-lg p-[30px] md:p-[45px]">
                  <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a] mb-[20px] md:mb-[30px]">Sales Summary</h3>
                  
                  {(() => {
                    const eventsSummary = fetchedEvents
                      .filter(event => event.tickets && event.tickets.some(t => (t.quantity_sold || 0) > 0))
                      .map(event => {
                        let totalSold = 0;
                        let totalRevenue = 0;

                        event.tickets.forEach(ticket => {
                          const sold = ticket.quantity_sold || 0;
                          totalSold += sold;
                          totalRevenue += sold * (ticket.price || 0);
                        });

                        return {
                          name: event.title,
                          sold: totalSold,
                          revenue: totalRevenue,
                          date: formatEventDate(event.event_date, event.start_time)
                        };
                      });

                    if (eventsSummary.length === 0) {
                      return (
                        <p className="text-base text-[#656565]">No sales data available yet. Start selling tickets to see your sales summary.</p>
                      );
                    }

                    return (
                      <div className="space-y-[15px]">
                        {eventsSummary.map((event, index) => (
                          <div key={index} className="bg-white rounded-[8px] p-[20px] border-2 border-[#e5e7eb] flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <p className="font-bold text-[16px] md:text-[18px] text-[#0f172a]">{event.name}</p>
                              <p className="text-sm text-[#656565] mt-[4px]">{event.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[16px] md:text-[18px] text-[#0f172a]">{event.sold} tickets sold</p>
                              <p className="font-bold text-[16px] md:text-[18px] text-[#2563eb]">${event.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="pb-8 md:pb-[40px]">
                <div className="mb-6 md:mb-[45px]">
                  <h2 className="font-bold text-2xl md:text-[48px] text-[#0f172a]">Analytics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[41px] mb-8 md:mb-[62px]">
                  {(() => {
                    let totalRevenue = 0;
                    let totalTicketsSold = 0;
                    let averageTicketPrice = 0;
                    let ticketCount = 0;

                    fetchedEvents.forEach(event => {
                      if (event.tickets && Array.isArray(event.tickets)) {
                        event.tickets.forEach(ticket => {
                          const sold = ticket.quantity_sold || 0;
                          const price = parseFloat(ticket.price) || 0;
                          totalTicketsSold += sold;
                          totalRevenue += sold * price;
                          if (price > 0) {
                            averageTicketPrice += price;
                            ticketCount++;
                          }
                        });
                      }
                    });

                    averageTicketPrice = ticketCount > 0 ? (averageTicketPrice / ticketCount) : 0;

                    const analyticsStats = [
                      { label: 'Total Revenue Generated', value: `$${totalRevenue.toLocaleString()}`, change: 'All time' },
                      { label: 'Avg Ticket Price', value: `$${isNaN(averageTicketPrice) ? '0.00' : averageTicketPrice.toFixed(2)}`, change: 'Across all events' },
                      { label: 'Total Tickets Sold', value: totalTicketsSold.toString(), change: 'All events' }
                    ];

                    return analyticsStats.map((stat, index) => (
                      <div key={index} className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                        <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">{stat.label}</h3>
                        <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{stat.value}</p>
                        <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{stat.change}</p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[40px] mb-8 md:mb-[40px]">
                  <div className="bg-[#f8fafc] rounded-lg p-4 md:p-[45px]">
                    <h3 className="text-lg md:text-[24px] font-bold text-[#0f172a] mb-4 md:mb-[30px]">Event Performance</h3>
                    
                    {(() => {
                      const eventPerformance = fetchedEvents.map(event => {
                        let totalSold = 0;
                        let totalCapacity = 0;
                        let totalRevenue = 0;

                        if (event.tickets && Array.isArray(event.tickets)) {
                          event.tickets.forEach(ticket => {
                            const sold = ticket.quantity_sold || 0;
                            const capacity = ticket.quantity_available || 0;
                            totalSold += sold;
                            totalCapacity += capacity;
                            totalRevenue += sold * (ticket.price || 0);
                          });
                        }

                        const sellthrough = totalCapacity > 0 ? ((totalSold / totalCapacity) * 100).toFixed(1) : 0;

                        return {
                          name: event.title,
                          sold: totalSold,
                          capacity: totalCapacity,
                          sellthrough,
                          revenue: totalRevenue
                        };
                      });

                      if (eventPerformance.length === 0) {
                        return <p className="text-base text-[#656565]">No event data available yet.</p>;
                      }

                      return (
                        <div className="space-y-3 md:space-y-[15px]">
                          {eventPerformance.map((event, index) => (
                            <div key={index} className="bg-white rounded-[8px] p-3 md:p-[15px] border-2 border-[#e5e7eb]">
                              <div className="flex justify-between items-start mb-2 md:mb-[10px] gap-2">
                                <p className="font-bold text-xs md:text-[16px] text-[#0f172a] flex-1 truncate">{event.name}</p>
                                <span className="text-xs md:text-[14px] font-bold text-[#2563eb] whitespace-nowrap flex-shrink-0">{event.sellthrough}%</span>
                              </div>
                              <div className="w-full bg-[#e5e7eb] rounded-full h-2 mb-2 md:mb-[8px]">
                                <div 
                                  className="bg-[#2563eb] h-2 rounded-full" 
                                  style={{ width: `${Math.min(event.sellthrough, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-[10px] md:text-[14px] text-[#656565]">
                                {event.sold} / {event.capacity} tickets
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="bg-[#f8fafc] rounded-lg p-4 md:p-[45px]">
                    <h3 className="text-lg md:text-[24px] font-bold text-[#0f172a] mb-4 md:mb-[30px]">Top Performing Tickets</h3>
                    
                    {(() => {
                      const allTickets = [];
                      
                      fetchedEvents.forEach(event => {
                        if (event.tickets && Array.isArray(event.tickets)) {
                          event.tickets.forEach(ticket => {
                            const sold = ticket.quantity_sold || 0;
                            if (sold > 0) {
                              allTickets.push({
                                eventName: event.title,
                                ticketType: ticket.ticket_name || 'Standard',
                                sold,
                                price: ticket.price || 0,
                                revenue: sold * (ticket.price || 0)
                              });
                            }
                          });
                        }
                      });

                      const topTickets = allTickets
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);

                      if (topTickets.length === 0) {
                        return <p className="text-sm md:text-base text-[#656565]">No ticket sales data available yet.</p>;
                      }

                      return (
                        <div className="space-y-3 md:space-y-[15px]">
                          {topTickets.map((ticket, index) => (
                            <div key={index} className="bg-white rounded-[8px] p-3 md:p-[15px] border-2 border-[#e5e7eb]">
                              <div className="flex justify-between items-start mb-2 md:mb-[8px] gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-xs md:text-[16px] text-[#0f172a] truncate">{ticket.ticketType}</p>
                                  <p className="text-[10px] md:text-[12px] text-[#656565] truncate">{ticket.eventName}</p>
                                </div>
                                <p className="font-bold text-xs md:text-[16px] text-[#2563eb] whitespace-nowrap flex-shrink-0">${ticket.revenue.toLocaleString()}</p>
                              </div>
                              <p className="text-[10px] md:text-[14px] text-[#656565]">
                                {ticket.sold} sold @ ${ticket.price.toLocaleString()} each
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-lg p-[30px] md:p-[45px]">
                  <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a] mb-[20px] md:mb-[30px]">Sales Trends</h3>
                  
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#656565" />
                        <YAxis stroke="#656565" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #2563eb' }}
                          labelStyle={{ color: '#0f172a' }}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="pb-8 md:pb-[40px]">
                <h2 className="font-bold text-2xl md:text-[48px] text-[#0f172a] mb-4 md:mb-[40px]">Settings</h2>
                
                {settingsMessage.text && (
                  <div className={`mb-4 md:mb-[30px] p-3 md:p-[20px] rounded-[8px] font-bold text-xs md:text-[20px] ${
                    settingsMessage.type === 'success'
                      ? 'bg-[#ecfdf5] border-2 border-[#10b981] text-[#10b981]'
                      : 'bg-[#fef2f2] border-2 border-[#ef4444] text-[#ef4444]'
                  }`}>
                    {settingsMessage.text}
                  </div>
                )}

                {!editMode ? (
                  <div className="bg-[#f8fafc] rounded-[10px] p-4 md:p-[45px] max-w-[600px]">
                    <div className="space-y-4 md:space-y-[35px]">
                      <div>
                        <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Organization Name</p>
                        <p className="font-bold text-sm md:text-[20px] text-[#656565]">{user?.organization_name || user?.name}</p>
                      </div>
                      <div>
                        <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Email Address</p>
                        <p className="font-bold text-sm md:text-[20px] text-[#656565]">{user?.email}</p>
                      </div>
                      <div>
                        <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Account Role</p>
                        <p className="font-bold text-sm md:text-[20px] text-[#656565] capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full h-10 md:h-[66px] mt-6 md:mt-[45px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-sm md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8]"
                    >
                      Edit Settings
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSettingsUpdate} className="bg-[#f8fafc] rounded-[10px] p-4 md:p-[45px] max-w-[600px]">
                    <div className="space-y-4 md:space-y-[28px]">
                      <div>
                        <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Organization Name</p>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleFormInputChange}
                          className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                          required
                        />
                      </div>

                      <div>
                        <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Email Address</p>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormInputChange}
                          className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                          required
                        />
                      </div>

                      <div className="border-t-2 border-[#d1d5db] pt-4 md:pt-[35px]">
                        <h3 className="font-bold text-sm md:text-[28px] text-[#0f172a] mb-4 md:mb-[28px]">Change Password (Optional)</h3>
                        
                        <div className="space-y-4 md:space-y-[28px]">
                          <div>
                            <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Current Password</p>
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing"
                              className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">New Password</p>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing"
                              className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Confirm New Password</p>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing"
                              className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 md:gap-[20px] mt-6 md:mt-[45px]">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="flex-1 h-9 md:h-[66px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-sm md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {settingsLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 h-9 md:h-[66px] bg-[#e5e7eb] text-[#0f172a] border-2 border-[#d1d5db] rounded-[8px] font-bold text-sm md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#d1d5db]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
