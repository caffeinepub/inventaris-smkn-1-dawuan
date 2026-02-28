import React, { useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Navigate, Outlet } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { seedData } from './utils/seedData';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ItemList } from './pages/admin/ItemList';
import { ItemForm } from './pages/admin/ItemForm';
import { ItemDetail } from './pages/admin/ItemDetail';
import { UserList } from './pages/admin/UserList';
import { UserForm } from './pages/admin/UserForm';
import { BorrowingList } from './pages/admin/BorrowingList';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';
import { UserDashboard } from './pages/user/Dashboard';
import { Catalog } from './pages/user/Catalog';
import { BorrowForm } from './pages/user/BorrowForm';
import { BorrowingHistory } from './pages/user/BorrowingHistory';
import { Profile } from './pages/user/Profile';
import { Layout } from './components/Layout';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/user/dashboard" />;
}

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// Admin layout route
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'Admin') return <Navigate to="/user/dashboard" />;
  return <Layout><Outlet /></Layout>;
}

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dashboard',
  component: AdminDashboard,
});

const adminItemsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/items',
  component: ItemList,
});

const adminItemsAddRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/items/add',
  component: () => <ItemForm mode="add" />,
});

const adminItemDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/items/$id',
  component: ItemDetail,
});

const adminItemEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/items/$id/edit',
  component: () => <ItemForm mode="edit" />,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users',
  component: UserList,
});

const adminUsersAddRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users/add',
  component: () => <UserForm mode="add" />,
});

const adminUserEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users/$id/edit',
  component: () => <UserForm mode="edit" />,
});

const adminBorrowingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/borrowings',
  component: BorrowingList,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/reports',
  component: Reports,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/settings',
  component: Settings,
});

// User layout route
const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user',
  component: UserLayout,
});

function UserLayout() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'User') return <Navigate to="/admin/dashboard" />;
  return <Layout><Outlet /></Layout>;
}

const userDashboardRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: '/dashboard',
  component: UserDashboard,
});

const userCatalogRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: '/catalog',
  component: Catalog,
});

const userBorrowRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: '/borrow',
  component: BorrowForm,
});

const userHistoryRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: '/history',
  component: BorrowingHistory,
});

const userProfileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: '/profile',
  component: Profile,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminItemsAddRoute,
    adminItemsRoute,
    adminItemDetailRoute,
    adminItemEditRoute,
    adminUsersAddRoute,
    adminUsersRoute,
    adminUserEditRoute,
    adminBorrowingsRoute,
    adminReportsRoute,
    adminSettingsRoute,
  ]),
  userLayoutRoute.addChildren([
    userDashboardRoute,
    userCatalogRoute,
    userBorrowRoute,
    userHistoryRoute,
    userProfileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  useEffect(() => {
    seedData();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
