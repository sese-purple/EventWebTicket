import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Music, Zap, BookOpen, Heart, Dumbbell, Users, Palette, UtensilsCrossed, ChevronRight } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'music-concerts',
      name: 'Music & Concerts',
      description: 'Experience live performances from local and international artists. From intimate acoustic sessions to large-scale festivals, discover the soundtrack to your life.',
      image: 'https://images.unsplash.com/photo-1648260029310-5f1da359af9d?auto=format&fit=crop&w=800',
      icon: Music,
      color: 'from-orange-400 to-pink-500',
      eventTypes: ['Concerts', 'Music Festivals', 'Jazz Nights', 'Comedy Shows', 'Karaoke Events', 'DJ Nights'],
      gradient: 'from-[#ff6e14] to-[#f9a977]'
    },
    {
      id: 'tech-conferences',
      name: 'Tech & Conferences',
      description: 'Stay ahead of the curve with cutting-edge technology talks, networking opportunities, and industry insights. Connect with innovators and leaders in the tech space.',
      image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?auto=format&fit=crop&w=800',
      icon: Zap,
      color: 'from-blue-400 to-indigo-500',
      eventTypes: ['Tech Conferences', 'Startup Pitch Events', 'Webinars', 'Product Launches', 'Hackathons', 'AI & Innovation Talks'],
      gradient: 'from-[#2836ff] to-[#2f97ff]'
    },
    {
      id: 'workshops-education',
      name: 'Workshops & Education',
      description: 'Unlock your potential through interactive workshops and educational seminars. Learn new skills from industry experts and expand your knowledge in various fields.',
      image: 'https://images.unsplash.com/photo-1762158007836-25d13ab34c1c?auto=format&fit=crop&w=800',
      icon: BookOpen,
      color: 'from-emerald-400 to-teal-500',
      eventTypes: ['Professional Workshops', 'Skills Training', 'Seminars', 'Masterclasses', 'Language Classes', 'Certification Programs'],
      gradient: 'from-[#10b981] to-[#14b8a6]'
    },
    {
      id: 'community-spirituality',
      name: 'Community & Spirituality',
      description: 'Build meaningful connections and nourish your soul. From community gatherings to spiritual retreats, find events that bring people together for growth and wellness.',
      image: 'https://images.unsplash.com/photo-1695938542997-a2c3f39d0dbf?auto=format&fit=crop&w=800',
      icon: Heart,
      color: 'from-violet-400 to-purple-500',
      eventTypes: ['Spiritual Retreats', 'Community Meetups', 'Charity Events', 'Wellness Workshops', 'Faith Services', 'Support Groups'],
      gradient: 'from-[#a855f7] to-[#d946ef]'
    },
    {
      id: 'sports-fitness',
      name: 'Sports & Fitness',
      description: 'Stay active and motivated with exciting sports events and fitness classes. From marathons to yoga sessions, find the perfect workout for your lifestyle.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800',
      icon: Dumbbell,
      color: 'from-red-400 to-pink-500',
      eventTypes: ['Fitness Classes', 'Sports Competitions', 'Marathons', 'Yoga Sessions', 'Gym Challenges', 'Athletic Tournaments'],
      gradient: 'from-[#ef4444] to-[#f43f5e]'
    },
    {
      id: 'family-kids',
      name: 'Family & Kids',
      description: 'Create lasting memories with family-friendly events. From interactive workshops to entertainment shows, there\'s something fun for everyone of all ages.',
      image: 'https://assets.aecf.org/m/blogimg/_1200x630_crop_center-center_82_none/Blog_thrivingfamilies_2023.png?mtime=1758652845',
      icon: Users,
      color: 'from-cyan-400 to-blue-500',
      eventTypes: ['Kids Workshops', 'Family Movies', 'Theme Park Events', 'Children\'s Shows', 'Game Nights', 'Educational Games'],
      gradient: 'from-[#06b6d4] to-[#3b82f6]'
    },
    {
      id: 'art-culture',
      name: 'Art & Culture',
      description: 'Discover the creative spirit through art exhibitions, cultural shows, and performances. Celebrate diversity and artistic expression in all its forms.',
      image: 'https://lorrainemusicacademy.com/wp-content/uploads/2011/12/music-art.jpg',
      icon: Palette,
      color: 'from-pink-400 to-rose-500',
      eventTypes: ['Art Exhibitions', 'Theater Shows', 'Dance Performances', 'Film Festivals', 'Gallery Openings', 'Cultural Celebrations'],
      gradient: 'from-[#ec4899] to-[#f43f5e]'
    },
    {
      id: 'food-beverage',
      name: 'Food & Beverage',
      description: 'Indulge your taste buds with culinary experiences from around the world. Join food festivals, cooking classes, and tastings with fellow food enthusiasts.',
      image: 'https://www.elearning.rtb.gov.rw/pluginfile.php/2033/course/section/1019/beverage.gif',
      icon: UtensilsCrossed,
      color: 'from-amber-400 to-orange-500',
      eventTypes: ['Food Festivals', 'Cooking Classes', 'Wine Tastings', 'Restaurant Pop-ups', 'Chef Masterclasses', 'Culinary Tours'],
      gradient: 'from-[#fbbf24] to-[#f97316]'
    }
  ];

  return (
    <div className="font-sans bg-white min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-[linear-gradient(180deg,#2563eb_0.962%,#1d4eb8_51.923%,#153885_85.577%)] pt-[30px] pb-[50px]">
        <div className="max-w-[800px] mx-auto  ">
          <div className="text-center">
            <h1 className="font-bold text-[36px] md:text-[64px] text-white mb-[20px] leading-tight">
              Explore Event Categories
            </h1>
            <p className="font-bold text-[16px] md:text-[20px] text-[#f8fafc] max-w-[700px] mx-auto">
              Discover the perfect event for you. Browse through our diverse collection of categories and find events that match your interests.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <main className="flex-grow bg-[#f8fafc] py-[60px] md:py-[100px]">
        <div className="max-w-[1440px] mx-auto px-[20px] md:px-[95px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[60px]">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-[16px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  {/* Image Section */}
                  <div className="relative h-[280px] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-40`}></div>
                    
                    {/* Icon */}
                    <div className="absolute top-[20px] right-[20px] w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-lg">
                      <IconComponent size={32} className="text-[#2563eb]" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-[30px] md:p-[40px]">
                    <h2 className="font-bold text-[24px] md:text-[28px] text-[#0f172a] mb-[12px]">
                      {category.name}
                    </h2>

                    <p className="font-normal text-[14px] md:text-[16px] text-[#656565] mb-[30px] leading-[1.6]">
                      {category.description}
                    </p>

                    {/* Event Types */}
                    <div className="mb-[30px]">
                      <h3 className="font-bold text-[14px] text-[#0f172a] mb-[12px] uppercase tracking-wide">
                        Types of Events
                      </h3>
                      <div className="flex flex-wrap gap-[8px]">
                        {category.eventTypes.map((type, index) => (
                          <span
                            key={index}
                            className={`px-[12px] py-[6px] rounded-[20px] text-[12px] font-bold text-white bg-gradient-to-r ${category.gradient}`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Browse Button */}
                    <button
                      onClick={() => navigate(`/events?search=${encodeURIComponent(category.name)}`)}
                      className={`w-full h-[50px] rounded-[10px] font-bold text-[16px] md:text-[18px] text-white bg-gradient-to-r ${category.gradient} hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-[8px] group`}
                    >
                      Browse Events
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info Section */}
          <div className="mt-[80px] bg-[linear-gradient(90deg,#2563eb_34.135%,#1d4eb8_68.269%,#153885_83.173%)] rounded-[16px] p-[40px] md:p-[60px] text-center">
            <h2 className="font-bold text-[28px] md:text-[40px] text-white mb-[20px]">
              Can't Find What You're Looking For?
            </h2>
            <p className="font-normal text-[16px] md:text-[18px] text-[#f8fafc] mb-[30px] max-w-[600px] mx-auto">
              Use our search feature to discover events by keywords, location, date, or price range.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-[40px] py-[15px] bg-white text-[#2563eb] rounded-[10px] font-bold text-[16px] md:text-[18px] hover:bg-[#f8fafc] transition-colors duration-300"
            >
              Browse All Events
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
