const mongoose = require("mongoose");
const {
  Artwork,
  User,
  ArtistProfile,
  NewsletterSubscriber,
  Order,
  Offer,
} = require("../../db/db");
const { validateEmail } = require("../validators/auth.validator");

const getAllArtwork = async (req, res) => {
  try {
    const getAllArtwork = await Artwork.find().populate("artist_id", "name");

    res.status(200).json({ message: "All Artwork", getAllArtwork });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllArtist = async (req, res) => {
  try {
    // 1. Get all artists
    const artists = await User.find({ role: "artist" }).select("name email");

    // 2. Get each artist's profile and top 3 artworks
    const artistProfiles = await Promise.all(
      artists.map(async (artist) => {
        // Get artist profile
        const profile = await ArtistProfile.findOne({
          user_id: artist._id,
        });

        // Get top 3 published artworks
        const artworks = await Artwork.find({
          artist_id: artist._id,
          status: "published",
        })
          .select("artworkId title image")
          .sort({ createdAt: -1 })
          .limit(3);

        return {
          ...artist.toObject(),
          artistProfile: profile,
          topArtworks: artworks.map((artwork) => ({
            artworkId: artwork.artworkId,
            title: artwork.title,
            image: artwork.image.map((img) => ({
              url: img.url,
              publicId: img.publicId,
            })),
          })),
        };
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Artists fetched successfully",
      totalArtists: artistProfiles.length,
      artists: artistProfiles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const newsletterSub = async (req, res) => {
  const { email } = req.body;

  try {
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const checkExistemail = await NewsletterSubscriber.findOne({ email });

    if (checkExistemail) {
      return res.status(400).json({ message: "email already exist" });
    }

    const newSub = new NewsletterSubscriber({
      email,
    });
    await newSub.save();
    res.status(200).json({ message: "Subscribe Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const homePaintings = async (req, res) => {
  try {
    // 1. Fetch popular paintings
    const popularPaintings = await Order.aggregate([
      {
        $match: {
          $or: [{ payment_status: "paid" }, { status: "delivered" }],
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $lookup: {
          from: "artworks",
          localField: "orderItems.artworkId",
          foreignField: "_id",
          as: "artwork",
        },
      },
      {
        $unwind: "$artwork",
      },
      {
        $match: {
          "artwork.category": "paintings",
          "artwork.status": {
            $in: ["published", "sold"],
          },
        },
      },
      {
        $group: {
          _id: "$artwork._id",
          totalSales: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalSales: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "artworks",
          localField: "_id",
          foreignField: "_id",
          as: "artwork",
        },
      },
      {
        $unwind: "$artwork",
      },
      {
        $lookup: {
          from: "users",
          localField: "artwork.artist_id",
          foreignField: "_id",
          as: "artist",
        },
      },
      {
        $unwind: "$artist",
      },
      {
        $project: {
          _id: "$artwork._id",
          artist_id: "$artwork.artist_id",
          artworkId: "$artwork.artworkId",
          image: "$artwork.image",
          title: "$artwork.title",
          category: "$artwork.category",
          description: "$artwork.description",
          medium: "$artwork.medium",
          dimensions: "$artwork.dimensions",
          location: "$artwork.location",
          tag: "$artwork.tag",
          price: "$artwork.price",
          status: "$artwork.status",
          createdAt: "$artwork.createdAt",
          updatedAt: "$artwork.updatedAt",
          totalSales: 1,
          artist: {
            _id: "$artist._id",
            name: "$artist.name",
            email: "$artist.email",
          },
        },
      },
    ]);

    // 2. If 10 popular paintings exist, return them
    if (popularPaintings.length >= 10) {
      return res.status(200).json({
        message: "Popular paintings fetched successfully",
        source: "popular",
        totalPaintings: popularPaintings.length,
        paintings: popularPaintings,
      });
    }

    // 3. Calculate remaining paintings needed
    const remainingCount = 10 - popularPaintings.length;

    // 4. Exclude already selected popular painting IDs
    const popularIds = popularPaintings.map((painting) => painting._id);

    // 5. Fetch random paintings from different artists
    const randomPaintings = await Artwork.aggregate([
      {
        $match: {
          category: "paintings",
          status: "published",
          _id: {
            $nin: popularIds,
          },
        },
      },

      {
        $addFields: {
          randomSort: { $rand: {} },
        },
      },

      {
        $sort: {
          randomSort: 1,
        },
      },

      // One random painting per artist
      {
        $group: {
          _id: "$artist_id",
          artwork: {
            $first: "$$ROOT",
          },
        },
      },

      {
        $replaceRoot: {
          newRoot: "$artwork",
        },
      },

      // Random order of selected artists
      {
        $addFields: {
          randomArtistSort: { $rand: {} },
        },
      },

      {
        $sort: {
          randomArtistSort: 1,
        },
      },

      // Get artist information
      {
        $lookup: {
          from: "users",
          localField: "artist_id",
          foreignField: "_id",
          as: "artist",
        },
      },

      {
        $unwind: "$artist",
      },

      {
        $project: {
          _id: 1,
          artist_id: 1,
          artworkId: 1,
          image: 1,
          title: 1,
          category: 1,
          description: 1,
          medium: 1,
          dimensions: 1,
          location: 1,
          tag: 1,
          price: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,

          artist: {
            _id: "$artist._id",
            name: "$artist.name",
            email: "$artist.email",
          },
        },
      },

      // Only fetch the number needed
      {
        $limit: remainingCount,
      },
    ]);

    // 6. Combine popular + random paintings
    const finalPaintings = [...popularPaintings, ...randomPaintings];

    // 7. Determine response source
    let source = "mixed";

    if (popularPaintings.length === 0) {
      source = "random";
    }

    return res.status(200).json({
      message: "Home paintings fetched successfully",
      source,
      totalPaintings: finalPaintings.length,
      popularCount: popularPaintings.length,
      randomCount: randomPaintings.length,
      paintings: finalPaintings,
    });
  } catch (error) {
    console.error("Home paintings error:", error);

    return res.status(500).json({
      message: "Failed to fetch paintings",
      error: error.message,
    });
  }
};

const homeSculptures = async (req, res) => {
  try {
    // 1. Fetch popular sculptures
    const popularSculptures = await Order.aggregate([
      {
        $match: {
          $or: [{ payment_status: "paid" }, { status: "delivered" }],
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $lookup: {
          from: "artworks",
          localField: "orderItems.artworkId",
          foreignField: "_id",
          as: "artwork",
        },
      },
      {
        $unwind: "$artwork",
      },
      {
        $match: {
          "artwork.category": "sculptures",
          "artwork.status": {
            $in: ["published", "sold"],
          },
        },
      },
      {
        $group: {
          _id: "$artwork._id",
          totalSales: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalSales: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "artworks",
          localField: "_id",
          foreignField: "_id",
          as: "artwork",
        },
      },
      {
        $unwind: "$artwork",
      },
      {
        $lookup: {
          from: "users",
          localField: "artwork.artist_id",
          foreignField: "_id",
          as: "artist",
        },
      },
      {
        $unwind: "$artist",
      },
      {
        $project: {
          _id: "$artwork._id",
          artist_id: "$artwork.artist_id",
          artworkId: "$artwork.artworkId",
          image: "$artwork.image",
          title: "$artwork.title",
          category: "$artwork.category",
          description: "$artwork.description",
          medium: "$artwork.medium",
          dimensions: "$artwork.dimensions",
          location: "$artwork.location",
          tag: "$artwork.tag",
          price: "$artwork.price",
          status: "$artwork.status",
          createdAt: "$artwork.createdAt",
          updatedAt: "$artwork.updatedAt",
          totalSales: 1,
          artist: {
            _id: "$artist._id",
            name: "$artist.name",
            email: "$artist.email",
          },
        },
      },
    ]);

    // 2. If 10 popular sculptures exist, return them
    if (popularSculptures.length >= 10) {
      return res.status(200).json({
        message: "Popular sculptures fetched successfully",
        source: "popular",
        totalSculptures: popularSculptures.length,
        sculptures: popularSculptures,
      });
    }

    // 3. Calculate remaining sculptures needed
    const remainingCount = 10 - popularSculptures.length;

    // 4. Exclude already selected popular sculpture IDs
    const popularIds = popularSculptures.map((sculpture) => sculpture._id);

    // 5. Fetch random sculptures from different artists
    const randomSculptures = await Artwork.aggregate([
      {
        $match: {
          category: "sculptures",
          status: "published",
          _id: {
            $nin: popularIds,
          },
        },
      },
      {
        $addFields: {
          randomSort: { $rand: {} },
        },
      },
      {
        $sort: {
          randomSort: 1,
        },
      },

      // One random sculpture per artist
      {
        $group: {
          _id: "$artist_id",
          artwork: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$artwork",
        },
      },

      // Random order of selected artists
      {
        $addFields: {
          randomArtistSort: { $rand: {} },
        },
      },
      {
        $sort: {
          randomArtistSort: 1,
        },
      },

      // Get artist information
      {
        $lookup: {
          from: "users",
          localField: "artist_id",
          foreignField: "_id",
          as: "artist",
        },
      },
      {
        $unwind: "$artist",
      },
      {
        $project: {
          _id: 1,
          artist_id: 1,
          artworkId: 1,
          image: 1,
          title: 1,
          category: 1,
          description: 1,
          medium: 1,
          dimensions: 1,
          location: 1,
          tag: 1,
          price: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          artist: {
            _id: "$artist._id",
            name: "$artist.name",
            email: "$artist.email",
          },
        },
      },

      // Only fetch the number needed
      {
        $limit: remainingCount,
      },
    ]);

    // 6. Combine popular + random sculptures
    const finalSculptures = [...popularSculptures, ...randomSculptures];

    // 7. Determine response source
    let source = "mixed";

    if (popularSculptures.length === 0) {
      source = "random";
    }

    return res.status(200).json({
      message: "Home sculptures fetched successfully",
      source,
      totalSculptures: finalSculptures.length,
      popularCount: popularSculptures.length,
      randomCount: randomSculptures.length,
      sculptures: finalSculptures,
    });
  } catch (error) {
    console.error("Home sculptures error:", error);

    return res.status(500).json({
      message: "Failed to fetch sculptures",
      error: error.message,
    });
  }
};

const offerGet = async (req, res) => {
  try {
    const listOffer = await Offer.find()
      .populate({
        path: "artwork_id",
        populate: {
          path: "artist_id",
          select: "name email location",
        },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const validOffers = listOffer.filter((o) => {
      if (!o.artwork_id) return false;
      if (o.ends_on) {
        const end = new Date(o.ends_on);
        end.setHours(23, 59, 59, 999);
        if (end < now) return false;
      }
      return true;
    });

    res.status(200).json({ message: "Offers", listOffer: validOffers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeArtists = async (req, res) => {
  try {
    // 1. Get 6 artists
    const artists = await User.find({
      role: "artist",
    })
      .select("name")
      .limit(6);

    // 2. Get artist profiles
    const artistProfiles = await Promise.all(
      artists.map(async (artist) => {
        const profile = await ArtistProfile.findOne({
          user_id: artist._id,
        }).select("location bio");

        return {
          _id: artist._id,
          name: artist.name,
          address: profile?.location || null,
          bio: profile?.bio || null,
        };
      }),
    );

    // 3. Send response
    return res.status(200).json({
      success: true,
      message: "Home artists fetched successfully",
      totalArtists: artistProfiles.length,
      artists: artistProfiles,
    });
  } catch (error) {
    console.error("Home artists error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch home artists",
      error: error.message,
    });
  }
};


const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;
    let artwork = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      artwork = await Artwork.findById(id).populate("artist_id", "name email");
    }

    if (!artwork) {
      artwork = await Artwork.findOne({ artworkId: id }).populate(
        "artist_id",
        "name email"
      );
    }

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    let artistProfile = null;
    if (artwork.artist_id?._id) {
      artistProfile = await ArtistProfile.findOne({
        user_id: artwork.artist_id._id,
      }).select("location specialty bio rating_avg");
    }

    return res.status(200).json({
      message: "Artwork fetched successfully",
      artwork,
      artistProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllArtwork,
  getAllArtist,
  newsletterSub,
  homePaintings,
  homeSculptures,
  offerGet,
  getHomeArtists,
  getArtworkById,
};
