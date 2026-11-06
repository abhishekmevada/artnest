import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Layouts
import PublicLayout from "./layouts/PublicLayout";
import ArtistLayout from "./layouts/ArtistLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public pages
import Home from "./pages/public/Home";
import Discover from "./pages/public/Discover";
import Collections from "./pages/public/Collections";
import ArtworkDetail from "./pages/public/ArtworkDetail";
import Artists from "./pages/public/Artists";
import ArtistDetails from "./pages/public/ArtistDetails";
import CustomArt from "./pages/public/CustomArt";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Blog from "./pages/public/Blog";
import Privacy from "./pages/public/Privacy";
import Terms from "./pages/public/Terms";
import NotFound from "./pages/public/NotFound";
import Feed from "./pages/public/Feed";
import FAQ from "./pages/public/FAQ";
import Gallery from "./pages/public/Gallery";
import Packaging from "./pages/public/Packaging";
import Accessibility from "./pages/public/Accessibility";

// Auth pages
import BuyerLogin from "./pages/auth/BuyerLogin";
import BuyerRegister from "./pages/auth/BuyerRegister";
import BuyerForgotPass from "./pages/auth/BuyerForgotPass";
import ArtistLogin from "./pages/auth/ArtistLogin";
import ArtistRegister from "./pages/auth/ArtistRegister";
import ArtistForgotPass from "./pages/auth/ArtistForgotPass";
import AdminLogin from "./pages/auth/AdminLogin";

// Buyer pages
import BuyerDashboard from "./pages/buyer/Dashboard";
import Wishlist from "./pages/buyer/Wishlist";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import OrderSuccess from "./pages/buyer/OrderSuccess";
import BuyerOrders from "./pages/buyer/Orders";
import OrderDetails from "./pages/buyer/OrderDetails";
import BuyerProfile from "./pages/buyer/Profile";

// Artist pages
import ArtistDashboard from "./pages/artist/Dashboard";
import MyArtworks from "./pages/artist/MyArtworks";
import ArtworkForm from "./pages/artist/ArtworkForm";
import ArtistOrders from "./pages/artist/Orders";
import CustomRequests from "./pages/artist/CustomRequests";
import Earnings from "./pages/artist/Earnings";
import Reviews from "./pages/artist/Reviews";
import Messages from "./pages/artist/Messages";
import ArtistProfile from "./pages/artist/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminArtists from "./pages/admin/Artists";
import AdminArtworks from "./pages/admin/Artworks";
import AdminCustomArtRequests from "./pages/admin/CustomArtRequests";
import Users from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminReviews from "./pages/admin/Reviews";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetails />} />
          <Route path="/custom-art" element={<CustomArt />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/accessibility" element={<Accessibility />} />

          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<BuyerOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<BuyerProfile />} />
        </Route>

        <Route path="/feed" element={<Feed />} />
        <Route path="/buyer/login" element={<BuyerLogin />} />
        <Route path="/buyer/register" element={<BuyerRegister />} />
        <Route path="/buyer/forgot-password" element={<BuyerForgotPass />} />
        <Route path="/artist/login" element={<ArtistLogin />} />
        <Route path="/artist/register" element={<ArtistRegister />} />
        <Route path="/artist/forgot-password" element={<ArtistForgotPass />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/artist" element={<ArtistLayout />}>
          <Route index element={<ArtistDashboard />} />
          <Route path="artworks" element={<MyArtworks />} />
          <Route path="artworks/new" element={<ArtworkForm />} />
          <Route path="artworks/:id/edit" element={<ArtworkForm />} />
          <Route path="orders" element={<ArtistOrders />} />
          <Route path="requests" element={<CustomRequests />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<ArtistProfile />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="artworks" element={<AdminArtworks />} />
          <Route path="custom-requests" element={<AdminCustomArtRequests />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/adminLogin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/artistLogin" element={<Navigate to="/artist/login" replace />} />
        <Route path="/artistReg" element={<Navigate to="/artist/register" replace />} />
        <Route path="/artistForgotPass" element={<Navigate to="/artist/forgot-password" replace />} />
        <Route path="/buyerLogin" element={<Navigate to="/buyer/login" replace />} />
        <Route path="/buyerReg" element={<Navigate to="/buyer/register" replace />} />
        <Route path="/buyerForgotPass" element={<Navigate to="/buyer/forgot-password" replace />} />

        <Route path="/login/buyer" element={<Navigate to="/buyer/login" replace />} />
        <Route path="/login/artist" element={<Navigate to="/artist/login" replace />} />
        <Route path="/register/buyer" element={<Navigate to="/buyer/register" replace />} />
        <Route path="/register/artist" element={<Navigate to="/artist/register" replace />} />
        <Route path="/forgot-password/buyer" element={<Navigate to="/buyer/forgot-password" replace />} />
        <Route path="/forgot-password/artist" element={<Navigate to="/artist/forgot-password" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}