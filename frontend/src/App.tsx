import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import StoreList from './pages/user/StoreList';
import PasswordUpdate from './pages/user/PasswordUpdate';
import OwnerDashboard from './pages/owner/Dashboard';
import './index.css';

// Home redirect component
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'USER') {
    return <Navigate to="/user" replace />;
  } else if (user?.role === 'STORE_OWNER') {
    return <Navigate to="/owner" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route element={<Layout requireAuth allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/stores" element={<AdminStores />} />
          </Route>

          {/* User Routes */}
          <Route element={<Layout requireAuth allowedRoles={['USER']} />}>
            <Route path="/user" element={<StoreList />} />
            <Route path="/user/password" element={<PasswordUpdate />} />
          </Route>

          {/* Store Owner Routes */}
          <Route element={<Layout requireAuth allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/password" element={<PasswordUpdate />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
