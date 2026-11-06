const mongoose = require("mongoose");
const {
  Artwork,
  User,
  Order,
  CustomArtwork,
  ReviewCustomArtwork,
  Review,
  ReviewReply,
  ArtistProfile,
  Message,
  Offer,
} = require("../../db/db");
const cloudinary = require("../config/cloudinary");

async function generateArtwokrId() {
  let artworkId;
  let exists = true;

  while (exists) {
    artworkId = `ART-${Math.floor(100000 + Math.random() * 900000)}`;

    const existingArtwork = await Artwork.findOne({
      artworkId,
    });

    exists = !!existingArtwork;
  }

  return artworkId;
}

// Upload one image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "artworks",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(fileBuffer);
  });
};

// Delete uploaded Cloudinary images if artwork creation fails
const deleteCloudinaryImages = async (images) => {
  await Promise.allSettled(
    images.map((image) => cloudinary.uploader.destroy(image.publicId)),
  );
};

const create_artwork = async (req, res) => {
  const uploadedImages = [];
  let artworkSaved = false;

  try {
    const {
      title,
      category,
      price,
      medium,
      size,
      location,
      tag,
      description,
      status,
    } = req.body;

    const userId = req.user?.userId;
    const files = req.files || [];

    // Validate image count
    if (files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
      });
    }

    if (files.length > 3) {
      return res.status(400).json({
        message: "You can upload a maximum of 3 images",
      });
    }

    // Validate required fields
    if (
      !title?.trim() ||
      !category ||
      price === undefined ||
      price === "" ||
      !medium?.trim() ||
      !size?.trim() ||
      !location?.trim() ||
      !tag?.trim() ||
      !description?.trim() ||
      !status
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "Price must be a number greater than zero",
      });
    }

    // Verify user
    const verifyUserId = await User.findById(userId);

    if (!verifyUserId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (verifyUserId.role === "buyer" || verifyUserId.role === "admin") {
      return res.status(403).json({
        message: "You have no authority to create artwork",
      });
    }

    // Upload all images to Cloudinary
    for (const file of files) {
      const image = await uploadToCloudinary(file.buffer);
      uploadedImages.push(image);
    }

    // Generate artwork ID
    const artworkId = await generateArtwokrId();

    // Create artwork document
    const newArtwork = new Artwork({
      artist_id: userId,
      artworkId,
      image: uploadedImages,
      title: title.trim(),
      category,
      description,
      medium,
      dimensions: size,
      location,
      tag,
      price: numericPrice,
      status,
    });

    await newArtwork.save();
    artworkSaved = true;

    return res.status(201).json({
      message: "Artwork created successfully",
      artwork: newArtwork,
    });
  } catch (error) {
    console.error("Create artwork error:", error);

    return res.status(500).json({
      message: "Failed to create artwork",
      error: error.message,
    });
  } finally {
    // If upload or database creation failed, remove uploaded images.
    // Do not remove images after a successful save.
    if (!artworkSaved && uploadedImages.length > 0) {
      await deleteCloudinaryImages(uploadedImages);
    }
  }
};

