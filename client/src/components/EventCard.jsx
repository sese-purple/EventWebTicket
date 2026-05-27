import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Heart, Share2, Users, Zap, Clock } from 'lucide-react';

const EventCard = ({ event, onFavoriteToggle = null, isFavorited = false }) => {
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isEventSoon = () => {
    const eventDate = new Date(event.eventDate || event.event_date);
    const today = new Date();
    const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil < 7 && daysUntil >= 0;
  };

  const isEventHappening = () => {
    const eventDate = new Date(event.eventDate || event.event_date);
    const today = new Date();
    return Math.floor((eventDate - today) / (1000 * 60 * 60 * 24)) === 0;
  };

  const isSoldOut = () => {
    return event.tickets_available !== undefined ? event.tickets_available === 0 : false;
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/event/${event.id || event.event_id}`;
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

  const getRemainingDays = () => {
    const eventDate = new Date(event.eventDate || event.event_date);
    const today = new Date();
    const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'Ended';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `${daysUntil}d away`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-[#e2e8f0]">
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 group">
        <img 
          src={event.image || event.banner_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400"} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
        />

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {event.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-[#f8fafc] bg-[#2563eb]">
              {event.category.split(' ')[0]}
            </span>
          )}
        </div>

        {isEventHappening() && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse z-10">
            <Zap size={14} />
            Now
          </div>
        )}

        {isSoldOut() && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <span className="text-white font-bold text-lg">Sold Out</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="bg-white text-[#0f172a] font-bold text-lg px-3 py-1 rounded-lg shadow-md">
            ${event.price || event.min_price || '0'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onFavoriteToggle && onFavoriteToggle(event.id || event.event_id)}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorited 
                  ? 'bg-[#dc2626] text-white' 
                  : 'bg-white/80 text-[#0f172a] hover:bg-white'
              }`}
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#0f172a] transition-all backdrop-blur-md"
              >
                <Share2 size={18} />
              </button>
              {showShareMenu && (
                <div className="absolute right-0 mt-2 bg-white border border-[#e2e8f0] rounded-lg shadow-lg p-2 w-40 z-20">
                  <button onClick={() => handleShare('twitter')} className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] rounded text-sm font-semibold text-[#0f172a]">
                    Share on Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] rounded text-sm font-semibold text-[#0f172a]">
                    Share on Facebook
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] rounded text-sm font-semibold text-[#0f172a]">
                    Share on WhatsApp
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full text-left px-3 py-2 hover:bg-[#f8fafc] rounded text-sm font-semibold text-[#0f172a]">
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-[#0f172a] mb-3 line-clamp-2 hover:text-[#2563eb] transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center gap-2 text-[#475569] font-semibold text-sm">
            <Calendar size={16} className="text-[#2563eb] flex-shrink-0" />
            <span className="line-clamp-1">{event.date || new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2 text-[#475569] font-semibold text-sm">
            <Clock size={16} className="text-[#f59e0b] flex-shrink-0" />
            <span className="line-clamp-1">{getRemainingDays()}</span>
          </div>

          <div className="flex items-center gap-2 text-[#475569] font-semibold text-sm">
            <MapPin size={16} className="text-[#ef4444] flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {event.attendees_count !== undefined && (
            <div className="flex items-center gap-2 text-[#475569] font-semibold text-sm">
              <Users size={16} className="text-[#10b981] flex-shrink-0" />
              <span>{event.attendees_count} attending</span>
            </div>
          )}
        </div>

        {event.tickets_available !== undefined && (
          <div className="mb-3 text-xs font-semibold text-[#64748b]">
            {event.tickets_available > 0 
              ? `${event.tickets_available} tickets left`
              : 'No tickets available'
            }
          </div>
        )}

        <button 
          onClick={() => navigate(`/event/${event.id || event.event_id}`)}
          disabled={isSoldOut()}
          className={`w-full py-2.5 px-3 rounded-lg font-bold text-base transition-all ${
            isSoldOut()
              ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              : 'bg-[#2563eb] text-[#f8fafc] hover:bg-[#1d4ed8]'
          }`}
        >
          {isSoldOut() ? 'Sold Out' : 'View Event'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
