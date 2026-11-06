const express = require("express");
const autiMiddleware = require("../middlewares/middleware");
const {
  createOder,
  cutomArtworkCreate,
  addItemtoWislist,
  getWishlist,
  removeItemtoWishlist,
  addItemtoCart,
  getCart,
  removeItemtoCart,
  removeallItemCart,
  getOrders,
  getCustomRequests,
  createMessage,
  conversationMessage,
  getConversations,
  getConversationId,
} = require("../controllers/buyer.controller");
const { Customupload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/create-order",
  autiMiddleware,
  Customupload.array("image", 4),
  createOder,
);
router.post(
  "/create-custom-artwork",
  autiMiddleware,
  Customupload.array("image", 4),
  cutomArtworkCreate,
);
router.post("/wishlist-item/:id", autiMiddleware, addItemtoWislist);
router.get("/get-wishlist-item", autiMiddleware, getWishlist);
router.delete(
  "/remove-wishlist-item/:id",
  autiMiddleware,
  removeItemtoWishlist,
);
router.post("/cart/:id", autiMiddleware, addItemtoCart);
router.get("/get-cart", autiMiddleware, getCart);
router.get("/cart", autiMiddleware, getCart);
router.delete("/remove-cart/:id", autiMiddleware, removeItemtoCart);
router.delete("/remove-all-cart", autiMiddleware, removeallItemCart);
router.delete("/remove-all-cart/:id", autiMiddleware, removeallItemCart);
router.get("/get-orders", autiMiddleware, getOrders);
router.get("/get-custom-requests", autiMiddleware, getCustomRequests);
router.get("/get-custom-artwork", autiMiddleware, getCustomRequests);
router.post("/create-message", autiMiddleware, createMessage);
router.post("/conversation/:id", autiMiddleware, conversationMessage);
router.get("/conversation", autiMiddleware, getConversations);
router.get("/conversation/:id", autiMiddleware, getConversationId);

module.exports = router;
