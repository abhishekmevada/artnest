const express = require("express");
const authMiddleware = require("../middlewares/middleware");
const reviewController = require("../controllers/review.controller");

const router = express.Router();

router.post(
  "/create-review/:id",
  authMiddleware,
  reviewController.create_review,
);

router.post("/:id/reply", authMiddleware, reviewController.reply_to_review);
router.get("/get-all-review", authMiddleware, reviewController.getAllreviews);

router.get("/:artworkId", reviewController.get_reviews);

module.exports = router;