const getArtwork = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch artist's artworks
    const getAllArtwork = await Artwork.find({
      artist_id: userId,
    }).lean();

    // Get all artwork IDs
    const artworkIds = getAllArtwork.map((art) => art._id);

    // Fetch offers belonging to these artworks
    const allOffers = await Offer.find({
      artwork_id: { $in: artworkIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map of artwork ID and its latest offer
    const offerMap = new Map();

    allOffers.forEach((offer) => {
      const artworkId = offer.artwork_id.toString();

      if (!offerMap.has(artworkId)) {
        offerMap.set(artworkId, offer);
      }
    });

    // Attach offer to each artwork
    const artworksWithOffers = getAllArtwork.map((artwork) => ({
      ...artwork,
      offer: offerMap.get(artwork._id.toString()) || null,
    }));

    return res.status(200).json({
      message: "All Artwork",
      getAllArtwork: artworksWithOffers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const update_artwork = async (req, res) => {
  const uploadedImages = [];
  let databaseUpdated = false;

  try {
    const artworkId = req.params.id;

    const userId = req.user?.userId;
    const files = req.files || [];

    // 1. Verify user
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "buyer" || user.role === "admin") {
      return res.status(403).json({
        message: "You have no authority to update artwork",
      });
    }

    // 2. Find artwork
    const artwork = await Artwork.findOne({ _id: artworkId });

    if (!artwork) {
      return res.status(404).json({
        message: "Artwork not found",
      });
    }

    // 3. Verify artwork ownership
    if (artwork.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can update only your own artwork",
      });
    }

    // 4. Validate fields if provided
    const {
      title,
      category,
      price,
      medium,
      size,
      location,
      tag,
      description,
      status,
    } = req.body || {};

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    if (
      category !== undefined &&
      ![
        "paintings",
        "sculptures",
        "ceramics",
        "photography",
        "digital",
        "textile",
        "printmaking",
      ].includes(category)
    ) {
      return res.status(400).json({
        message: "Invalid artwork category",
      });
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (price === "" || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          message: "Price must be a number greater than zero",
        });
      }
    }

    if (
      status !== undefined &&
      !["draft", "published", "sold"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid artwork status",
      });
    }

    if (medium !== undefined && !medium.trim()) {
      return res.status(400).json({
        message: "Medium cannot be empty",
      });
    }

    if (size !== undefined && !size.trim()) {
      return res.status(400).json({
        message: "Dimensions cannot be empty",
      });
    }

    if (location !== undefined && !location.trim()) {
      return res.status(400).json({
        message: "Location cannot be empty",
      });
    }

    if (tag !== undefined && !tag.trim()) {
      return res.status(400).json({
        message: "Tag cannot be empty",
      });
    }

    if (description !== undefined && !description.trim()) {
      return res.status(400).json({
        message: "Description cannot be empty",
      });
    }

    // 5. Validate image count
    // Existing images remain unless new images are uploaded.
    if (files.length > 0 && files.length > 3) {
      return res.status(400).json({
        message: "You can upload a maximum of 3 new images",
      });
    }

    // 6. Upload new images to Cloudinary
    for (const file of files) {
      const image = await uploadToCloudinary(file.buffer);
      uploadedImages.push(image);
    }

    // Save the existing image references before replacing them.
    artwork._previousImages = artwork.image.map((image) => ({
      url: image.url,
      publicId: image.publicId,
    }));

    // 7. Replace existing images if new images are uploaded
    if (files.length > 0) {
      if (uploadedImages.length > 3) {
        return res.status(400).json({
          message: "An artwork can have a maximum of 3 images",
        });
      }

      artwork.image = uploadedImages;
    }

    // 8. Update only fields provided by the client
    if (title !== undefined) {
      artwork.title = title.trim();
    }

    if (category !== undefined) {
      artwork.category = category;
    }

    if (price !== undefined) {
      artwork.price = Number(price);
    }

    if (medium !== undefined) {
      artwork.medium = medium.trim();
    }

    if (size !== undefined) {
      artwork.dimensions = size.trim();
    }

    if (location !== undefined) {
      artwork.location = location.trim();
    }

    if (tag !== undefined) {
      artwork.tag = tag.trim();
    }

    if (description !== undefined) {
      artwork.description = description.trim();
    }

    if (status !== undefined) {
      artwork.status = status;
    }

    // 9. Save updated artwork
    await artwork.save();
    databaseUpdated = true;

    // 10. Delete old Cloudinary images after successful save
    // Only delete images that are no longer referenced.
    if (files.length > 0) {
      const newPublicIds = new Set(
        uploadedImages.map((image) => image.publicId),
      );

      const oldImages = artwork._previousImages || [];

      await Promise.allSettled(
        oldImages
          .filter((image) => !newPublicIds.has(image.publicId))
          .map((image) => cloudinary.uploader.destroy(image.publicId)),
      );
    }

    console.log("Request Content-Type:", req.headers["content-type"]);
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    return res.status(200).json({
      message: "Artwork updated successfully",
      artwork,
    });
  } catch (error) {
    console.error("Update artwork error:", error);

    return res.status(500).json({
      message: "Failed to update artwork",
      error: error.message,
    });
  } finally {
    // Remove newly uploaded images if the database update fails.
    if (!databaseUpdated && uploadedImages.length > 0) {
      await deleteCloudinaryImages(uploadedImages);
    }
  }
};

