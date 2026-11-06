const express = require("express");
const autiMiddleware = require("../middlewares/middleware");
const {
  create_artwork,
  deleteArtwork,
  getOrders,
  getCustomArtwork,
  rejectCustomArtwork,
  changeStatusOrder,
  acceptCustomArtwork,
  getArtwork,
  update_artwork,
  changeStatusCustomArtwork,
  getArtistEarnings,
  artistOverview,
  updateArtistProfile,
  profileGet,
  messageReply,
  getConversations,
  getConversationId,
  createOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/artist.controller");
const { upload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/create-artwork",
  autiMiddleware,
  upload.array("image", 3),
  create_artwork,
);
router.delete("/artwork-delete/:id", autiMiddleware, deleteArtwork);
router.patch(
  "/artwork-update/:id",
  autiMiddleware,
  upload.array("image", 3),
  update_artwork,
);
router.get("/get-artwork", autiMiddleware, getArtwork);
router.get("/artwork-orders", autiMiddleware, getOrders);
router.post("/artwork-order-status/:id", autiMiddleware, changeStatusOrder);
router.get("/custom-artwork", autiMiddleware, getCustomArtwork);
router.post("/accept-custom-artwork/:id", autiMiddleware, acceptCustomArtwork);
router.post("/reject-custom-artwork/:id", autiMiddleware, rejectCustomArtwork);
router.patch(
  "/update-status-custom-artwork/:id",
  autiMiddleware,
  changeStatusCustomArtwork,
);
router.get("/artist-earnings", autiMiddleware, getArtistEarnings);
router.get("/artist-overview", autiMiddleware, artistOverview);
router.patch("/update-artist-profile", autiMiddleware, updateArtistProfile);
router.get("/artist-profile", autiMiddleware, profileGet);
router.post("/conversation/:id", autiMiddleware, messageReply);
router.get("/conversation", autiMiddleware, getConversations);
router.get("/conversation/:id", autiMiddleware, getConversationId);
router.post("/create-offer/:id", autiMiddleware, createOffer);
router.patch("/update-offer/:id", autiMiddleware, updateOffer);
router.delete("/delete-offer/:id", autiMiddleware, deleteOffer);

module.exports = router;
