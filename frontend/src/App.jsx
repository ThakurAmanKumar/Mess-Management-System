import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Loader from "./components/ui/Loader";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import TodayMenu from "./pages/TodayMenu";
import WeeklyMenu from "./pages/WeeklyMenu";
import RateMeal from "./pages/RateMeal";
import MyRatings from "./pages/MyRatings";
import Profile from "./pages/Profile";
import Complaints from "./pages/Complaints";
import Attendance from "./pages/Attendance";
import Notifications from "./pages/Notifications";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageMenu from "./pages/admin/ManageMenu";
import ManageStudents from "./pages/admin/ManageStudents";
import ViewRatings from "./pages/admin/ViewRatings";
import ViewComplaints from "./pages/admin/ViewComplaints";
import MealAttendance from "./pages/admin/MealAttendance";
import SendNotifications from "./pages/admin/SendNotifications";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/pending-approval"
        element={<PendingApproval />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/today-menu"
        element={
          <ProtectedRoute>
            <TodayMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/weekly-menu"
        element={
          <ProtectedRoute>
            <WeeklyMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rate-meal/:menuId/:mealType"
        element={
          <ProtectedRoute>
            <RateMeal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-ratings"
        element={
          <ProtectedRoute>
            <MyRatings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-menu"
        element={
          <AdminRoute>
            <ManageMenu />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <ManageStudents />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ratings"
        element={
          <AdminRoute>
            <ViewRatings />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <AdminRoute>
            <ViewComplaints />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <AdminRoute>
            <MealAttendance />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <AdminRoute>
            <SendNotifications />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;