const deleteArtwork = async (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "artist" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findArtwork = await Artwork.findById(artworkId);

    if (!findArtwork) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    if (userId.toString() !== findArtwork.artist_id.toString()) {
      return res
        .status(400)
        .json({ message: "You can not delete other artist artwork" });
    }

    const deleteArtwork = await Artwork.findByIdAndDelete(artworkId);

    res.status(200).json({ message: "Artwork Deleted" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check whether user exists
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    // Check artist role
    if (checkUser.role !== "artist") {
      return res.status(403).json({
        message: "Only artists can access these orders",
      });
    }

    // Find artworks belonging to this artist
    const artworks = await Artwork.find({
      artist_id: userId,
    }).select("_id");

    // Extract artwork IDs
    const artworkIds = artworks.map((artwork) => artwork._id);

    // Find orders containing this artist's artworks
    const listOrders = await Order.find({
      "orderItems.artworkId": { $in: artworkIds },
    })
      .select(
        "orderId name total placed_at orderItems.artworkId status phonenumber address city state pincode country",
      )
      .populate({
        path: "orderItems.artworkId",
        select: "title artist_id",
        populate: {
          path: "artist_id",
          select: "name",
        },
      })
      .sort({ placed_at: -1 });

    return res.status(200).json({
      message: "List Of Artist Orders",
      listOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeStatusOrder = async (req, res) => {
  const { status } = req.body;
  const userId = req.user.userId;
  const orderId = req.params.id;

  try {
    const checkUser = await User.findOne({ _id: userId, role: "artist" });

    if (!checkUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findOrder = await Order.findById(orderId);

    if (!findOrder) {
      return res.status(400).json({ message: "Order Not Found" });
    }

    const artworkIds = findOrder.orderItems.map((item) => item.artworkId);

    // 4. Find artworks that belong to this artist
    const artworks = await Artwork.find({
      _id: { $in: artworkIds },
      artist_id: userId,
    });

    if (artworks.length === 0) {
      return res.status(403).json({
        message: "No artwork belonging to this artist was found in this order",
      });
    }

    findOrder.status = status;
    await findOrder.save();

    if (status === "delivered") {
      await Artwork.updateMany(
        {
          _id: { $in: artworks.map((artwork) => artwork._id) },
        },
        {
          $set: { status: "sold" },
        },
      );
    }

    res.status(200).json({ message: "Status Change Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomArtwork = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "artist" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const getcustomArtworks = await CustomArtwork.find({
      preferedArtist: userId,
    });

    res
      .status(200)
      .json({ message: "List of Custom Artwork", getcustomArtworks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptCustomArtwork = async (req, res) => {
  const { quote, startDate, messagetoBuyer } = req.body;
  const customArtworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const checkUser = await User.findOne({ _id: userId, role: "artist" });

    if (!checkUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findCustomArtworkId = await CustomArtwork.findById(customArtworkId);

    if (!findCustomArtworkId) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    findCustomArtworkId.status = "confirmed";

    await findCustomArtworkId.save();

    const newReview = new ReviewCustomArtwork({
      customArtworkId,
      quote,
      startDate,
      messagetoBuyer,
    });
    await newReview.save();
    res.status(200).json({ message: "Artwork Accepted" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const rejectCustomArtwork = async (req, res) => {
  const { quote, startDate, messagetoBuyer } = req.body;
  const customArtworkId = req.params.id;
  const userId = req.user.userId;
  try {
    const checkUser = await User.findOne({ _id: userId, role: "artist" });

    if (!checkUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findCustomArtworkId = await CustomArtwork.findById(customArtworkId);

    if (!findCustomArtworkId) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    findCustomArtworkId.status = "cancle";

    await findCustomArtworkId.save();

    const newReview = new ReviewCustomArtwork({
      customArtworkId,
      quote,
      startDate,
      messagetoBuyer,
    });
    await newReview.save();
    res.status(200).json({ message: "Artwork Rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeStatusCustomArtwork = async (req, res) => {
  const userId = req.user.userId;
  const customArtworkId = req.params.id;
  const { status } = req.body;

  try {
    const checkUser = await User.findOne({ _id: userId, role: "artist" });

    if (!checkUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findArtwork = await CustomArtwork.findById(customArtworkId);

    if (!findArtwork) {
      return res.status(400).json({ message: "Custom Artwork Not Found" });
    }

    findArtwork.status = status;
    await findArtwork.save();
    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArtistEarnings = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Validate artist ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid artist ID",
      });
    }

    const artistObjectId = new mongoose.Types.ObjectId(userId);

    // 2. Find all artworks belonging to this artist
    const artworks = await Artwork.find({
      artist_id: artistObjectId,
    }).select("_id title price category");

    console.log("Logged-in artist ID:", userId);
    console.log("Artist artworks:", artworks);
    console.log("Artist artwork count:", artworks.length);

    // Create artwork lookup map
    const artworkMap = new Map(
      artworks.map((artwork) => [String(artwork._id), artwork]),
    );

    // Fetch delivered orders containing this artist's artworks
    const artistArtworkIds = artworks.map((artwork) => artwork._id);

    console.log("Artist artwork IDs:", artistArtworkIds);

    const deliveredOrders = await Order.find({
      status: "delivered",
      "orderItems.artworkId": { $in: artistArtworkIds },
    }).lean();

    console.log("Delivered orders:", JSON.stringify(deliveredOrders, null, 2));
    console.log("Delivered orders count:", deliveredOrders.length);

    let totalSales = 0;
    let artworksSold = 0;

    const salesByArtwork = new Map();
    const categorySalesMap = new Map();

    const monthlySalesMap = new Map();
    const now = new Date();

    // Initialize the last six calendar months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      monthlySalesMap.set(key, {
        month: date.toLocaleString("en-IN", {
          month: "short",
        }),
        sales: 0,
      });
    }

    // Process delivered orders
    for (const order of deliveredOrders) {
      const orderDate = new Date(order.placed_at || order.createdAt);

      for (const item of order.orderItems || []) {
        const artworkId = String(item.artworkId);

        // Find artwork belonging to this artist
        const artwork = artworkMap.get(artworkId);

        if (!artwork) {
          continue;
        }

        // Use the saved order-item price if available.
        // Otherwise, use the artwork's current price.
        const price = Number(item.price ?? artwork.price ?? 0);

        totalSales += price;
        artworksSold += 1;

        // -------------------------------
        // 1. Sales by artwork
        // -------------------------------
        if (!salesByArtwork.has(artworkId)) {
          salesByArtwork.set(artworkId, {
            artworkId,
            title: artwork.title || "Untitled Artwork",
            category: artwork.category,
            price: 0,
            quantitySold: 0,
          });
        }

        const artworkSale = salesByArtwork.get(artworkId);

        artworkSale.price += price;
        artworkSale.quantitySold += 1;

        // -------------------------------
        // 2. Sales by category
        // -------------------------------
        const category = artwork.category || "uncategorized";

        if (!categorySalesMap.has(category)) {
          categorySalesMap.set(category, {
            category,
            totalSales: 0,
            artworksSold: 0,
          });
        }

        const categorySale = categorySalesMap.get(category);

        categorySale.totalSales += price;
        categorySale.artworksSold += 1;

        // -------------------------------
        // 3. Monthly sales
        // -------------------------------
        if (!Number.isNaN(orderDate.getTime())) {
          const monthKey = `${orderDate.getFullYear()}-${String(
            orderDate.getMonth() + 1,
          ).padStart(2, "0")}`;

          if (monthlySalesMap.has(monthKey)) {
            monthlySalesMap.get(monthKey).sales += price;
          }
        }
      }
    }

    // Convert category map into an array
    const categorySales = Array.from(categorySalesMap.values());

    // Top 5 performing artworks by total sales revenue
    const topPerformingArtworks = Array.from(salesByArtwork.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Return response
    return res.status(200).json({
      message: "Artist Earnings fetched successfully",
      totalSales,
      artworksSold,
      averageSaleValue:
        artworksSold > 0 ? Math.round(totalSales / artworksSold) : 0,

      soldArtworks: Array.from(salesByArtwork.values()),

      categorySales,

      topPerformingArtworks,

      monthlySales: Array.from(monthlySalesMap.values()),
    });
  } catch (error) {
    console.error("Artist Earnings error:", error);

    return res.status(500).json({
      message: "Failed to fetch artist earnings",
      error: error.message,
    });
  }
};

const artistOverview = async (req, res) => {
  try {
    // Get the logged-in artist's user ID.
    const artistId = req.user.userId;

    if (!artistId) {
      return res.status(401).json({
        message: "Unauthorized: artist ID not found",
      });
    }

    // 1. Get all artworks belonging to this artist.
    const artistArtworks = await Artwork.find({
      artist_id: artistId,
    })
      .select("_id status")
      .lean();

    const artworkIds = artistArtworks.map((artwork) => artwork._id);

    // 2. Count artwork statuses.
    const totalArtwork = artistArtworks.length;

    const publishedArtworks = artistArtworks.filter(
      (artwork) => artwork.status === "published",
    ).length;

    const draftArtworks = artistArtworks.filter(
      (artwork) => artwork.status === "draft",
    ).length;

    const soldArtworks = artistArtworks.filter(
      (artwork) => artwork.status === "sold",
    ).length;

    // 3. Find orders containing this artist's artworks.
    const artistOrderFilter = {
      "orderItems.artworkId": {
        $in: artworkIds,
      },
    };

    const [
      totalOrders,
      openOrders,
      deliveredOrders,
      openRequests,
      reviewStats,
    ] = await Promise.all([
      // All orders containing at least one of this artist's artworks.
      Order.countDocuments(artistOrderFilter),

      // Orders that have not been delivered or cancelled.
      Order.countDocuments({
        ...artistOrderFilter,
        status: {
          $nin: ["delivered", "cancle"],
        },
      }),

      // Successfully delivered orders.
      Order.countDocuments({
        ...artistOrderFilter,
        status: "delivered",
      }),

      // Custom artwork requests assigned to this artist
      // that have not been delivered or cancelled.
      CustomArtwork.countDocuments({
        preferedArtist: artistId,
        status: {
          $nin: ["delivered", "cancle"],
        },
      }),

      // Average rating and total review count for this artist's artworks.
      Review.aggregate([
        {
          $match: {
            artwork_id: {
              $in: artworkIds,
            },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: {
              $avg: "$rating",
            },
            totalReviews: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    // 4. Calculate average rating and total reviews.
    const averageRating = Number(
      (reviewStats[0]?.averageRating || 0).toFixed(2),
    );

    const totalReviews = reviewStats[0]?.totalReviews || 0;

    // 5. Calculate order success percentage.
    // Formula: delivered orders / all orders containing this artist's artwork.
    const orderSuccess =
      totalOrders > 0
        ? Number(((deliveredOrders / totalOrders) * 100).toFixed(2))
        : 0;

    // 6. Return artist dashboard data.
    return res.status(200).json({
      message: "Artist dashboard data fetched successfully",

      overview: {
        publishedArtworks,
        openOrders,
        openRequests,
        averageRating,
        totalReviews,
        orderSuccess,
      },

      artworkStats: {
        totalArtwork,
        published: publishedArtworks,
        draft: draftArtworks,
        sold: soldArtworks,
      },

      orderStats: {
        totalOrders,
        deliveredOrders,
        openOrders,
      },
    });
  } catch (error) {
    console.error("Artist Overview Error:", error);

    return res.status(500).json({
      message: "Failed to fetch artist dashboard data",
      error: error.message,
    });
  }
};

const updateArtistProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { name, specialty, location, phone, email, bio } = req.body;

    // Validate required fields presence
    if (
      !name ||
      !specialty ||
      !location ||
      !phone ||
      !email ||
      bio === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, specialty, location, phone, email, bio",
      });
    }

    // Validate non-empty strings
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof specialty !== "string" ||
      !specialty.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof bio !== "string"
    ) {
      return res.status(400).json({
        message: "Fields must be valid non-empty strings",
      });
    }

    // Validate email format
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate specialty against allowed schema enum
    const allowedSpecialties = [
      "painting",
      "sculpture",
      "digital art",
      "abstract art",
      "photography",
    ];
    if (!allowedSpecialties.includes(specialty.trim())) {
      return res.status(400).json({
        message: `Invalid specialty. Allowed values: ${allowedSpecialties.join(", ")}`,
      });
    }

    // Validate phone number format (supports standard international and domestic formats)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    // Fetch user and verify existence and role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status === "block") {
      return res.status(403).json({
        message: "Account is blocked",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        message: "Access forbidden. Only artists can update an artist profile.",
      });
    }

    // Check duplicate email if email is being changed
    if (cleanEmail !== user.email) {
      const existingEmailUser = await User.findOne({ email: cleanEmail });
      if (
        existingEmailUser &&
        existingEmailUser._id.toString() !== user._id.toString()
      ) {
        return res.status(409).json({
          message: "Email is already in use by another account",
        });
      }
    }

    // Update User model fields
    user.name = name.trim();
    user.email = cleanEmail;
    await user.save();

    // Find or create ArtistProfile document
    let artistProfile = await ArtistProfile.findOne({ user_id: user._id });

    if (!artistProfile) {
      artistProfile = new ArtistProfile({
        user_id: user._id,
        specialty: specialty.trim(),
        location: location.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        verified: false,
      });
    } else {
      artistProfile.specialty = specialty.trim();
      artistProfile.location = location.trim();
      artistProfile.phone = phone.trim();
      artistProfile.bio = bio.trim();
    }

    await artistProfile.save();

    return res.status(200).json({
      message: "Artist profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: {
        id: artistProfile._id,
        user_id: artistProfile.user_id,
        specialty: artistProfile.specialty,
        location: artistProfile.location,
        phone: artistProfile.phone,
        bio: artistProfile.bio,
        rating_avg: artistProfile.rating_avg,
        verified: artistProfile.verified,
      },
    });
  } catch (error) {
    console.error("Artist profile update error:", error);
    return res.status(500).json({
      message: "Failed to update artist profile",
      error: error.message,
    });
  }
};

const profileGet = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findUserProfile = await ArtistProfile.findOne({ user_id: userId });

    if (!findUserProfile) {
      return res.status(400).json({ message: "User Profile Not Found" });
    }

    const getProfile = await ArtistProfile.findOne({ user_id: userId });

    const getUser = await User.findById(userId).select(
      "name email role status _id",
    );

    res.status(200).json({ message: "User Profile", getProfile, getUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const messageReply = async (req, res) => {
  const { message } = req.body;
  const conversationId = req.params.id;
  const userId = req.user.userId;

  try {
    // 1. Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // 2. Find user
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    // 3. Find conversation
    const findConversation = await Message.findById(conversationId);

    if (!findConversation) {
      return res.status(404).json({
        message: "Conversation Not Found",
      });
    }

    // 4. Check whether user belongs to this conversation
    const isParticipant =
      findConversation.buyer_id.toString() === userId.toString() ||
      findConversation.artist_id.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this conversation",
      });
    }

    // 5. Store message in conversation array
    findConversation.conversation.push({
      message: message.trim(),
      messageTimeDate: new Date(),
      messageBy: userId,
    });

    // 6. Save conversation
    await findConversation.save();

    return res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
      conversation: findConversation.conversation,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findConver = await Message.find({ artist_id: userId })
      .select("buyer_id subject")
      .populate("buyer_id", "name");

    res.status(200).json({ message: "List of Conversation", findConver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversationId = async (req, res) => {
  const convoId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findConver = await Message.findById(convoId)
      .select("buyer_id subject conversation")
      .populate("buyer_id", "name");
    res.status(200).json({ findConver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOffer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { offer_price, ends_on, note } = req.body;
    const artwork_id = req.params.id;

    // 1. Verify artist
    const artist = await User.findOne({
      _id: userId,
      role: "artist",
    });

    if (!artist) {
      return res.status(403).json({
        success: false,
        message: "Only artists can create offers",
      });
    }

    // 2. Validate required fields
    if (!artwork_id || offer_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Artwork ID and offer price are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(artwork_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid artwork ID",
      });
    }

    // 3. Find artwork
    const artwork = await Artwork.findById(artwork_id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found",
      });
    }

    // 4. Verify ownership
    if (artwork.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can create offers only on your own artworks",
      });
    }

    // 5. Check artwork status
    if (artwork.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Offers can only be created for published artworks",
      });
    }

    // 6. Check existing active offer
    const existingOffer = await Offer.findOne({
      artwork_id,
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "An active offer already exists for this artwork",
      });
    }

    // 7. Validate offer price
    const numericOfferPrice = Number(offer_price);

    if (
      !Number.isFinite(numericOfferPrice) ||
      numericOfferPrice <= 0 ||
      numericOfferPrice >= artwork.price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Offer price must be greater than zero and less than original price",
      });
    }

    // 8. Calculate discount
    const discount_pct = Number(
      (((artwork.price - numericOfferPrice) / artwork.price) * 100).toFixed(2),
    );

    // 9. Validate expiry date
    let endDate = null;

    if (ends_on) {
      endDate = new Date(ends_on);

      if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid future end date",
        });
      }
    }

    // 10. Create offer
    const newOffer = await Offer.create({
      artwork_id,
      offer_price: numericOfferPrice,
      original_price: artwork.price,
      discount_pct,
      ends_on: endDate,
      note: note || "",
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Create Offer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE OFFER
const updateOffer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const offerId = req.params.id;
    const { offer_price, ends_on, note } = req.body;

    // 1. Verify artist
    const artist = await User.findOne({
      _id: userId,
      role: "artist",
    });

    if (!artist) {
      return res.status(403).json({
        success: false,
        message: "Only artists can update offers",
      });
    }

    // 2. Validate offer ID
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID",
      });
    }

    // 3. Find offer
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // 4. Find artwork
    const artwork = await Artwork.findById(offer.artwork_id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found",
      });
    }

    // 5. Verify ownership
    if (artwork.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own offers",
      });
    }

    // 6. Update offer price
    if (offer_price !== undefined) {
      const numericOfferPrice = Number(offer_price);

      if (
        !Number.isFinite(numericOfferPrice) ||
        numericOfferPrice <= 0 ||
        numericOfferPrice >= offer.original_price
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Offer price must be greater than zero and less than original price",
        });
      }

      offer.offer_price = numericOfferPrice;

      offer.discount_pct = Number(
        (
          ((offer.original_price - numericOfferPrice) / offer.original_price) *
          100
        ).toFixed(2),
      );
    }

    // 7. Update expiry date
    if (ends_on !== undefined) {
      if (ends_on === null || ends_on === "") {
        offer.ends_on = null;
      } else {
        const endDate = new Date(ends_on);

        if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid future end date",
          });
        }

        offer.ends_on = endDate;
      }
    }

    // 8. Update note
    if (note !== undefined) {
      if (typeof note !== "string") {
        return res.status(400).json({
          success: false,
          message: "Note must be a string",
        });
      }

      offer.note = note.trim();
    }

    // 9. Save offer
    await offer.save();

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Update Offer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE OFFER
const deleteOffer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const offerId = req.params.id;

    // 1. Verify artist
    const artist = await User.findOne({
      _id: userId,
      role: "artist",
    });

    if (!artist) {
      return res.status(403).json({
        success: false,
        message: "Only artists can delete offers",
      });
    }

    // 2. Validate offer ID
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID",
      });
    }

    // 3. Find offer
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // 4. Find artwork
    const artwork = await Artwork.findById(offer.artwork_id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found",
      });
    }

    // 5. Verify ownership
    if (artwork.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own offers",
      });
    }

    const offerDelete = await Offer.findByIdAndDelete(offerId);

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Offer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  create_artwork,
  getArtwork,
  update_artwork,
  deleteArtwork,
  getOrders,
  changeStatusOrder,
  getCustomArtwork,
  acceptCustomArtwork,
  rejectCustomArtwork,
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
};
