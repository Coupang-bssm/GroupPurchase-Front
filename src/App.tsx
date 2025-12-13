import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { isAuthenticated } from '@/utils/auth';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import ProductList from '@/pages/ProductList';
import ProductDetail from '@/pages/ProductDetail';
import ProductCreate from '@/pages/ProductCreate';
import GroupPurchaseList from '@/pages/GroupPurchaseList';
import GroupPurchaseDetail from '@/pages/GroupPurchaseDetail';
import GroupPurchaseCreate from '@/pages/GroupPurchaseCreate';
import MyInfo from '@/pages/MyInfo';
import Layout from '@/components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="group-purchases" element={<GroupPurchaseList />} />
            <Route path="group-purchases/:id" element={<GroupPurchaseDetail />} />
            <Route path="group-purchases/create" element={<GroupPurchaseCreate />} />
            <Route path="my-info" element={<MyInfo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

