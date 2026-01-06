import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import PropertyList from "./pages/PropertyList";
import PropertyDetails from "./pages/PropertyDetails";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProperties from "./pages/AdminProperties";
import AdminAddProperty from "./pages/AdminAddProperty";
import AdminAppointments from "./pages/AdminAppointments";
import AdminCategories from "./pages/AdminCategories";
import AdminAddCategory from "./pages/AdminAddCategory";
import AdminLocations from "./pages/AdminLocations";
import AdminAddLocation from "./pages/AdminAddLocation";
import AdminReviews from "./pages/AdminReviews";

// Layouts & Components
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthWatcher from "./components/AuthWatcher";

function App() {
  return (
    <BrowserRouter>
      <AuthWatcher />

      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ---------- USER ROUTES ---------- */}
        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />

        <Route
          path="/properties"
          element={
            <UserLayout>
              <PropertyList />
            </UserLayout>
          }
        />

        <Route
          path="/property/:id"
          element={
            <UserLayout>
              <PropertyDetails />
            </UserLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <UserLayout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </UserLayout>
          }
        />

        <Route
          path="/favorites"
          element={
            <UserLayout>
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            </UserLayout>
          }
        />

        {/* ---------- ADMIN ROUTES ---------- */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout title="Dashboard">
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminLayout title="Users">
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/properties"
          element={
            <AdminLayout
              title="Properties"
            >
              <ProtectedRoute requiredRole="admin">
                <AdminProperties />
              </ProtectedRoute>
            </AdminLayout>
          }
        />


        <Route
          path="/admin/properties/add"
          element={
            <AdminLayout title="Add Property">
              <ProtectedRoute requiredRole="admin">
                <AdminAddProperty />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        {/* Route alias for add-property */}
        <Route
          path="/admin/add-property"
          element={
            <AdminLayout title="Add Property">
              <ProtectedRoute requiredRole="admin">
                <AdminAddProperty />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <AdminLayout title="Appointments">
              <ProtectedRoute requiredRole="admin">
                <AdminAppointments />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminLayout title="Categories">
              <ProtectedRoute requiredRole="admin">
                <AdminCategories />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/categories/add"
          element={
            <AdminLayout title="Add Category">
              <ProtectedRoute requiredRole="admin">
                <AdminAddCategory />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/categories/edit/:id"
          element={
            <AdminLayout title="Edit Category">
              <ProtectedRoute requiredRole="admin">
                <AdminAddCategory />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/locations"
          element={
            <AdminLayout title="Locations">
              <ProtectedRoute requiredRole="admin">
                <AdminLocations />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/locations/add"
          element={
            <AdminLayout title="Add Location">
              <ProtectedRoute requiredRole="admin">
                <AdminAddLocation />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/locations/edit/:id"
          element={
            <AdminLayout title="Edit Location">
              <ProtectedRoute requiredRole="admin">
                <AdminAddLocation />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <AdminLayout title="Reviews">
              <ProtectedRoute requiredRole="admin">
                <AdminReviews />
              </ProtectedRoute>
            </AdminLayout>
          }
        />

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
