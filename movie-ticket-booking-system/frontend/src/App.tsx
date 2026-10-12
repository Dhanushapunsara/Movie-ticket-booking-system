import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBookings from './pages/admin/ManageBookings';
import ManageMovies from './pages/admin/ManageMovies';
import ManagePayments from './pages/admin/ManagePayments';
import ManageShows from './pages/admin/ManageShows';
import ManageTheatres from './pages/admin/ManageTheatres';
import ManageUsers from './pages/admin/ManageUsers';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import MoviesPage from './pages/MoviesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import NotFoundPage from './pages/NotFoundPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ShowsPage from './pages/ShowsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TheatresPage from './pages/TheatresPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/:id" element={<MovieDetailsPage />} />
        <Route path="theatres" element={<TheatresPage />} />
        <Route path="shows" element={<ShowsPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />

        {/* Any signed-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="bookings/:id/pay" element={<PaymentPage />} />
        </Route>

        {/* Customers only */}
        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="shows/:id/book" element={<SeatSelectionPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>

        {/* Admins only */}
        <Route path="admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<ManageMovies />} />
          <Route path="theatres" element={<ManageTheatres />} />
          <Route path="shows" element={<ManageShows />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
