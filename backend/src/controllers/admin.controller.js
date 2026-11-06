const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const {
  User,
  Artwork,
  Order,
  CustomArtwork,
  ArtistProfile,
  Review,
  ReviewReply,
} = require("../../db/db");

//get artist and artwork info for show in admin page for artist section
const artist_artwork_info = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Verify the logged-in user
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    // 2. Find all users whose role is artist
    const artists = await User.find({
      role: "artist",
    })
      .select("_id name status")
      .lean();

    // Return an empty array if no artists exist
    if (artists.length === 0) {
      return res.status(200).json({
        message: "Done",
        totalArtists: 0,
        totalArtworks: 0,
        artists: [],
      });
    }

    // 3. Get the user IDs
    const artistUserIds = artists.map((artist) => artist._id);

    // 4. Find profiles belonging to those users
    const profiles = await ArtistProfile.find({
      user_id: { $in: artistUserIds },
    })
      .select("_id user_id location specialty rating_avg")
      .lean();

    // 5. Map profiles using their associated user ID
    const profileMap = new Map();

    profiles.forEach((profile) => {
      profileMap.set(profile.user_id.toString(), profile);
    });

    // 6. Get all artist profile IDs
    // const profileIds = profiles.map((profile) => profile._id);

    // console.log("Artist User IDs:", artistUserIds);

    // console.log(
    //   "Artist Profile IDs:",
    //   profiles.map((profile) => profile._id),
    // );

    const allArtworks = await Artwork.find().select("title artist_id").lean();

    // console.log("Artwork records:", allArtworks);

    // 7. Count artworks belonging to each artist profile
    const artworkCounts = await Artwork.aggregate([
      {
        $match: {
          artist_id: { $in: artistUserIds },
        },
      },
      {
        $group: {
          _id: "$artist_id",
          totalArtworks: { $sum: 1 },
        },
      },
    ]);

    // 8. Map artwork counts using artist profile ID
    const artworkCountMap = new Map();

    artworkCounts.forEach((item) => {
      artworkCountMap.set(item._id.toString(), item.totalArtworks);
    });
    const allOrders = await Order.find()
      .select("orderId payment_status status total orderItems")
      .lean();

    console.log("ALL ORDERS:", JSON.stringify(allOrders, null, 2));
    // 10. Calculate sales for each artist
    const salesData = await Order.aggregate([
      // 1. Only successfully paid orders
      {
        $match: {
          payment_status: "paid",
        },
      },

      // 2. Separate order items
      {
        $unwind: "$orderItems",
      },

      // 3. Find artwork details
      {
        $lookup: {
          from: "artworks",
          localField: "orderItems.artworkId",
          foreignField: "_id",
          as: "artwork",
        },
      },

      // 4. Convert artwork array into object
      {
        $unwind: "$artwork",
      },

      // 5. Group sales by artist
      {
        $group: {
          _id: "$artwork.artist_id",

          // Number of artworks sold
          totalSales: {
            $sum: 1,
          },

          // Total revenue from artwork sales
          totalRevenue: {
            $sum: "$artwork.price",
          },
        },
      },

      // 6. Format revenue
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalRevenue: {
            $round: ["$totalRevenue", 2],
          },
        },
      },
    ]);
    const paidOrders = await Order.countDocuments({
      payment_status: "paid",
    });

    console.log("PAID ORDERS:", paidOrders);
    const testSales = await Order.aggregate([
      {
        $match: {
          payment_status: "paid",
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
        $project: {
          orderId: 1,
          payment_status: 1,
          artworkId: "$orderItems.artworkId",
          artwork: 1,
        },
      },
    ]);

    console.log("SALES LOOKUP:", JSON.stringify(testSales, null, 2));
    const testArtwork = await Artwork.findById(
      "6addc6a1e87de90d3f7a33a7",
    ).lean();

    console.log("FOUND ARTWORK:", testArtwork);

    // Create sales map
    const salesMap = new Map();

    salesData.forEach((item) => {
      salesMap.set(item._id.toString(), {
        totalSales: item.totalSales,
        totalRevenue: item.totalRevenue,
      });
    });

    // Calculate average rating for each artist
    const ratingData = await Review.aggregate([
      // 1. Join reviews with artworks
      {
        $lookup: {
          from: "artworks",
          localField: "artwork_id",
          foreignField: "_id",
          as: "artwork",
        },
      },

      // 2. Convert artwork array into object
      {
        $unwind: "$artwork",
      },

      // 3. Group reviews by artist
      {
        $group: {
          _id: "$artwork.artist_id",

          // Average rating
          avgRating: {
            $avg: "$rating",
          },

          // Total reviews
          totalReviews: {
            $sum: 1,
          },
        },
      },

      // 4. Round average rating
      {
        $project: {
          _id: 1,
          avgRating: {
            $round: ["$avgRating", 2],
          },
          totalReviews: 1,
        },
      },
    ]);

    // Create rating map
    const ratingMap = new Map();

    ratingData.forEach((item) => {
      ratingMap.set(item._id.toString(), {
        avgRating: item.avgRating ?? 0,
        totalReviews: item.totalReviews,
      });
    });

    // 9. Build the final artist summary
    const artistList = artists.map((artist) => {
      const profile = profileMap.get(artist._id.toString());

      const artworkCount = artworkCountMap.get(artist._id.toString()) || 0;

      const salesInfo = salesMap.get(artist._id.toString()) || {
        totalSales: 0,
        totalRevenue: 0,
      };

      const ratingInfo = ratingMap.get(artist._id.toString()) || {
        avgRating: 0,
        totalReviews: 0,
      };

      return {
        artistId: artist._id,
        name: artist.name,
        specialty: profile?.specialty || null,
        location: profile?.location || "Not specified",

        artworks: artworkCount,

        sales: salesInfo.totalSales,
        revenue: salesInfo.totalRevenue,

        avg_rating: ratingInfo.avgRating,
        total_reviews: ratingInfo.totalReviews,

        status: artist.status,
      };
    });

    const totalArtworks = artistList.reduce(
      (total, artist) => total + artist.artworks,
      0,
    );

    return res.status(200).json({
      message: "Artist information fetched successfully",
      totalArtists: artistList.length,
      totalArtworks,
      artists: artistList,
    });
  } catch (error) {
    console.error("Artist artwork information error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const activeStatusArtist = async (req, res) => {
  const artistId = req.params.id;
  const userId = req.user.userId;

  try {
    const findArtist = await User.findById(artistId);

    if (!findArtist) {
      return res.status(400).json({ message: "User Not Found" });
    }

    if (userId.role === "artist" || userId.role === "buyer") {
      return res
        .status(400)
        .json({ message: "You have no Authority to Access it" });
    }

    findArtist.status = "active";
    await findArtist.save();
    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const blockStatusArtist = async (req, res) => {
  const artistId = req.params.id;
  const userId = req.user.userId;

  try {
    const findArtist = await User.findById(artistId);

    if (!findArtist) {
      return res.status(400).json({ message: "User Not Found" });
    }

    if (userId.role === "artist" || userId.role === "buyer") {
      return res
        .status(400)
        .json({ message: "You have no Authority to Access it" });
    }

    findArtist.status = "block";
    await findArtist.save();
    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//get all artwork for show in admin page for artwork section
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

const updateArtwork = async (req, res) => {
  const { title, category, status, medium, price } = req.body;
  const artworkId = req.params.id;

  try {
    if (!title || !category || !status || !price || !medium) {
      return res.status(400).json({ message: "Please Fill The Fields" });
    }

    const findArtwork = await Artwork.findById(artworkId);

    if (!findArtwork) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    findArtwork.title = title;
    findArtwork.category = category;
    findArtwork.status = status;
    findArtwork.medium = medium;
    findArtwork.price = price;

    await findArtwork.save();

    res.status(200).json({ message: "Artwork Updated" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const approveArtwork = async (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const findArtworkId = await Artwork.findById(artworkId);

    if (!findArtworkId) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    const findUserId = await User.findById({ _id: userId, role: "admin" });

    if (!findUserId) {
      return res.status(400).json({ message: "User Not Found" });
    }

    findArtworkId.moderation_status = "approved";
    await findArtworkId.save();
    res.status(200).json({ message: "Artwork Approved" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const rejectArtwork = async (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const findArtworkId = await Artwork.findById(artworkId);

    if (!findArtworkId) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    const findUserId = await User.findById({ _id: userId, role: "admin" });

    if (!findUserId) {
      return res.status(400).json({ message: "User Not Found" });
    }

    findArtworkId.moderation_status = "rejected";
    await findArtworkId.save();
    res.status(200).json({ message: "Artwork Rejected" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const listOrders = await Order.find()
      .select(
        "orderId name total placed_at orderItems.artworkId status phonenumber address city state pincode country",
      )
      .populate({
        path: "orderItems.artworkId",
        select: "title artist_id image",
        populate: {
          path: "artist_id",
          select: "name",
        },
      });

    return res.status(200).json({
      message: "List Of Orders",
      listOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getCustomArtWork = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "admin" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const getCustomArtwork = await CustomArtwork.find().populate({
      path: "preferedArtist",
      select: "name",
    });

    res.status(200).json({ message: "List of Artwork", getCustomArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuyers = async (req, res) => {
  try {
    // Filter by buyer role (handles both 'BUYER' and 'buyer')
    const query = { role: { $in: ["BUYER", "buyer"] } };

    // Support optional name/email search
    const searchTerm = req.query.search || req.query.name || req.query.email;

    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), "i");

      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const buyers = await User.find(query)
      .select("_id name email status role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedBuyers = buyers.map((buyer) => ({
      id: buyer._id,
      name: buyer.name,
      email: buyer.email,
      status: buyer.status,
      role: buyer.role,
      createdAt: buyer.createdAt,
    }));

    return res.status(200).json({
      message: "Buyers retrieved successfully",
      totalBuyers: formattedBuyers.length,
      buyers: formattedBuyers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error fetching buyers",
      error: error.message,
    });
  }
};

const adminOverview = async (req, res) => {
  try {
    // Optional year query: /admin/overview?year=2026
    const currentYear = new Date().getFullYear();
    const requestedYear = Number(req.query.year || currentYear);

    if (
      !Number.isInteger(requestedYear) ||
      requestedYear < 2000 ||
      requestedYear > 9999
    ) {
      return res.status(400).json({
        message: "Please provide a valid year",
      });
    }

    // Selected year's date range
    const startOfYear = new Date(requestedYear, 0, 1);
    const startOfNextYear = new Date(requestedYear + 1, 0, 1);

    // All 12 months in order
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // All artwork categories, including categories with no sales
    const artworkCategories = [
      "paintings",
      "sculptures",
      "ceramics",
      "photography",
      "digital",
      "textile",
      "printmaking",
    ];

    const [
      totalRevenueResult,
      monthlyRevenueResult,
      totalOrders,
      pendingOrders,
      totalArtists,
      monthlyArtistsResult,
      totalArtwork,
      customArtRequests,
      monthlyOrdersResult,
      categoryResult,
    ] = await Promise.all([
      // 1. All-time total revenue from paid orders
      Order.aggregate([
        {
          $match: {
            payment_status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]),

      // 2. Monthly revenue for the selected year
      Order.aggregate([
        {
          $match: {
            payment_status: "paid",
            placed_at: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        },
        {
          $group: {
            _id: {
              $month: "$placed_at",
            },
            revenue: {
              $sum: "$total",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 3. Total number of orders
      Order.countDocuments(),

      // 4. Orders that have not yet been delivered or cancelled
      Order.countDocuments({
        status: {
          $nin: ["delivered", "cancle"],
        },
      }),

      // 5. Total artists
      User.countDocuments({
        role: "artist",
      }),

      // 6. Number of artists registered in each month
      User.aggregate([
        {
          $match: {
            role: "artist",
            createdAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        },
        {
          $group: {
            _id: {
              $month: "$createdAt",
            },
            artists: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 7. Total artwork count
      Artwork.countDocuments(),

      // 8. Custom artwork requests awaiting action
      CustomArtwork.countDocuments({
        status: "placed",
      }),

      // 9. Number of orders placed in each month
      Order.aggregate([
        {
          $match: {
            placed_at: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        },
        {
          $group: {
            _id: {
              $month: "$placed_at",
            },
            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // 10. Sales by category for paid orders in the selected year
      Order.aggregate([
        {
          $match: {
            payment_status: "paid",
            placed_at: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
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
          $group: {
            _id: "$artwork.category",
            totalSold: {
              $sum: 1,
            },
            salesRevenue: {
              $sum: "$artwork.price",
            },
          },
        },
        {
          $sort: {
            salesRevenue: -1,
          },
        },
      ]),
    ]);

    const debugSales = await Order.aggregate([
      {
        $match: {
          payment_status: "paid",
          placed_at: {
            $gte: startOfYear,
            $lt: startOfNextYear,
          },
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
        $project: {
          orderId: 1,
          artworkId: "$orderItems.artworkId",
          artworkFound: { $gt: [{ $size: "$artwork" }, 0] },
          artworkTitle: { $arrayElemAt: ["$artwork.title", 0] },
          category: { $arrayElemAt: ["$artwork.category", 0] },
          price: { $arrayElemAt: ["$artwork.price", 0] },
        },
      },
    ]);

    console.log("DEBUG SALES:", debugSales);
    const customRequestDebug = await CustomArtwork.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("CUSTOM REQUEST STATUS:", customRequestDebug);

    // ----------------------------------------
    // MONTHLY REVENUE: JANUARY TO DECEMBER
    // ----------------------------------------

    const monthlyRevenueMap = new Map(
      monthlyRevenueResult.map((item) => [item._id, item.revenue]),
    );

    const monthlyRevenue = monthNames.map((month, index) => ({
      month,
      monthNumber: index + 1,
      revenue: monthlyRevenueMap.get(index + 1) || 0,
    }));

    // ----------------------------------------
    // MONTHLY ORDERS: JANUARY TO DECEMBER
    // ----------------------------------------

    const monthlyOrdersMap = new Map(
      monthlyOrdersResult.map((item) => [item._id, item.orders]),
    );

    const monthlyOrders = monthNames.map((month, index) => ({
      month,
      monthNumber: index + 1,
      orders: monthlyOrdersMap.get(index + 1) || 0,
    }));

    // ----------------------------------------
    // MONTHLY ARTISTS: JANUARY TO DECEMBER
    // ----------------------------------------

    const monthlyArtistsMap = new Map(
      monthlyArtistsResult.map((item) => [item._id, item.artists]),
    );

    const monthlyArtists = monthNames.map((month, index) => ({
      month,
      monthNumber: index + 1,
      artists: monthlyArtistsMap.get(index + 1) || 0,
    }));

    const totalMonthlyArtists = monthlyArtists.reduce(
      (sum, item) => sum + item.artists,
      0,
    );

    // ----------------------------------------
    // SALES BY CATEGORY: INCLUDE ZERO-SALE CATEGORIES
    // ----------------------------------------

    const categoryMap = new Map(categoryResult.map((item) => [item._id, item]));

    const totalCategoryRevenue = categoryResult.reduce(
      (sum, item) => sum + item.salesRevenue,
      0,
    );

    const salesByCategory = artworkCategories.map((category) => {
      const item = categoryMap.get(category);

      const totalSold = item?.totalSold || 0;
      const salesRevenue = item?.salesRevenue || 0;

      const percentage =
        totalCategoryRevenue > 0
          ? Number(((salesRevenue / totalCategoryRevenue) * 100).toFixed(2))
          : 0;

      return {
        category,
        totalSold,
        salesRevenue,
        percentage,
      };
    });

    // ----------------------------------------
    // FINAL RESPONSE
    // ----------------------------------------

    return res.status(200).json({
      message: "Admin dashboard data fetched successfully",

      overview: {
        totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
        totalOrders,
        totalArtists,
        totalArtwork,
        pendingOrders,
        customArtRequests,
      },

      monthlyRevenue: {
        year: requestedYear,
        data: monthlyRevenue,
      },

      monthlyOrders: {
        year: requestedYear,
        data: monthlyOrders,
      },

      monthlyArtists: {
        year: requestedYear,
        total: totalMonthlyArtists,
        data: monthlyArtists,
      },

      salesByCategory: {
        year: requestedYear,
        totalCategoryRevenue,
        data: salesByCategory,
      },
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin dashboard data",
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
        select: "title artworkId artist_id",
        populate: {
          path: "artist_id",
          select: "name email",
          model: "User",
        },
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

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
    }).select("name email role");

    if (!admin) {
      return res.status(404).json({
        message: "Admin Not Found",
      });
    }

    return res.status(200).json({
      message: "Admin profile fetched successfully",
      admin,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, password } = req.body;
    console.log("UPDATE BODY:", req.body);
    console.log("USER ID:", userId);

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin Not Found",
      });
    }

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email");

    return res.status(200).json({
      message: "Admin Profile Updated Successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  artist_artwork_info,
  activeStatusArtist,
  blockStatusArtist,
  getAllArtwork,
  updateArtwork,
  approveArtwork,
  rejectArtwork,
  getBuyers,
  getOrders,
  getCustomArtWork,
  adminOverview,
  getAllreviews,
  getAdminProfile,
  updateAdminProfile,
};
