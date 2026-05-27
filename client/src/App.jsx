import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import BrowseEvents from './pages/public/BrowseEvents';
import Categories from './pages/public/Categories';
import EventDetails from './pages/public/EventDetails';
import TicketBooking from './pages/public/TicketBooking';
import CheckoutPage from './pages/public/CheckoutPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import TicketVerification from './pages/public/TicketVerification';
import UserDashboard from './pages/user/Dashboard';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router basename="/EventWebTicket">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<BrowseEvents />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/book-ticket/:id" element={<TicketBooking />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/verify-ticket/:bookingId" element={<TicketVerification />} />

          {/* Protected Routes (Logic to be added later) */}
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/create-event" element={<CreateEvent />} />
          <Route path="/organizer/edit-event/:eventId" element={<EditEvent />} />
          <Route path="/organizer/event/:eventId" element={<EventDetails />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;