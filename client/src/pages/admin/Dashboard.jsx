import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { LayoutDashboard, Calendar, Settings, Users, Menu, X } from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, publishedEvents: 0, totalRevenue: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'Vibely',
    supportEmail: 'support@vibely.com',
    commission: '10',
    maxEvents: ''
  });

  const sidebarLinks = [
    { id: 'overview', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Event Approvals', icon: Calendar },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Platform Setting', icon: Settings }
  ];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, pendingRes, usersRes] = await Promise.all([
          api.get('/events/admin-stats'),
          api.get('/events/pending'),
          api.get('/events/users')
        ]);

        setStats(statsRes.data);

        const events = statsRes.data;
        setPendingEvents(pendingRes.data.map(e => ({
          id: e.event_id,
          title: e.title,
          organizer: e.organizer_name,
          date: `${e.event_date} • ${e.start_time}`,
          submitted: e.created_at
        })));

        setUsers(usersRes.data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          joined: u.joined
        })));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setStatsLoading(false);
        setUsersLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApproveEvent = async (eventId) => {
    setLoading(true);
    try {
      const response = await api.post(`/events/${eventId}/approve`);

      if (response.status === 200) {
        const event = pendingEvents.find(e => e.id === eventId);
        setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
        setApprovedEvents([...approvedEvents, event]);
        setMessage({ type: 'success', text: `Event "${event.title}" approved successfully!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to approve event' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error approving event:', error);
      setMessage({ type: 'error', text: 'Error approving event' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEvent = async (eventId) => {
    setLoading(true);
    try {
      const response = await api.post(`/events/${eventId}/reject`);

      if (response.status === 200) {
        const event = pendingEvents.find(e => e.id === eventId);
        setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
        setRejectedEvents([...rejectedEvents, event]);
        setMessage({ type: 'success', text: `Event "${event.title}" rejected successfully!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to reject event' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      setMessage({ type: 'error', text: 'Error rejecting event' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = (user) => {
    setSelectedUser(user);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/users/${userId}`);

      if (response.status === 200) {
        const user = users.find(u => u.id === userId);
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: `User "${user.name}" has been deleted.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete user' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Error deleting user' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setPlatformSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Platform settings saved successfully!' });
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 500);
  };

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
          {message.text && (
            <div className={`fixed top-4 right-4 p-3 md:p-[20px] rounded-[8px] font-bold text-xs md:text-[20px] z-50 ${
              message.type === 'success'
                ? 'bg-[#ecfdf5] border-2 border-[#10b981] text-[#10b981]'
                : 'bg-[#fef2f2] border-2 border-[#ef4444] text-[#ef4444]'
            }`}>
              {message.text}
            </div>
          )}
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
                    className={`p-[20px] px-4 py-2 rounded-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-3 ${
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
              <div className="pb-8 md:pb-[40px]">
                <h1 className="text-2xl md:text-5xl font-bold text-black mb-6 md:mb-[62px]">Admin Portal - System Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[41px] mb-8 md:mb-[62px]">
                  <div className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                    <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">Total Registered User</h3>
                    <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{statsLoading ? '-' : stats.totalUsers}</p>
                    <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{statsLoading ? 'Loading...' : `+${stats.usersThisWeek} this week`}</p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                    <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">Total Events Published</h3>
                    <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{statsLoading ? '-' : stats.publishedEvents}</p>
                    <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{statsLoading ? 'Loading...' : `+${stats.eventsThisMonth} this month`}</p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-[8px] px-4 md:px-[31px] py-5 md:py-[30px] md:h-[221px] shadow-md flex flex-col justify-between">
                    <h3 className="text-sm md:text-[20px] font-bold text-[#000000]">Total platform Revenue</h3>
                    <p className="text-2xl md:text-[48px] font-bold text-[#000000] mt-2 md:mt-0">{statsLoading ? '-' : `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}</p>
                    <p className="text-xs md:text-[16px] font-bold text-[#656565] mt-2 md:mt-0">{statsLoading ? 'Loading...' : `+${stats.revenueGrowthPercentage}% YTD`}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#0f172a]">Pending Event Approvals</h2>
                  </div>

                  <div className="bg-[#f8fafc] rounded-lg overflow-hidden">
                    <div className="bg-[#d9d9d9] p-[20px] md:p-[30px]">
                      <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a]">Events Waiting Review</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="h-16 bg-[#f8fafc]">
                            <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Event Name</th>
                            <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Organizer</th>
                            <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Date</th>
                            <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Status</th>
                            <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingEvents.length === 0 ? (
                            <tr className="h-16">
                              <td colSpan="5" className="px-4 md:px-6 py-0 text-center align-middle">
                                <p className="text-sm md:text-base text-[#656565]">No pending events for review.</p>
                              </td>
                            </tr>
                          ) : (
                          pendingEvents.map((event, index) => (
                            <tr key={event.id} className={`h-16 ${index < pendingEvents.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}>
                              <td className="px-4 md:px-6 py-0 align-middle">
                                <p className="text-sm md:text-base font-semibold text-[#0f172a] max-w-[180px]">{event.title}</p>
                              </td>
                              <td className="px-4 md:px-6 py-0 align-middle">
                                <p className="text-sm md:text-base font-semibold text-[#0f172a]">{event.organizer}</p>
                              </td>
                              <td className="px-4 md:px-6 py-0 align-middle">
                                <p className="text-sm md:text-base font-semibold text-[#0f172a] whitespace-nowrap">{event.date}</p>
                              </td>
                              <td className="px-4 md:px-6 py-0 align-middle">
                                <span className="inline-block px-[12px] py-[6px] rounded-[8px] text-[12px] md:text-[14px] font-bold bg-[#f7d487] text-[#000000]">
                                  Pending review
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-0 align-middle">
                                <div className="flex gap-[10px]">
                                  <button
                                    onClick={() => handleApproveEvent(event.id)}
                                    disabled={loading}
                                    className="px-[15px] py-[8px] bg-[#34c759] text-[#f8fafc] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#2fb350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Processing...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectEvent(event.id)}
                                    disabled={loading}
                                    className="px-[15px] py-[8px] bg-[#ff383c] text-[#f8fafc] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#e6323b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Processing...' : 'Reject'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'approvals' && (
              <div className="pb-[40px]">
                <h1 className="text-3xl md:text-5xl font-bold text-black mb-[62px]">Event Approvals</h1>

                <div className="bg-[#f8fafc] rounded-lg overflow-hidden">
                  <div className="bg-[#d9d9d9] p-[20px] md:p-[30px]">
                    <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a]">Pending Event Approvals</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="h-16 bg-[#f8fafc]">
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Event Name</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Organizer</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Date</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Status</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingEvents.length === 0 ? (
                          <tr className="h-16">
                            <td colSpan="5" className="px-4 md:px-6 py-0 text-center align-middle">
                              <p className="text-sm md:text-base text-[#656565]">No pending events for review.</p>
                            </td>
                          </tr>
                        ) : (
                        pendingEvents.map((event, index) => (
                          <tr key={event.id} className={`h-16 ${index < pendingEvents.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a] max-w-[180px]">{event.title}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a]">{event.organizer}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a] whitespace-nowrap">{event.date}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <span className="inline-block px-[12px] py-[6px] rounded-[8px] text-[12px] md:text-[14px] font-bold bg-[#f7d487] text-[#000000]">
                                Pending review
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <div className="flex gap-[10px]">
                                <button
                                  onClick={() => handleApproveEvent(event.id)}
                                  disabled={loading}
                                  className="px-[15px] py-[8px] bg-[#34c759] text-[#f8fafc] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#2fb350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  {loading ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleRejectEvent(event.id)}
                                  disabled={loading}
                                  className="px-[15px] py-[8px] bg-[#ff383c] text-[#f8fafc] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#e6323b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  {loading ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="pb-[40px]">
                <h1 className="text-3xl md:text-5xl font-bold text-black mb-[62px]">User Management</h1>

                <div className="bg-[#f8fafc] rounded-lg overflow-hidden">
                  <div className="bg-[#d9d9d9] p-[20px] md:p-[30px]">
                    <h3 className="text-[20px] md:text-[24px] font-bold text-[#0f172a]">Registered Users</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="h-16 bg-[#f8fafc]">
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Name</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Email</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Role</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Joined</th>
                          <th className="text-sm md:text-base font-bold text-[#000000] text-left px-4 md:px-6">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersLoading ? (
                          <tr className="h-16">
                            <td colSpan="5" className="px-4 md:px-6 py-0 text-center align-middle">
                              <p className="text-sm md:text-base text-[#656565]">Loading users...</p>
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr className="h-16">
                            <td colSpan="5" className="px-4 md:px-6 py-0 text-center align-middle">
                              <p className="text-sm md:text-base text-[#656565]">No users found.</p>
                            </td>
                          </tr>
                        ) : (
                        users.map((user, index) => (
                          <tr key={user.id} className={`h-16 ${index < users.length - 1 ? 'border-b border-[#e5e7eb]' : ''}`}>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a]">{user.name}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a]">{user.email}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <span className={`inline-block px-[12px] py-[6px] rounded-[8px] text-[12px] md:text-[14px] font-bold capitalize ${
                                user.role === 'organizer'
                                  ? 'bg-[#dcfce7] text-[#166534]'
                                  : 'bg-[#dbeafe] text-[#1e40af]'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <p className="text-sm md:text-base font-semibold text-[#0f172a]">{new Date(user.joined).toLocaleDateString()}</p>
                            </td>
                            <td className="px-4 md:px-6 py-0 align-middle">
                              <div className="flex gap-[10px]">
                                <button
                                  onClick={() => handleUpdateUser(user)}
                                  className="px-[15px] py-[8px] text-[#2563eb] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#f0f7ff] transition-colors border border-[#2563eb]">
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={loading}
                                  className="px-[15px] py-[8px] bg-[#fee2e2] text-[#991b1b] rounded-[6px] font-bold text-[12px] md:text-[14px] hover:bg-[#fecaca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  {loading ? 'Processing...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedUser && (
                  <div className="mt-[40px] bg-white rounded-[12px] shadow-md border border-[#e5e7eb] p-[30px]">
                    <div className="flex justify-between items-center mb-[25px]">
                      <h2 className="text-[24px] font-bold text-[#0f172a]">Update User</h2>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-[#656565] hover:text-[#0f172a] text-[28px] leading-none">
                        ×
                      </button>
                    </div>

                    <div className="space-y-[20px]">
                      <div>
                        <p className="text-[12px] font-bold text-[#656565] mb-[8px]">NAME</p>
                        <input
                          type="text"
                          value={selectedUser.name}
                          onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                          className="w-full px-[12px] py-[10px] border-2 border-[#e5e7eb] rounded-[6px] font-bold text-[14px] text-[#0f172a] focus:border-[#2563eb] outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <p className="text-[12px] font-bold text-[#656565] mb-[8px]">EMAIL</p>
                        <input
                          type="email"
                          value={selectedUser.email}
                          onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                          className="w-full px-[12px] py-[10px] border-2 border-[#e5e7eb] rounded-[6px] font-bold text-[14px] text-[#0f172a] focus:border-[#2563eb] outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <p className="text-[12px] font-bold text-[#656565] mb-[8px]">ROLE</p>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                          className="w-full px-[12px] py-[10px] border-2 border-[#e5e7eb] rounded-[6px] font-bold text-[14px] text-[#0f172a] focus:border-[#2563eb] outline-none transition-colors">
                          <option value="user">User</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="border-t border-[#e5e7eb] pt-[15px] mt-[15px]">
                        <p className="text-[12px] font-bold text-[#656565] mb-[8px]">JOINED DATE</p>
                        <p className="text-[14px] font-bold text-[#0f172a]">{new Date(selectedUser.joined).toLocaleDateString()}</p>
                      </div>

                      <div>
                        <p className="text-[12px] font-bold text-[#656565] mb-[8px]">USER ID</p>
                        <p className="text-[14px] font-bold text-[#0f172a] break-all">{selectedUser.id}</p>
                      </div>
                    </div>

                    <div className="flex gap-[15px] mt-[30px]">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="flex-1 px-[20px] py-[12px] bg-[#e5e7eb] text-[#0f172a] rounded-[8px] font-bold text-[14px] hover:bg-[#d1d5db] transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setMessage({ type: 'success', text: `User "${selectedUser.name}" updated successfully!` });
                          setSelectedUser(null);
                          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                        }}
                        disabled={loading}
                        className="flex-1 px-[20px] py-[12px] bg-[#2563eb] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteUser(selectedUser.id);
                          setSelectedUser(null);
                        }}
                        disabled={loading}
                        className="flex-1 px-[20px] py-[12px] bg-[#ef4444] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="pb-[40px]">
                <h1 className="text-3xl md:text-5xl font-bold text-black mb-[62px]">Platform Setting</h1>

                <div className="bg-[#f8fafc] rounded-lg p-[30px] md:p-[45px] max-w-[800px]">
                  <div className="space-y-[25px] md:space-y-[35px]">
                    <div>
                      <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Platform Name</p>
                      <input
                        type="text"
                        name="platformName"
                        value={platformSettings.platformName}
                        onChange={handleSettingsChange}
                        className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Support Email</p>
                      <input
                        type="email"
                        name="supportEmail"
                        value={platformSettings.supportEmail}
                        onChange={handleSettingsChange}
                        className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Platform Commission (%)</p>
                      <input
                        type="number"
                        name="commission"
                        value={platformSettings.commission}
                        onChange={handleSettingsChange}
                        className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                      />
                    </div>

                    <div>
                      <p className="font-bold text-[16px] md:text-[20px] text-[#0f172a] mb-[12px]">Maximum Events Per Organizer</p>
                      <input
                        type="number"
                        name="maxEvents"
                        value={platformSettings.maxEvents}
                        onChange={handleSettingsChange}
                        placeholder="Unlimited"
                        className="w-full h-[56px] md:h-[66px] px-[15px] md:px-[20px] py-[10px] border-2 border-[#656565] rounded-[8px] font-bold text-[16px] md:text-[20px] text-[#2563eb] bg-white outline-none transition-colors duration-300 focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="w-full h-[56px] md:h-[66px] mt-[35px] md:mt-[45px] bg-[#2563eb] text-[#f8fafc] border-none rounded-[8px] font-bold text-[18px] md:text-[22px] cursor-pointer transition-colors duration-300 hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
