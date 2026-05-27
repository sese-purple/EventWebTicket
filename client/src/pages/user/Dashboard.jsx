import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Calendar, MapPin, X, LayoutDashboard, Ticket, Settings, Download, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, login } = useAuth();
  const qrRef = useRef(null);
  const [activeSection, setActiveSection] = useState(state?.section || 'overview');
  const [bookings, setBookings] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await api.get('/events/my-bookings');
        setBookings(response.data);
        if (response.data.length > 0) {
          setNextEvent(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  useEffect(() => {
    if (!nextEvent || !nextEvent.event_date || !nextEvent.start_time) return;

    const calculateCountdown = () => {
      const eventDateStr = String(nextEvent.event_date).trim();
      const eventTimeStr = String(nextEvent.start_time).trim();
      
      const dateOnly = eventDateStr.split('T')[0];
      const eventDateTime = new Date(`${dateOnly}T${eventTimeStr}`);
      
      if (isNaN(eventDateTime.getTime())) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date();
      const diff = eventDateTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  const formatEventDate = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `${formattedDate} • ${timeStr?.slice(0, 5) || '00:00'}`;
  };

  const padZero = (num) => String(num).padStart(2, '0');

  const svgToDataUrl = (svgElement) => {
    return new Promise((resolve) => {
      try {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svg);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      } catch (e) {
        console.error('Error converting SVG:', e);
        resolve(null);
      }
    });
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setProfileMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/auth/profile', updateData);
      
      login(localStorage.getItem('token'), response.data.user);
      
      setFormData({
        fullName: response.data.user.name,
        email: response.data.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);

      setTimeout(() => {
        setProfileMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditMode(false);
    setProfileMessage({ type: '', text: '' });
  };

  const downloadTicketPDF = async () => {
    const eventToDownload = selectedEvent || nextEvent;
    if (!eventToDownload) return;
    
    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 0;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setFillColor(29, 78, 216);
      pdf.rect(0, 50, pageWidth, 3, 'F');
      
      pdf.setFontSize(32);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(248, 250, 252);
      pdf.text('EVENT TICKET', pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(226, 232, 240);
      pdf.text('Your admission pass', pageWidth / 2, 28, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(219, 234, 254);
      pdf.text(`Booking ID: ${eventToDownload.booking_id}`, pageWidth / 2, 38, { align: 'center' });
      
      y = 62;
      
      pdf.setFontSize(14);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      const wrappedTitle = pdf.splitTextToSize(eventToDownload.title, pageWidth - 20);
      pdf.text(wrappedTitle, pageWidth / 2, y, { align: 'center' });
      
      y += wrappedTitle.length > 1 ? 14 : 12;
      pdf.setFontSize(10);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      const dateTimeStr = formatEventDate(eventToDownload.event_date, eventToDownload.start_time);
      pdf.text(dateTimeStr, pageWidth / 2, y, { align: 'center' });
      
      y += 8;
      const wrappedLocation = pdf.splitTextToSize(eventToDownload.location, pageWidth - 20);
      pdf.text(wrappedLocation, pageWidth / 2, y, { align: 'center' });
      
      y += wrappedLocation.length > 1 ? 14 : 10;
      y += 6;
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(15, y, pageWidth - 15, y);
      
      y += 12;
      pdf.setFillColor(248, 250, 252);
      pdf.rect(12, y - 4, pageWidth - 24, 42, 'F');
      
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(0.3);
      pdf.rect(12, y - 4, pageWidth - 24, 42);
      
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('TICKET INFORMATION', 18, y + 2);
      
      y += 10;
      const colWidth = (pageWidth - 24) / 2;
      
      pdf.setFontSize(8);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Ticket ID', 18, y);
      
      pdf.setFontSize(10);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      const wrappedTicketId = pdf.splitTextToSize(String(eventToDownload.ticket_id), colWidth - 6);
      pdf.text(wrappedTicketId, 18, y + 6);
      
      pdf.setFontSize(8);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Booking Reference', 18 + colWidth, y);
      
      pdf.setFontSize(10);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      const wrappedBookingId = pdf.splitTextToSize(String(eventToDownload.booking_id), colWidth - 6);
      pdf.text(wrappedBookingId, 18 + colWidth, y + 6);
      
      y += 22;
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(15, y, pageWidth - 15, y);
      
      y += 14;
      pdf.setFillColor(248, 250, 252);
      pdf.rect(12, y - 4, pageWidth - 24, 45, 'F');
      
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('SCAN TO VERIFY', pageWidth / 2, y + 1, { align: 'center' });
      
      y += 7;
      const baseUrl = window.location.origin;
      const qrValue = `${baseUrl}/verify-ticket/${eventToDownload.booking_id}`;
      
      if (qrRef.current) {
        const svgElement = qrRef.current.querySelector('svg');
        if (svgElement) {
          const imgData = await svgToDataUrl(svgElement);
          if (imgData) {
            pdf.addImage(imgData, 'PNG', pageWidth / 2 - 12, y, 24, 24);
          } else {
            pdf.setFontSize(8);
            pdf.setFont('Helvetica', 'normal');
            pdf.setTextColor(15, 23, 42);
            pdf.text('QR: ' + qrValue, pageWidth / 2, y + 12, { align: 'center' });
          }
        } else {
          pdf.setFontSize(8);
          pdf.setFont('Helvetica', 'normal');
          pdf.setTextColor(15, 23, 42);
          pdf.text('QR: ' + qrValue, pageWidth / 2, y + 12, { align: 'center' });
        }
      } else {
        pdf.setFontSize(8);
        pdf.setFont('Helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text('QR: ' + qrValue, pageWidth / 2, y + 12, { align: 'center' });
      }
      
      y += 28;
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(15, y, pageWidth - 15, y);
      
      y += 8;
      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('IMPORTANT', 15, y);
      
      y += 7;
      pdf.setFontSize(8);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(101, 101, 101);
      
      const infoText = [
        '• Present this ticket at event check-in',
        '• Show QR code to staff for validation',
        '• Do not share this ticket',
        '• Arrive early for a smooth entry'
      ];
      
      infoText.forEach((text) => {
        pdf.text(text, 18, y);
        y += 5;
      });
      
      y = pageHeight - 12;
      pdf.setFontSize(7);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(156, 163, 175);
      const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      pdf.text(`Generated: ${generatedDate}`, pageWidth / 2, y, { align: 'center' });
      
      pdf.save(`ticket-${eventToDownload.booking_id}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen flex flex-col">
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
              <div
                onClick={() => {
                  setActiveSection('overview');
                  setSidebarOpen(false);
                }}
                className={`p-[20px] px-4 py-2 rounded-[10px] flex items-center gap-3 font-semibold transition-colors cursor-pointer ${
                  activeSection === 'overview'
                    ? 'bg-[#2563eb] text-[#F8FAFC]'
                    : 'text-[#0f172a] hover:text-[#F8FAFC] hover:bg-[#2563eb]'
                }`}
              >
                <LayoutDashboard size={20} />
                Dashboard Overview
              </div>
              <div
                onClick={() => {
                  setActiveSection('tickets');
                  setSidebarOpen(false);
                }}
                className={`p-[20px] px-4 py-2 rounded-[10px] flex items-center gap-3 font-semibold transition-colors cursor-pointer ${
                  activeSection === 'tickets'
                    ? 'bg-[#2563eb] text-[#F8FAFC]'
                    : 'text-[#0f172a] hover:text-[#F8FAFC] hover:bg-[#2563eb]'
                }`}
              >
                <Ticket size={20} />
                My Tickets
              </div>
              <div
                onClick={() => {
                  setActiveSection('events');
                  setSidebarOpen(false);
                }}
                className={`p-[20px] px-4 py-2 rounded-[10px] flex items-center gap-3 font-semibold transition-colors cursor-pointer ${
                  activeSection === 'events'
                    ? 'bg-[#2563eb] text-[#F8FAFC]'
                    : 'text-[#0f172a] hover:text-[#F8FAFC] hover:bg-[#2563eb]'
                }`}
              >
                <Calendar size={20} />
                My Events
              </div>
              <div
                onClick={() => {
                  setActiveSection('settings');
                  setSidebarOpen(false);
                }}
                className={`p-[20px] px-4 py-2 rounded-[10px] flex items-center gap-3 font-semibold transition-colors cursor-pointer ${
                  activeSection === 'settings'
                    ? 'bg-[#2563eb] text-[#F8FAFC]'
                    : 'text-[#0f172a] hover:text-[#F8FAFC] hover:bg-[#2563eb]'
                }`}
              >
                <Settings size={20} />
                Profile Settings
              </div>
            </nav>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 top-[80px]"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 bg-[#ebebec] p-6 md:p-8 overflow-auto w-full">
            {activeSection === 'overview' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl md:text-5xl font-bold text-black mb-3">
                    HI, {user?.name?.toUpperCase() || 'USER'}!
                  </h1>
                  <p className="text-lg mt-[20px] md:text-2xl font-normal text-black">
                    Here's a look at your upcoming activity
                  </p>
                </div>

                <div className="bg-primary bg-[#2563eb] mt-[30px] text-[#f8fafc] p-6 md:p-8 rounded-[8px] flex flex-col lg:flex-row gap-6 mb-8">
                  <div className="flex-1">
                    <p className="text-sm md:text-lg font-normal text-white mb-2">
                      YOUR NEXT EVENT
                    </p>
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-6">
                      {loading ? 'Loading...' : nextEvent?.title || 'No upcoming events'}
                    </h2>

                    {nextEvent ? (
                      <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-white flex-shrink-0" />
                          <span className="text-sm md:text-base font-semibold text-white">
                            {formatEventDate(nextEvent.event_date, nextEvent.start_time)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-white flex-shrink-0" />
                          <span className="text-sm md:text-base font-semibold text-white">
                            {nextEvent.location}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4" />
                    )}

                    {nextEvent && (
                      <div>
                        <div className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-wider font-mono">
                          {padZero(countdown.days)} : {padZero(countdown.hours)} : {padZero(countdown.minutes)} : {padZero(countdown.seconds)}
                        </div>
                        <div className="flex gap-8 md:gap-12 text-[200] md:text-xl font-bold text-white">
                          <span>DAYS</span>
                          <span>HOURS</span>
                          <span>MINS</span>
                          <span>SECS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4 lg:w-[200px] flex-shrink-0 w-full lg:w-auto">
                    <div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] bg-white rounded-lg p-4 flex-shrink-0 flex items-center justify-center">
                      {nextEvent ? (
                        <QRCodeSVG
                          value={`${window.location.origin}/verify-ticket/${nextEvent.booking_id}`}
                          size={140}
                          level="H"
                        />
                      ) : (
                        <p className="text-gray-400 text-center">No QR code available</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEvent(nextEvent)}
                      className="bg-[#f8fafc] text-[#0f172a] hover:bg-[#f8fafc] font-bold p-[10px] rounded-[8px] transition-colors whitespace-nowrap w-full lg:w-auto"
                    >
                      View Ticket & QR
                    </button>
                  </div>
                </div>

                <div className="mt-[40px]">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-6">
                    Upcoming Events
                  </h3>

                  {loading ? (
                    <p className="text-gray-600">Loading your events...</p>
                  ) : bookings.length === 0 ? (
                    <p className="text-gray-600">You haven't booked any events yet.</p>
                  ) : (
                    <div className="space-y-8">
                      {bookings.filter(b => nextEvent && new Date(b.event_date) > new Date(nextEvent.event_date)).map((booking) => (
                        <div
                          key={booking.booking_id}
                          className="bg-[#f8fafc] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 md:gap-6"
                        >
                          <img
                            src={booking.banner_image || 'https://via.placeholder.com/150x100?text=Event'}
                            alt={booking.title}
                            className="w-full md:w-[150px] h-[100px] object-cover rounded-lg flex-shrink-0"
                          />

                          <div className="flex-1 w-full">
                            <h4 className="text-sm md:text-base font-bold text-[#0f172a] mb-2">
                              {booking.title}
                            </h4>

                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#1D1B20] flex-shrink-0" />
                                <span className="text-xs md:text-sm font-semibold text-[#0f172a]">
                                  {formatEventDate(booking.event_date, booking.start_time)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1D1B20] flex-shrink-0" />
                                <span className="text-xs md:text-sm font-semibold text-[#0f172a]">
                                  {booking.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => navigate(`/event/${booking.event_id}`)}
                            className="bg-[#2563eb] text-white text-sm font-bold px-6 py-2 md:px-4 md:py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors flex-shrink-0 whitespace-nowrap w-full md:w-auto">
                            View Event
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'tickets' && (
              <div className="pb-[40px]">
                <h2 className="font-bold text-[32px] md:text-[48px] text-[#0f172a] mb-[20px] md:mb-[40px]">My Tickets</h2>
                
                {loading ? (
                  <p className="text-gray-600">Loading your tickets...</p>
                ) : bookings.length === 0 ? (
                  <div className="bg-[#f8fafc] rounded-[10px] p-[30px] md:p-[45px]">
                    <p className="text-[16px] md:text-[20px] text-[#656565]">You haven't booked any tickets yet.</p>
                  </div>
                ) : (
                  <div className="space-y-[20px] md:space-y-[28px]">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.booking_id}
                        className="bg-[#f8fafc] rounded-[10px] p-[20px] md:p-[30px] shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-[20px] md:gap-[30px]">
                          <div className="w-full md:w-[200px] flex-shrink-0">
                            <img
                              src={booking.banner_image || 'https://via.placeholder.com/200x150?text=Event'}
                              alt={booking.title}
                              className="w-full h-[150px] md:h-[150px] object-cover rounded-[8px]"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-[15px] md:mb-[20px]">
                              <h3 className="font-bold text-[20px] md:text-[28px] text-[#0f172a] flex-1">
                                {booking.title}
                              </h3>
                              <div className="bg-[#2563eb] text-white px-[12px] py-[6px] rounded-[6px] text-[12px] md:text-[14px] font-bold whitespace-nowrap ml-[10px]">
                                {booking.status?.toUpperCase()}
                              </div>
                            </div>

                            <div className="space-y-[8px] md:space-y-[12px] mb-[20px] md:mb-[25px]">
                              <div className="flex items-center gap-[8px]">
                                <Calendar className="w-[18px] h-[18px] text-[#2563eb] flex-shrink-0" />
                                <span className="font-bold text-[14px] md:text-[16px] text-[#0f172a]">
                                  {formatEventDate(booking.event_date, booking.start_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-[8px]">
                                <MapPin className="w-[18px] h-[18px] text-[#2563eb] flex-shrink-0" />
                                <span className="font-bold text-[14px] md:text-[16px] text-[#0f172a]">
                                  {booking.location}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-[15px] md:gap-[20px] mb-[20px] md:mb-[25px]">
                              <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                <p className="text-[12px] font-bold text-[#656565] mb-[5px]">BOOKING ID</p>
                                <p className="text-[14px] md:text-[16px] font-bold text-[#0f172a] break-all">{booking.booking_id}</p>
                              </div>
                              <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                <p className="text-[12px] font-bold text-[#656565] mb-[5px]">QR CODE</p>
                                <p className="text-[14px] md:text-[16px] font-bold text-[#2563eb] truncate">{booking.qr_code}</p>
                              </div>
                            </div>

                            <button 
                              onClick={() => setSelectedEvent(booking)}
                              className="w-full md:w-auto h-[48px] md:h-[56px] bg-[#2563eb] text-[#f8fafc] px-[20px] md:px-[30px] rounded-[8px] font-bold text-[16px] md:text-[18px] hover:bg-[#1d4ed8] transition-colors"
                            >
                              View QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'events' && (
              <div className="pb-[40px]">
                <h2 className="font-bold text-[32px] md:text-[48px] text-[#0f172a] mb-[20px] md:mb-[40px]">My Events</h2>
                
                {loading ? (
                  <p className="text-gray-600">Loading your events...</p>
                ) : bookings.length === 0 ? (
                  <div className="bg-[#f8fafc] rounded-[10px] p-[30px] md:p-[45px]">
                    <p className="text-[16px] md:text-[20px] text-[#656565]">You haven't booked any events yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-[25px] md:mb-[35px] flex flex-wrap gap-[10px]">
                      <button onClick={() => setEventFilter('all')} className={`px-[16px] md:px-[20px] py-[8px] md:py-[10px] rounded-[8px] font-bold text-[14px] md:text-[16px] transition-colors ${eventFilter === 'all' ? 'bg-[#2563eb] text-[#f8fafc]' : 'bg-[#e5e7eb] text-[#0f172a] hover:bg-[#d1d5db]'}`}>
                        All Events
                      </button>
                      <button onClick={() => setEventFilter('upcoming')} className={`px-[16px] md:px-[20px] py-[8px] md:py-[10px] rounded-[8px] font-bold text-[14px] md:text-[16px] transition-colors ${eventFilter === 'upcoming' ? 'bg-[#2563eb] text-[#f8fafc]' : 'bg-[#e5e7eb] text-[#0f172a] hover:bg-[#d1d5db]'}`}>
                        Upcoming
                      </button>
                      <button onClick={() => setEventFilter('past')} className={`px-[16px] md:px-[20px] py-[8px] md:py-[10px] rounded-[8px] font-bold text-[14px] md:text-[16px] transition-colors ${eventFilter === 'past' ? 'bg-[#2563eb] text-[#f8fafc]' : 'bg-[#e5e7eb] text-[#0f172a] hover:bg-[#d1d5db]'}`}>
                        Past Events
                      </button>
                    </div>

                    <div className="space-y-[20px] md:space-y-[28px]">
                      {Array.from(new Map(bookings.map(b => [b.event_id, b])).values())
                        .filter((booking) => {
                          const eventDate = new Date(booking.event_date);
                          const now = new Date();
                          if (eventFilter === 'upcoming') return eventDate > now;
                          if (eventFilter === 'past') return eventDate < now;
                          return true;
                        })
                        .map((booking) => (
                      <div 
                        key={booking.event_id}
                        className="bg-[#f8fafc] rounded-[10px] p-[20px] md:p-[30px] shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-[20px] md:gap-[30px]">
                          <div className="w-full md:w-[200px] flex-shrink-0">
                            <img
                              src={booking.banner_image || 'https://via.placeholder.com/200x150?text=Event'}
                              alt={booking.title}
                              className="w-full h-[150px] md:h-[150px] object-cover rounded-[8px]"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-[15px] md:mb-[20px]">
                              <h3 className="font-bold text-[20px] md:text-[28px] text-[#0f172a] flex-1">
                                {booking.title}
                              </h3>
                              <div className="bg-[#2563eb] text-white px-[12px] py-[6px] rounded-[6px] text-[12px] md:text-[14px] font-bold whitespace-nowrap ml-[10px]">
                                {booking.status?.toUpperCase()}
                              </div>
                            </div>

                            <div className="space-y-[8px] md:space-y-[12px] mb-[20px] md:mb-[25px]">
                              <div className="flex items-center gap-[8px]">
                                <Calendar className="w-[18px] h-[18px] text-[#2563eb] flex-shrink-0" />
                                <span className="font-bold text-[14px] md:text-[16px] text-[#0f172a]">
                                  {formatEventDate(booking.event_date, booking.start_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-[8px]">
                                <MapPin className="w-[18px] h-[18px] text-[#2563eb] flex-shrink-0" />
                                <span className="font-bold text-[14px] md:text-[16px] text-[#0f172a]">
                                  {booking.location}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-[15px] md:gap-[20px] mb-[20px]">
                              <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                <p className="text-[12px] font-bold text-[#656565] mb-[5px]">CATEGORY</p>
                                <p className="text-[14px] md:text-[16px] font-bold text-[#0f172a]">{booking.category || 'Event'}</p>
                              </div>
                              <div className="bg-white rounded-[8px] p-[12px] md:p-[15px] border-2 border-[#e5e7eb]">
                                <p className="text-[12px] font-bold text-[#656565] mb-[5px]">TICKETS BOOKED</p>
                                <p className="text-[14px] md:text-[16px] font-bold text-[#0f172a]">{bookings.filter(b => b.event_id === booking.event_id).length}</p>
                              </div>
                            </div>

                            <button onClick={() => navigate(`/event/${booking.event_id}`)} className="w-full md:w-auto h-[40px] md:h-[48px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-[14px] md:text-[16px] px-[20px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8]">
                              View Event Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="pb-[40px]">
                <h2 className="font-bold text-[32px] md:text-[48px] text-[#0f172a] mb-[20px] md:mb-[40px]">Profile Settings</h2>
                
                {profileMessage.text && (
                  <div className={`mb-[20px] md:mb-[30px] p-[16px] md:p-[20px] rounded-[8px] font-bold text-[16px] md:text-[20px] ${
                    profileMessage.type === 'success'
                      ? 'bg-[#ecfdf5] border-2 border-[#10b981] text-[#10b981]'
                      : 'bg-[#fef2f2] border-2 border-[#ef4444] text-[#ef4444]'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                {!editMode ? (
                  <div className="bg-[#f8fafc] rounded-[10px] p-[30px] md:p-[45px] max-w-[600px]">
                    <div className="space-y-[25px] md:space-y-[35px]">
                      <div>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[8px] md:mb-[12px]">Full Name</p>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#656565]">{user?.name}</p>
                      </div>
                      <div>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[8px] md:mb-[12px]">Email Address</p>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#656565]">{user?.email}</p>
                      </div>
                      <div>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[8px] md:mb-[12px]">Account Role</p>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#656565] capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full h-[56px] md:h-[66px] mt-[35px] md:mt-[45px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8]"
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="bg-[#f8fafc] rounded-[10px] p-[30px] md:p-[45px] max-w-[600px]">
                    <div className="space-y-[20px] md:space-y-[28px]">
                      <div>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Full Name</p>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleFormInputChange}
                          className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                          required
                        />
                      </div>

                      <div>
                        <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Email Address</p>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormInputChange}
                          className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                          required
                        />
                      </div>

                      <div className="border-t-2 border-[#d1d5db] pt-[25px] md:pt-[35px]">
                        <h3 className="font-bold text-[20px] md:text-[28px] text-[#0f172a] mb-[20px] md:mb-[28px]">Change Password (Optional)</h3>
                        
                        <div className="space-y-[20px] md:space-y-[28px]">
                          <div>
                            <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Current Password</p>
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing password"
                              className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">New Password</p>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing password"
                              className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Confirm New Password</p>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleFormInputChange}
                              placeholder="Leave blank if not changing password"
                              className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-[15px] md:gap-[20px] mt-[35px] md:mt-[45px]">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex-1 h-[56px] md:h-[66px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 h-[56px] md:h-[66px] bg-[#e5e7eb] text-[#0f172a] border-2 border-[#d1d5db] rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#d1d5db]"
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

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/[0.6] flex items-center justify-center z-[9999] p-[12px] top-0">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-[380px] p-[16px] md:p-[20px]">
            <div className="flex justify-between items-center mb-[16px]">
              <h2 className="font-bold text-[16px] md:text-[20px] text-[#0f172a]">Your Ticket QR Code</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-[#656565] hover:text-[#0f172a] transition-colors duration-300">
                <X size={20} />
              </button>
            </div>
            <div className="bg-white rounded-[12px] p-[20px] flex items-center justify-center mb-[24px] border-2 border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow" ref={qrRef}>
              <QRCodeSVG value={`${window.location.origin}/verify-ticket/${selectedEvent.booking_id}`} size={220} level="H" />
            </div>
            <div className="space-y-[16px]">
              <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border-2 border-[#e5e7eb] rounded-[12px] p-[20px] hover:border-[#2563eb] transition-colors">
                <p className="font-bold text-[11px] text-[#656565] mb-[12px] uppercase tracking-wide">Event Details</p>
                <div className="space-y-[10px]">
                  <div>
                    <p className="font-bold text-[16px] text-[#0f172a] leading-tight">{selectedEvent.title}</p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <Calendar className="w-[16px] h-[16px] text-[#2563eb] flex-shrink-0" />
                    <p className="font-bold text-[13px] text-[#656565]">{formatEventDate(selectedEvent.event_date, selectedEvent.start_time)}</p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <MapPin className="w-[16px] h-[16px] text-[#2563eb] flex-shrink-0" />
                    <p className="font-bold text-[13px] text-[#656565]">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={downloadTicketPDF} 
                disabled={generatingPDF}
                className="w-full h-[48px] bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-[#f8fafc] border-none rounded-[10px] font-bold text-[15px] cursor-pointer transition-all duration-300 hover:shadow-lg hover:from-[#1d4ed8] hover:to-[#153885] disabled:from-[#9ca3af] disabled:to-[#6b7280] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-[10px] active:scale-95"
              >
                {generatingPDF ? (
                  <>
                    <div className="w-[16px] h-[16px] border-2 border-[#f8fafc] border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download as PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserDashboard;
