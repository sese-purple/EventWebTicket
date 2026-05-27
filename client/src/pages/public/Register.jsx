import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../../components/layout/AuthHeader';
import api from '../../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      alert('Registration Successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <main 
        className="flex-1 bg-cover bg-center flex items-center justify-center py-4 px-4 relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1727096857692-e9dadf2bc92e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600')` }}
      >
        <div className="absolute inset-0 bg-[rgba(15,23,42,0.3)]"></div>

        <div className="bg-slate-50 py-10 px-6 md:px-8 rounded-lg shadow-lg max-w-sm w-full relative z-10">
          
          <h1 className="font-bold text-lg md:text-xl text-slate-900 text-center mb-1">VIBELY</h1>
          <h2 className="font-bold text-lg md:text-xl text-slate-900 text-center mb-2">Create Account</h2>
          <p className="font-normal text-xs md:text-sm text-slate-900 text-center mb-2">Sign up to get started</p>

          {error && <p className="text-red-600 text-center font-bold mb-2 text-xs">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full">
            
            <div className="mb-4">
              <input 
                type="text" 
                className="w-full h-9 px-2 border border-slate-400 rounded-lg font-semibold text-xs text-blue-600 bg-white outline-none transition-colors duration-300 focus:border-blue-600 placeholder-blue-600"
                placeholder="Full name" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <input 
                type="email" 
                className="w-full h-9 px-2 border border-slate-400 rounded-lg font-semibold text-xs text-blue-600 bg-white outline-none transition-colors duration-300 focus:border-blue-600 placeholder-blue-600"
                placeholder="Email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <input 
                type="password" 
                className="w-full h-9 px-2 border border-slate-400 rounded-lg font-semibold text-xs text-blue-600 bg-white outline-none transition-colors duration-300 focus:border-blue-600 placeholder-blue-600"
                placeholder="Password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="mb-5">
              <p className="font-bold text-xs text-slate-900 mb-2 text-center">I want to...</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'user'})}
                  className={`w-full py-1.5 px-2 rounded-lg border-2 font-bold text-xs cursor-pointer transition-all duration-300 ${
                    formData.role === 'user'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-blue-600'
                  }`}
                >
                  Book Tickets
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'organizer'})}
                  className={`w-full py-1.5 px-2 rounded-lg border-2 font-bold text-xs cursor-pointer transition-all duration-300 ${
                    formData.role === 'organizer'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-blue-600'
                  }`}
                >
                  Organize Events
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-blue-600 text-white border-none rounded-lg font-bold text-xs cursor-pointer transition-colors duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>

            <div className="text-center mb-3">
              <span className="font-light text-sm text-slate-900">- OR -</span>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mb-3">
              
              <button type="button" className="flex-1 h-10 rounded-lg border border-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                  <path clipRule="evenodd" d="M14.8981 0.151875C16.7106 -0.0506249 17.7831 -0.0506249 19.7306 0.151875C23.178 0.662113 26.3737 2.25559 28.8556 4.70188C27.1784 6.28721 25.5233 7.8957 23.8906 9.52687C20.764 6.87687 17.274 6.26521 13.4206 7.69188C10.594 8.99188 8.62563 11.0985 7.51563 14.0119C5.70173 12.6615 3.91146 11.2796 2.14563 9.86687C2.02291 9.80228 1.88275 9.77863 1.74563 9.79937C4.55063 4.39104 8.93396 1.17437 14.8956 0.149375" fill="#F44336" fillRule="evenodd" opacity="0.987"/>
                  <path clipRule="evenodd" d="M1.74063 9.79938C1.8823 9.77771 2.01646 9.80021 2.14313 9.86688C3.90896 11.2796 5.69923 12.6615 7.51313 14.0119C7.22769 15.147 7.04776 16.3061 6.97563 17.4744C7.0373 18.6044 7.21646 19.7135 7.51313 20.8019L1.87563 25.2894C-0.57937 20.1594 -0.62437 14.996 1.74063 9.79938Z" fill="#FFC107" fillRule="evenodd" opacity="0.997"/>
                  <path clipRule="evenodd" d="M28.5881 30.7244C26.8328 29.1763 24.9951 27.7242 23.0831 26.3744C24.9998 25.021 26.1631 23.1644 26.5731 20.8044H17.1806V14.2819C22.5973 14.2369 28.0115 14.2827 33.4231 14.4194C34.4498 19.9944 33.264 25.021 29.8656 29.4994C29.4615 29.9289 29.0335 30.3378 28.5881 30.7244Z" fill="#448AFF" fillRule="evenodd" opacity="0.999"/>
                  <path clipRule="evenodd" d="M7.51313 20.8044C9.56313 25.8994 13.3215 28.2777 18.7881 27.9394C20.3227 27.7617 21.794 27.2256 23.0831 26.3744C24.9965 27.7277 26.8315 29.1777 28.5881 30.7244C25.8048 33.2255 22.2559 34.7096 18.5206 34.9344C17.672 35.0022 16.8193 35.0022 15.9706 34.9344C9.6073 34.1844 4.90896 30.9694 1.87563 25.2894L7.51313 20.8044Z" fill="#43A047" fillRule="evenodd" opacity="0.993"/>
                </svg>
                <span className="font-bold text-xs text-slate-900">Google</span>
              </button>

              <button type="button" className="flex-1 h-10 rounded-lg border border-slate-400 bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                  <path d="M40 20C40 8.95438 31.0456 0 20 0C8.95437 0 0 8.95438 0 20C0 29.9825 7.31375 38.2567 16.875 39.757V25.7813H11.7969V20H16.875V15.5938C16.875 10.5813 19.8609 7.8125 24.4294 7.8125C26.6175 7.8125 28.9062 8.20313 28.9062 8.20313V13.125H26.3844C23.8998 13.125 23.125 14.6667 23.125 16.2484V20H28.6719L27.7852 25.7813H23.125V39.757C32.6863 38.2567 40 29.9827 40 20Z" fill="#1877F2"/>
                  <path d="M27.7852 25.7812L28.6719 20H23.125V16.2484C23.125 14.6666 23.8998 13.125 26.3844 13.125H28.9062V8.20312C28.9062 8.20312 26.6175 7.8125 24.4292 7.8125C19.8609 7.8125 16.875 10.5813 16.875 15.5938V20H11.7969V25.7812H16.875V39.757C17.9088 39.919 18.9536 40.0002 20 40C21.0464 40.0002 22.0912 39.919 23.125 39.757V25.7812H27.7852Z" fill="white"/>
                </svg>
                <span className="font-bold text-xs text-white">Facebook</span>
              </button>
            </div>

            <p className="text-center font-bold text-xs text-slate-900">
              Already have an account? <Link to="/login" className="text-blue-600 hover:opacity-80 transition-opacity">Log In</Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="bg-slate-900 py-6 text-center flex-shrink-0">
        <p className="font-normal text-base md:text-lg text-white">© 2025 Vibely. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
