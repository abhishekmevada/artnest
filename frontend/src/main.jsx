import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <GoogleOAuthProvider clientId="25504343513-8lrubutc5slu043pss64j7kloseq1vki.apps.googleusercontent.com">
            <App />
          </GoogleOAuthProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>,
);
