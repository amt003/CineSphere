import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";

// Public Customer Portal
import Landing from "./pages/Landing";
import CustomerLogin from "./pages/CustomerLogin";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import MyTickets from "./pages/MyTickets";

// Theatre Admin Portal
import TheatreLogin from "./pages/TheatreLogin";
import TheatreRegister from "./pages/TheatreRegister";
import TheatrePending from "./pages/TheatrePending";
import TheatreAdminDashboard from "./pages/TheatreAdminDashboard";
import TheatreBookings from "./pages/TheatreBookings";
import TheatreShowtimes from "./pages/TheatreShowtimes";
import CreateShowtime from "./pages/CreateShowtime";
import EditShowtime from "./pages/EditShowtime";
import TheatreMovies from "./pages/TheatreMovies";
import AddMovie from "./pages/AddMovie";
import EditMovie from "./pages/EditMovie";
import ManageLayout from "./pages/ManageLayout";
import TheatreAnalytics from "./pages/TheatreAnalytics";

// Super Admin Portal
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminMovies from "./pages/SuperAdminMovies";

function AppRoutes() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      {/* ============================================
          CUSTOMER PORTAL (Public)
          ============================================ */}

      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Login/Register */}
      <Route path="/login" element={<CustomerLogin />} />

      {/* Customer Pages */}
      <Route
        path="/browse"
        element={
          <ProtectedRoute role="customer">
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id/:theatreId"
        element={
          <ProtectedRoute role="customer">
            <MovieDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:showtimeId"
        element={
          <ProtectedRoute role="customer">
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute role="customer">
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute role="customer">
            <MyTickets />
          </ProtectedRoute>
        }
      />

      {/* ============================================
          THEATRE ADMIN PORTAL (Separate)
          ============================================ */}

      {/* Theatre routes redirect to login */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Theatre Login & Registration */}
      <Route path="/admin/login" element={<TheatreLogin />} />
      <Route path="/admin/register" element={<TheatreRegister />} />
      <Route path="/admin/pending" element={<TheatrePending />} />

      {/* Theatre Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="theatreAdmin">
            <TheatreAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Theatre Bookings */}
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute role="theatreAdmin">
            <TheatreBookings />
          </ProtectedRoute>
        }
      />

      {/* Theatre Showtimes */}
      <Route
        path="/admin/showtimes"
        element={
          <ProtectedRoute role="theatreAdmin">
            <TheatreShowtimes />
          </ProtectedRoute>
        }
      />

      {/* Create Showtime */}
      <Route
        path="/admin/showtimes/new"
        element={
          <ProtectedRoute role="theatreAdmin">
            <CreateShowtime />
          </ProtectedRoute>
        }
      />

      {/* Edit Showtime */}
      <Route
        path="/admin/showtimes/edit/:showtimeId"
        element={
          <ProtectedRoute role="theatreAdmin">
            <EditShowtime />
          </ProtectedRoute>
        }
      />

      {/* Theatre Movies */}
      <Route
        path="/admin/movies"
        element={
          <ProtectedRoute role="theatreAdmin">
            <TheatreMovies />
          </ProtectedRoute>
        }
      />

      {/* Add Movie */}
      <Route
        path="/admin/movies/new"
        element={
          <ProtectedRoute role="theatreAdmin">
            <AddMovie />
          </ProtectedRoute>
        }
      />

      {/* Edit Movie */}
      <Route
        path="/admin/movies/edit/:movieId"
        element={
          <ProtectedRoute role="theatreAdmin">
            <EditMovie />
          </ProtectedRoute>
        }
      />

      {/* Manage Hall Layout */}
      <Route
        path="/admin/layout"
        element={
          <ProtectedRoute role="theatreAdmin">
            <ManageLayout />
          </ProtectedRoute>
        }
      />

      {/* Theatre Analytics */}
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute role="theatreAdmin">
            <TheatreAnalytics />
          </ProtectedRoute>
        }
      />

      {/* ============================================
          SUPER ADMIN PORTAL (Hidden)
          ============================================ */}

      {/* Super admin routes redirect to login */}
      <Route
        path="/superadmin"
        element={<Navigate to="/superadmin/login" replace />}
      />

      {/* Super Admin Login Only (no register) */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route
        path="/superadmin/register"
        element={<Navigate to="/superadmin/login" replace />}
      />

      {/* Super Admin Dashboard */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute role="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Movies */}
      <Route
        path="/superadmin/movies"
        element={
          <ProtectedRoute role="superadmin">
            <SuperAdminMovies />
          </ProtectedRoute>
        }
      />

      {/* ============================================
          CATCH-ALL
          ============================================ */}

      {/* Invalid routes redirect based on auth state */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            userRole === "theatreAdmin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === "superadmin" ? (
              <Navigate to="/superadmin/dashboard" replace />
            ) : (
              <Navigate to="/browse" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function ToastWrapper() {
  const { toasts, removeToast } = useToast();
  return <Toast toasts={toasts} onClose={removeToast} />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <ToastWrapper />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
