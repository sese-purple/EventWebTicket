import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    location: '',
    category: '',
    banner_image: '',
    tickets: [
      { ticket_type: 'General Admission', price: '', quantity: '' }
    ]
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = value;
    setFormData(prev => ({
      ...prev,
      tickets: newTickets
    }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { ticket_type: '', price: '', quantity: '' }]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.tickets.length > 1) {
      setFormData(prev => ({
        ...prev,
        tickets: prev.tickets.filter((_, i) => i !== index)
      }));
    }
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImageFile(file);
        setBannerImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          banner_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setFormData(prev => ({
      ...prev,
      banner_image: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.title || !formData.event_date || !formData.start_time || !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.tickets || formData.tickets.length === 0) {
        throw new Error('At least one ticket type is required');
      }

      for (const ticket of formData.tickets) {
        if (!ticket.ticket_type || !ticket.price || !ticket.quantity) {
          throw new Error('All ticket fields must be filled');
        }
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.start_time,
        location: formData.location,
        category: formData.category,
        banner_image: formData.banner_image,
        tickets: formData.tickets.map(t => ({
          ticket_type: t.ticket_type,
          price: parseFloat(t.price),
          available_quantity: parseInt(t.quantity)
        }))
      };

      await api.post('/events', eventData);
      
      setMessage({ type: 'success', text: 'Event created successfully!' });
      
      setTimeout(() => {
        navigate('/dashboard/organizer');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to create event'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow">
        <section className="h-auto p-4 md:p-[30px] md:py-0 md:h-[167px] bg-gradient-to-r from-[#2563eb] via-[#1d4eb8] to-[#153885] flex items-center">
          <div className="max-w-[1440px] mx-auto w-full px-2 md:px-12">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/dashboard/organizer')}
                className="flex items-center justify-center w-8 md:w-[45px] h-8 md:h-[45px] rounded-lg bg-[#f8fafc] hover:bg-[#e5e7eb] transition-colors flex-shrink-0"
              >
                <ArrowLeft size={20} className="md:hidden" />
                <ArrowLeft size={24} className="hidden md:block text-[#0f172a]" />
              </button>
              <h2 className="text-lg md:text-[40px] font-bold text-white">Create Event</h2>
            </div>
          </div>
        </section>

        <main className="max-w-[1440px] mx-auto w-full px-4 md:px-12 py-6 md:py-[60px]">
          {message.text && (
            <div className={`mb-4 md:mb-[30px] p-3 md:p-[20px] rounded-[8px] font-bold text-xs md:text-[20px] ${
              message.type === 'success'
                ? 'bg-[#ecfdf5] border-2 border-[#10b981] text-[#10b981]'
                : 'bg-[#fef2f2] border-2 border-[#ef4444] text-[#ef4444]'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-[#f8fafc] rounded-[10px] p-4 md:p-[45px] shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
              
              {/* LEFT COLUMN - Event Details */}
              <div className="space-y-4 flex-1 md:space-y-[28px]">
                {/* Event Title */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Event Title</p>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-50"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Description</p>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    className="w-full h-20 md:h-[120px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-50 resize-none"
                    required
                  />
                </div>

                {/* Event Date */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Event Date</p>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Start Time</p>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Location</p>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter event location"
                    className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-50"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <p className="font-bold text-xs md:text-[20px] text-[#0f172a] mb-2 md:mb-[12px]">Category</p>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-9 md:h-[66px] px-3 md:px-[20px] py-2 md:py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-xs md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Music & Concerts">Music & Concerts</option>
                    <option value="Tech & Conferences">Tech & Conferences</option>
                    <option value="Workshops & Education">Workshops & Education</option>
                    <option value="Community & Spirituality">Community & Spirituality</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Family & Kids">Family & Kids</option>
                    <option value="Art & Culture">Art & Culture</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                </div>

                {/* Banner Image */}
                <div>
                  <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Banner Image</p>
                  
                  {bannerImagePreview && (
                    <div className="mb-[15px] relative">
                      <img 
                        src={bannerImagePreview} 
                        alt="Banner preview" 
                        className="w-full h-[200px] object-cover rounded-[8px] border-2 border-[#2563eb]"
                      />
                      <button
                        type="button"
                        onClick={clearBannerImage}
                        className="absolute top-[10px] right-[10px] bg-[#ef4444] text-[#f8fafc] px-[12px] py-[6px] rounded-[6px] font-bold text-[12px] hover:bg-[#dc2626] transition-colors"
                      >
                        Clear Image
                      </button>
                    </div>
                  )}

                  <div className="space-y-[12px]">
                    <div>
                      <p className="text-[14px] text-[#656565] font-semibold mb-[8px]">Upload Image</p>
                      <label className="w-full h-[120px] border-2 border-dashed border-[#656565] rounded-[8px] flex items-center justify-center cursor-pointer hover:border-[#2563eb] hover:bg-[#f0f7ff] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="hidden"
                        />
                        <div className="text-center">
                          <p className="font-bold text-[14px] text-[#2563eb]">Click to upload or drag image</p>
                          <p className="text-[12px] text-[#656565] mt-[4px]">PNG, JPG or GIF (Max 5MB)</p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <p className="text-[14px] text-[#656565] font-semibold mb-[8px]">Or use Image URL</p>
                      <input
                        type="url"
                        name="banner_image"
                        value={bannerImagePreview ? '' : formData.banner_image}
                        onChange={(e) => {
                          if (!bannerImageFile) {
                            handleInputChange(e);
                          }
                        }}
                        placeholder="Enter banner image URL"
                        className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#2563eb] placeholder-opacity-50"
                        disabled={bannerImageFile ? true : false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Tickets Section */}
           <div className="space-y-[20px] flex-1 md:space-y-[28px]">
              <h3 className="font-bold text-[20px] md:text-[28px] text-[#0f172a] mb-[20px] md:mb-[28px]">Ticket Types</h3>
              
              {formData.tickets.map((ticket, index) => (
                <div key={index} className="mb-[20px] p-[20px] md:p-[25px] bg-white rounded-[8px] border-2 border-[#e5e7eb] shadow-sm">
                  <div className="space-y-[15px]">
                    <div>
                      <p className="font-bold text-[14px] md:text-[16px] text-[#0f172a] mb-[10px]">Ticket Type</p>
                      <input
                        type="text"
                        value={ticket.ticket_type}
                        onChange={(e) => handleTicketChange(index, 'ticket_type', e.target.value)}
                        placeholder="e.g., VIP, Standard"
                        className="w-full h-[48px] md:h-[56px] px-[12px] md:px-[16px] py-[8px] border-2 border-[#d1d5db] rounded-[6px] font-semibold text-[14px] md:text-[16px] text-[#0f172a] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#9ca3af]"
                        required
                      />
                    </div>

                    <div>
                      <p className="font-bold text-[14px] md:text-[16px] text-[#0f172a] mb-[10px]">Price ($)</p>
                      <input
                        type="number"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full h-[48px] md:h-[56px] px-[12px] md:px-[16px] py-[8px] border-2 border-[#d1d5db] rounded-[6px] font-semibold text-[14px] md:text-[16px] text-[#0f172a] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#9ca3af]"
                        required
                      />
                    </div>

                    <div>
                      <p className="font-bold text-[14px] md:text-[16px] text-[#0f172a] mb-[10px]">Quantity</p>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                        placeholder="0"
                        className="w-full h-[48px] md:h-[56px] px-[12px] md:px-[16px] py-[8px] border-2 border-[#d1d5db] rounded-[6px] font-semibold text-[14px] md:text-[16px] text-[#0f172a] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb] placeholder-[#9ca3af]"
                        required
                      />
                    </div>

                    {formData.tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="w-full h-[48px] md:h-[56px] bg-[#ef4444] text-[#f8fafc] border-none rounded-[6px] font-bold text-[14px] md:text-[16px] cursor-pointer transition-colors duration-300 hover:bg-[#dc2626]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTicketType}
                className="w-full h-[48px] md:h-[56px] bg-[#2563eb] text-[#f8fafc] border-2 border-[#2563eb] rounded-[6px] font-bold text-[16px] md:text-[18px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8] hover:border-[#1d4ed8]"
              >
                + Add Ticket Type
              </button>

            
              </div>

            {/* Submit Buttons */}
            <div className="flex flex-col md:flex-row gap-[15px] md:gap-[20px] mt-[30px] md:mt-[45px]">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-[56px] md:h-[66px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8]">
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/organizer')}
                className="flex-1 h-[56px] md:h-[66px] bg-[#e5e7eb] text-[#0f172a] border-2 border-[#d1d5db] rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#d1d5db]"
              >
                Cancel
              </button>
            </div>
            </div>

            
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CreateEvent;

