import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { UserProvider } from "./context/UserContext";
import RouteGuard from "./components/RouteGuard";

// Pages
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetails from "./pages/ProductDetails";
import FaceShape from "./pages/FaceShape";
import VisionTest from "./pages/VisionTest";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Account from "./pages/Account";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DoctorAppointment from "./pages/DoctorAppointment";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";

// Create a QueryClient instance inside the App component
const App = () => {
  // Initialize the query client inside the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    {/* Public routes */}
                    <Route index element={<Index />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="face-shape" element={<FaceShape />} />
                    <Route path="vision-test" element={<VisionTest />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="account" element={<Account />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    
                    {/* Protected routes for any authenticated user */}
                    <Route element={<RouteGuard allowedRoles={["customer", "admin", "doctor", "delivery", "manufacturer"]} />}>
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order-tracking" element={<OrderTracking />} />
                      <Route path="doctor-appointment" element={<DoctorAppointment />} />
                    </Route>
                    
                    {/* Customer-only routes */}
                    <Route element={<RouteGuard allowedRoles={["customer"]} customersOnly={true} />}>
                      <Route path="user-dashboard" element={<UserDashboard />} />
                    </Route>
                    
                    {/* Admin-only routes */}
                    <Route element={<RouteGuard allowedRoles={["admin"]} />}>
                      <Route path="admin-dashboard" element={<AdminDashboard />} />
                    </Route>
                    
                    {/* Manufacturer-only routes */}
                    <Route element={<RouteGuard allowedRoles={["manufacturer"]} />}>
                      <Route path="manufacturer-dashboard" element={<ManufacturerDashboard />} />
                    </Route>
                    
                    {/* Doctor-only routes */}
                    <Route element={<RouteGuard allowedRoles={["doctor"]} />}>
                      <Route path="doctor-dashboard" element={<DoctorDashboard />} />
                    </Route>
                    
                    {/* Delivery-only routes */}
                    <Route element={<RouteGuard allowedRoles={["delivery"]} />}>
                      <Route path="delivery-dashboard" element={<DeliveryDashboard />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UserProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
