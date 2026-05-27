import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../../api/axios';

const TicketVerification = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/verify-ticket/${bookingId}`);
        setTicket(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchTicket();
    }
  }, [bookingId]);

  const formatEventDate = (dateStr, timeStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return `${dateFormatted} at ${timeStr?.slice(0, 5) || '00:00'}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <XCircle className="w-6 h-6 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="font-sans bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[20px] text-[#656565]">Loading ticket information...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="font-sans bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-24 h-24 text-[#ef4444] mx-auto mb-4" />
            <p className="text-2xl font-bold text-[#ef4444] mb-4">Ticket Not Found</p>
            <p className="text-[#656565] mb-6">{error || 'Unable to verify this ticket'}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#2563eb] hover:bg-[#1d4eb8] text-white font-bold py-2 px-6 rounded-[6px] transition"
            >
              Back to Home
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

      <main className="flex-grow max-w-[1440px] mt-[-50px] mx-auto w-full px-6 md:px-12 py-[40px]">
        <div className="bg-[#f8fafc] rounded-[8px] shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] p-[30px] md:p-[40px] text-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-[40px] font-bold">Ticket Verified</h1>
              {getStatusIcon(ticket.status)}
            </div>
            <p className="text-[16px] md:text-[18px] font-semibold">
              Status: <span className={ticket.status?.toLowerCase() === 'confirmed' ? 'text-[#34c759]' : 'text-[#f7d487]'}>{ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Confirmed'}</span>
            </p>
          </div>

          <div className="p-[30px] md:p-[40px]">
            {/* Event Banner */}
            {ticket.banner_image && (
              <div className="mb-[30px] rounded-[8px] overflow-hidden shadow-md">
                <img 
                  src={ticket.banner_image} 
                  alt={ticket.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Event Title */}
            <h2 className="text-[28px] md:text-[36px] font-bold text-[#0f172a] mb-[30px]">{ticket.title}</h2>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[30px]">
              <div className="bg-white p-[20px] md:p-[30px] rounded-[8px] border-2 border-[#e5e7eb]">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="font-semibold text-[#0f172a]">Date & Time</h3>
                </div>
                <p className="text-[#656565]">{formatEventDate(ticket.event_date, ticket.start_time)}</p>
              </div>

              <div className="bg-white p-[20px] md:p-[30px] rounded-[8px] border-2 border-[#e5e7eb]">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="font-semibold text-[#0f172a]">Location</h3>
                </div>
                <p className="text-[#656565]">{ticket.location}</p>
              </div>

              <div className="bg-white p-[20px] md:p-[30px] rounded-[8px] border-2 border-[#e5e7eb]">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-[#2563eb]" />
                  <h3 className="font-semibold text-[#0f172a]">Ticket Type</h3>
                </div>
                <p className="text-[#656565]">{ticket.ticket_name}</p>
              </div>

              <div className="bg-white p-[20px] md:p-[30px] rounded-[8px] border-2 border-[#e5e7eb]">
                <h3 className="font-semibold text-[#0f172a] mb-2">Quantity</h3>
                <p className="text-[24px] font-bold text-[#2563eb]">{ticket.quantity} {ticket.quantity === 1 ? 'Ticket' : 'Tickets'}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-[#f0f4ff] border-2 border-[#2563eb] rounded-[8px] p-[20px] md:p-[30px] mb-[30px]">
              <h3 className="text-[20px] font-bold text-[#0f172a] mb-[20px]">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div>
                  <p className="text-[12px] md:text-[14px] text-[#656565]">Booking ID</p>
                  <p className="text-[16px] font-semibold text-[#0f172a]">{ticket.booking_id}</p>
                </div>
                <div>
                  <p className="text-[12px] md:text-[14px] text-[#656565]">QR Code</p>
                  <p className="text-[16px] font-semibold text-[#0f172a] break-all">{ticket.qr_code}</p>
                </div>
                <div>
                  <p className="text-[12px] md:text-[14px] text-[#656565]">Booking Date</p>
                  <p className="text-[16px] font-semibold text-[#0f172a]">
                    {new Date(ticket.booking_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] md:text-[14px] text-[#656565]">Total Amount</p>
                  <p className="text-[16px] font-bold text-[#34c759]">${parseFloat(ticket.total_price).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-[#f8fafc] rounded-[8px] p-[20px] md:p-[30px] mb-[30px] border-2 border-[#e5e7eb]">
              <h3 className="font-semibold text-[#0f172a] mb-2">Organized by</h3>
              <p className="text-[#656565]">{ticket.organizer_name}</p>
            </div>

            {/* Important Notes */}
            <div className="bg-[#fff9e6] border-l-4 border-[#f7d487] p-[20px] md:p-[30px] mb-[30px] rounded-[4px]">
              <h3 className="font-bold text-[#0f172a] mb-3">Important Information</h3>
              <ul className="text-[#656565] space-y-2">
                <li>✓ Keep this ticket safe and do not share with others</li>
                <li>✓ Present your ticket at the event entrance</li>
                <li>✓ Arrive 15 minutes before the event starts</li>
                <li>✓ Your booking ID is your proof of purchase</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[15px] flex-wrap">
              <button 
                onClick={() => navigate('/')}
                className="flex-1 min-w-[200px] bg-[#2563eb] hover:bg-[#1d4eb8] text-white font-bold py-[12px] md:py-[15px] px-[20px] rounded-[6px] transition text-[14px] md:text-[16px]"
              >
                Back to Home
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 min-w-[200px] bg-[#34c759] hover:bg-[#2fb350] text-white font-bold py-[12px] md:py-[15px] px-[20px] rounded-[6px] flex items-center justify-center gap-2 transition text-[14px] md:text-[16px]"
              >
                <Download size={20} />
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TicketVerification;
