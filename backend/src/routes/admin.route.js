const express = require("express");
const {
  activeStatusArtist,
  blockStatusArtist,
  getAllArtwork,
  updateArtwork,
  approveArtwork,
  rejectArtwork,
  getBuyers,
  getOrders,
  getCustomArtWork,
  artist_artwork_info,
  adminOverview,
  getAllreviews,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/admin.controller");
const autiMiddleware = require("../middlewares/middleware");

const route = express.Router();

route.get("/artist-artwork-info", autiMiddleware, artist_artwork_info);
route.patch("/active-artist/:id", autiMiddleware, activeStatusArtist);
route.patch("/block-artist/:id", autiMiddleware, blockStatusArtist);
route.get("/get-artwork", autiMiddleware, getAllArtwork);
route.get("/get-orders", autiMiddleware, getOrders);
route.get("/get-custom-artwork", autiMiddleware, getCustomArtWork);
route.get("/get-buyer", autiMiddleware, getBuyers);
route.patch("/update-artwork/:id", autiMiddleware, updateArtwork);
route.patch("/approve-artwork/:id", autiMiddleware, approveArtwork);
route.patch("/rejected-artwork/:id", autiMiddleware, rejectArtwork);
route.get("/get-admin-overview", autiMiddleware, adminOverview);
route.get("/get-admin-reviews", autiMiddleware, getAllreviews);
route.get("/get-admin-profile", autiMiddleware, getAdminProfile);
route.put("/update-admin-profile", autiMiddleware, updateAdminProfile);

module.exports = route;
