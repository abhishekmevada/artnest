const express = require("express");
const {
  signupArtist,
  login,
  signupAdmin,
  registerBuyer,
  googleBuyer,
  googleArtist,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const router = express.Router();

router.post("/artist_signup", signupArtist);
router.post("/login", login);
router.post("/admin_signup", signupAdmin);
router.post("/buyer_signup", registerBuyer);
router.post("/google/buyer", googleBuyer);
router.post("/google/artist", googleArtist);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
