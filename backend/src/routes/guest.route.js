const express = require("express");
const {
  getAllArtwork,
  getAllArtist,
  newsletterSub,
  homePaintings,
  offerGet,
  homeSculptures,
  getHomeArtists,
  getArtworkById,
} = require("../controllers/guest.controller");

const routes = express.Router();

routes.get("/get-all-artwork", getAllArtwork);
routes.get("/get-artwork/:id", getArtworkById);
routes.get("/artwork/:id", getArtworkById);
routes.get("/get-all-artist", getAllArtist);
routes.get("/home-paintings", homePaintings);
routes.get("/home-sculptures", homeSculptures);
routes.post("/subscribe", newsletterSub);
routes.get("/offers", offerGet);
routes.get("/get-artist-home", getHomeArtists);

module.exports = routes;
