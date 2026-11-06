const mongoose = require("mongoose");

const {
  Review,
  ReviewReply,
  Artwork,
  ArtistProfile,
  Order,
  User,
} = require("../../db/db");

// 1. CREATE OR UPDATE REVIEW
const create_review = async (req, res) => {
  const { rating, comment = "" } = req.body;
  const userId = req.user.userId;
  const artworkId = req.params.id;
  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not found" });
    }

    const findArtwork = await Artwork.findById(artworkId);

    if (!findArtwork) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    let review = await Review.findOne({
      artwork_id: artworkId,
      buyer_id: userId,
    });

    if (review) {
      review.rating = rating;
      review.comment = comment.trim();
      await review.save();

      return res.status(200).json({
        message: "Review updated successfully",
        review,
      });
    }

    review = await Review.create({
      artwork_id: artworkId,
      buyer_id: userId,
      rating,
      comment: comment.trim(),
    });

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// 2. ARTIST REPLIES TO A REVIEW
const reply_to_review = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { text } = req.body;
    const userId = req.user.userId;

    const findUser = await User.findOne({ _id: userId, role: "artist" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const artwork = await Artwork.findById(review.artwork_id);

    if (!artwork) {
      return res.status(404).json({
        message: "Artwork not found",
      });
    }

    const user = await User.findById(artwork.artist_id.toString());

    let existingReply = await ReviewReply.findOne({ review_id: reviewId });
    if (existingReply) {
      existingReply.text = text;
      await existingReply.save();
      return res.status(200).json({
        message: "Reply saved successfully",
        text,
      });
    }

    const newReply = new ReviewReply({
      review_id: reviewId,
      artist_id: user,
      text,
    });

    await newReply.save();

    return res.status(200).json({
      message: "Reply saved successfully",
      text,
    });
  } catch (error) {
    console.error("Reply to review error:", error);

    return res.status(500).json({
      message: "Failed to save reply",
      error: error.message,
    });
  }
};

// 3. GET REVIEWS FOR AN ARTWORK

const get_reviews = async (req, res) => {
  try {
    const { artworkId } = req.params;

    // 1. Validate artwork ID
    if (!mongoose.isValidObjectId(artworkId)) {
      return res.status(400).json({
        message: "Invalid artwork ID",
      });
    }

    // 2. Find artwork
    const artwork = await Artwork.findById(artworkId).lean();

    if (!artwork) {
      return res.status(404).json({
        message: "Artwork not found",
      });
    }

    // 3. Fetch reviews for this artwork
    const reviews = await Review.find({
      artwork_id: artworkId,
    })
      .populate({
        path: "buyer_id",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Extract review IDs
    const reviewIds = reviews.map((review) => review._id);

    // 5. Fetch replies for these reviews
    const replies = reviewIds.length
      ? await ReviewReply.find({
          review_id: { $in: reviewIds },
        })
          .populate({
            path: "artist_id",
            select: "name",
          })
          .lean()
      : [];

    // 6. Map replies by review ID
    const replyMap = new Map(
      replies.map((reply) => [String(reply.review_id), reply]),
    );

    // 7. Attach replies to reviews
    const reviewsWithReplies = reviews.map((review) => ({
      ...review,
      reply: replyMap.get(String(review._id)) || null,
    }));

    // 8. Return response
    return res.status(200).json({
      message: "Reviews fetched successfully",
      artworkId: artwork._id,
      totalReviews: reviewsWithReplies.length,
      reviews: reviewsWithReplies,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

const getAllreviews = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // 1. Verify logged-in user
    const findUser = await User.findById(userId).select("_id name role").lean();

    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Fetch all reviews
    const reviews = await Review.find({})
      .populate({
        path: "buyer_id",
        select: "name email",
      })
      .populate({
        path: "artwork_id",
        select: "title artworkId image artist_id",
      })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Fetch replies for all reviews
    const reviewIds = reviews.map((review) => review._id);

    const replies = reviewIds.length
      ? await ReviewReply.find({
          review_id: { $in: reviewIds },
        })
          .populate({
            path: "artist_id",
            select: "name",
          })
          .lean()
      : [];

    // 4. Create a map of replies by review ID
    const replyMap = new Map(
      replies.map((reply) => [String(reply.review_id), reply]),
    );

    // 5. Attach each reply to its review
    const reviewsWithReplies = reviews.map((review) => ({
      ...review,
      reply: replyMap.get(String(review._id)) || null,
    }));

    // 6. Return all reviews and replies
    return res.status(200).json({
      message: "All reviews fetched successfully",
      totalReviews: reviewsWithReplies.length,
      reviews: reviewsWithReplies,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      message: "Failed to fetch all reviews",
      error: error.message,
    });
  }
};

module.exports = {
  create_review,
  reply_to_review,
  get_reviews,
  getAllreviews,
};
