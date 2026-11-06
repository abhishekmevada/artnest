const mongoose = require("mongoose");
const {
  Order,
  User,
  CustomArtwork,
  ReviewCustomArtwork,
  Artwork,
  WishlistItem,
  CartItem,
  Message,
} = require("../../db/db");
const {
  validateEmail,
  validateName,
  validatePhoneNumber,
} = require("../validators/auth.validator");
const cloudinary = require("../config/cloudinary");

async function generateOrderId() {
  let orderId;
  let exists = true;

  while (exists) {
    orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const existingOrder = await Order.findOne({
      orderId,
    });

    exists = !!existingOrder;
  }

  return orderId;
}

async function generateCustomArtworkId() {
  let customArtworkId;
  let exists = true;

  while (exists) {
    customArtworkId = `CR-${Math.floor(100000 + Math.random() * 900000)}`;

    const existingCustomArtwork = await CustomArtwork.findOne({
      customArtworkId,
    });

    exists = !!existingCustomArtwork;
  }

  return customArtworkId;
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

const cutomArtworkCreate = async (req, res) => {
  const {
    name,
    email,
    phonenumber,
    preferedArtist,
    typeofArtwork,
    size,
    style,
    budge,
    neededDate,
    description,
    note,
  } = req.body;

  const userId = req.user.userId;

  const uploadedImages = [];

  try {
    // 1. Validate buyer
    const findUser = await User.findOne({
      _id: userId,
      role: "buyer",
    });

    if (!findUser) {
      return res.status(400).json({
        message: "Buyer not found",
      });
    }

    // 2. Validate email
    const checkEmail = validateEmail(email);

    if (checkEmail) {
      return res.status(400).json({
        message: checkEmail,
      });
    }

    // 3. Validate image count
    const files = req.files || [];

    if (files.length > 4) {
      return res.status(400).json({
        message: "You can upload a maximum of 4 sample images",
      });
    }

    // 4. Generate custom artwork ID
    const customArtworkId = await generateCustomArtworkId();

    // 5. Upload images to Cloudinary
    for (const file of files) {
      const image = await uploadToCloudinary(file.buffer);
      uploadedImages.push(image);
    }

    // Resolve preferred artist
    let resolvedArtistId = preferedArtist;
    const isValidId = resolvedArtistId && mongoose.Types.ObjectId.isValid(resolvedArtistId);

    if (!isValidId || resolvedArtistId === "Any artist") {
      let artistQuery = { role: "artist" };
      if (preferedArtist && preferedArtist !== "Any artist") {
        artistQuery.name = new RegExp(`^${preferedArtist.trim()}$`, "i");
      }
      let foundArtist = await User.findOne(artistQuery);
      if (!foundArtist && preferedArtist && preferedArtist !== "Any artist") {
        foundArtist = await User.findOne({ role: "artist" });
      }
      if (foundArtist) {
        resolvedArtistId = foundArtist._id;
      }
    }

    const parsedPhone = phonenumber
      ? Number(String(phonenumber).replace(/\D/g, "")) || 0
      : 0;
    const finalNote = note?.trim() || "No additional notes";
    const finalSize = size || "Not sure yet";
    const finalStyle = style || "Not sure yet";
    const finalBudget = budge || "Flexible";
    const finalNeededDate = neededDate
      ? new Date(neededDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 6. Create custom artwork
    const newCustomArtwork = new CustomArtwork({
      buyerId: userId,
      customArtworkId,
      name,
      email,
      phonenumber: parsedPhone,
      preferedArtist: resolvedArtistId,
      typeofArtwork,
      size: finalSize,
      style: finalStyle,
      budge: finalBudget,
      neededDate: finalNeededDate,
      description,
      note: finalNote,
      sample_images: uploadedImages,
    });

    // 7. Save to MongoDB
    await newCustomArtwork.save();

    return res.status(201).json({
      message: "Custom artwork created successfully",
      data: newCustomArtwork,
    });
  } catch (error) {
    // Remove images uploaded before a later upload or database operation failed.
    await Promise.allSettled(
      uploadedImages.map((image) =>
        require("../config/cloudinary").uploader.destroy(image.publicId),
      ),
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

const addItemtoWislist = async (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findArtwork = await Artwork.findById(artworkId);

    if (!findArtwork) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    const checkWishlist = await WishlistItem.findOne({
      artwork_id: artworkId,
      user_id: userId,
    });

    if (checkWishlist) {
      return res.status(400).json({ message: "Artwork Already In Wishlist" });
    }

    const newItem = await WishlistItem({
      user_id: userId,
      artwork_id: artworkId,

    });

    await newItem.save();
    res.status(200).json({ message: "Artwork Added To Wishlist", item: newItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const wishlistArtwork = await WishlistItem.find({
      user_id: userId,
    }).populate({
      path: "artwork_id",
      populate: {
        path: "artist_id",
        select: "name",
      },
    });

    res
      .status(200)
      .json({ message: "List of Wishlist Artwork", wishlistArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeItemtoWishlist = async (req, res) => {
  const wishlistId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    let findWishlist = await WishlistItem.findById(wishlistId).catch(() => null);
    if (!findWishlist) {
      findWishlist = await WishlistItem.findOne({ artwork_id: wishlistId, user_id: userId });
    }

    if (!findWishlist) {
      return res.status(400).json({ message: "Artwork Not Found In Wishlist" });
    }

    const removeWishlist = await WishlistItem.findByIdAndDelete(findWishlist._id);

    res.status(200).json({ message: "Artwork Remove From Wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItemtoCart = async (req, res) => {
  const artworkId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    let findArtwork = null;
    if (mongoose.Types.ObjectId.isValid(artworkId)) {
      findArtwork = await Artwork.findById(artworkId);
    }
    if (!findArtwork) {
      findArtwork = await Artwork.findOne({ artworkId: artworkId });
    }

    if (!findArtwork) {
      return res.status(400).json({ message: "Artwork Not Found" });
    }

    const checkCart = await CartItem.findOne({
      artwork_id: findArtwork._id,
      user_id: userId,
    });

    if (checkCart) {
      return res.status(400).json({ message: "Artwork Already in Cart" });
    }

    const addtoCart = new CartItem({
      user_id: userId,
      artwork_id: findArtwork._id,
    });
    await addtoCart.save();
    res.status(200).json({ message: "Artwork Added To Cart", item: addtoCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const cartItems = await CartItem.find({
      user_id: userId,
    }).populate({
      path: "artwork_id",
      populate: {
        path: "artist_id",
        select: "name",
      },
    });

    res.status(200).json({ message: "List of Cart Items", cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeItemtoCart = async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    let findCart = null;
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      findCart = await CartItem.findById(targetId);
    }
    if (!findCart) {
      findCart = await CartItem.findOne({
        artwork_id: targetId,
        user_id: userId,
      });
    }

    if (!findCart) {
      const findArtwork = await Artwork.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(targetId) ? [{ _id: targetId }] : []),
          { artworkId: targetId },
        ],
      });
      if (findArtwork) {
        findCart = await CartItem.findOne({
          artwork_id: findArtwork._id,
          user_id: userId,
        });
      }
    }

    if (!findCart) {
      return res.status(400).json({ message: "Artwork Not Found in Cart" });
    }

    await CartItem.findByIdAndDelete(findCart._id);

    res.status(200).json({ message: "Artwork Remove from Cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeallItemCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    await CartItem.deleteMany({ user_id: userId });

    res.status(200).json({ message: "Artwork Remove from Cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOder = async (req, res) => {
  try {
    const {
      email,
      phonenumber,
      name,
      address,
      city,
      state,
      pincode,
      country,
      deliverymode,
      subtotal,
      shipping_fee,
      tax,
      total,
      orderItems,
      paymentMethod,
      upiId,
      cardName,
      cardLast4,
      bankingName,
    } = req.body;

    const buyerId = req.user.userId;

    // 1. Verify buyer
    const checkBuyerId = await User.findOne({
      _id: buyerId,
      role: "buyer",
    });

    if (!checkBuyerId) {
      return res.status(400).json({
        message: "Buyer Not Found",
      });
    }

    // 2. Validate payment method
    const allowedMethods = ["upi", "card", "net banking"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // 3. Validate payment details
    if (paymentMethod === "upi" && !upiId) {
      return res.status(400).json({
        message: "UPI ID is required",
      });
    }

    if (paymentMethod === "card" && !cardName) {
      return res.status(400).json({
        message: "Cardholder name is required",
      });
    }

    if (paymentMethod === "net banking" && !bankingName) {
      return res.status(400).json({
        message: "Bank name is required",
      });
    }

    // 4. Validate email
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({
        message: emailError,
      });
    }

    // 5. Validate phone
    const phonenumberError = validatePhoneNumber(phonenumber);

    if (phonenumberError) {
      return res.status(400).json({
        message: phonenumberError,
      });
    }

    // 6. Validate PIN
    if (!/^\d{6}$/.test(String(pincode ?? ""))) {
      return res.status(400).json({
        message: "Enter a valid 6-digit PIN code",
      });
    }

    // 7. Validate order items
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one artwork",
      });
    }

    const formattedOrderItems = orderItems.map((item) => ({
      artworkId: item.artworkId,
    }));

    // 8. Generate order ID
    const orderId = await generateOrderId();

    // 9. Prepare payment
    const paymentDetails = {
      paymentMethod,

      upiId: paymentMethod === "upi" ? upiId : null,

      cardName: paymentMethod === "card" ? cardName : null,

      cardLast4:
        paymentMethod === "card" && /^\d{4}$/.test(String(cardLast4))
          ? String(cardLast4)
          : null,

      bankingName: paymentMethod === "net banking" ? bankingName : null,
    };

    // 10. Create order
    const newOrder = new Order({
      orderId,
      buyerId,
      email,
      phonenumber,
      name,
      address,
      city,
      state,
      pincode,
      country,
      deliverymode,
      subtotal,
      shipping_fee,
      tax,
      total,
      orderItems: formattedOrderItems,
      payment: [paymentDetails],
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Order Created Successfully",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const findOrders = await Order.find({ buyerId: userId })
      .populate("buyerId", "name")
      .populate({
        path: "orderItems.artworkId",
        select: "title artist_id image price dimensions medium",
        populate: {
          path: "artist_id",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    if (!findOrders) {
      return res.status(400).json({ message: "Order Not Found" });
    }

    res.status(200).json({ message: "List Of Orders", findOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomRequests = async (req, res) => {
  const userId = req.user.userId;

  try {
    const findUser = await User.findOne({ _id: userId, role: "buyer" });

    if (!findUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const customArtworks = await CustomArtwork.find({ buyerId: userId })
      .populate({
        path: "preferedArtist",
        select: "name email",
      })
      .sort({ _id: -1 });

    const artworkIds = customArtworks.map((item) => item._id);
    const reviews = await ReviewCustomArtwork.find({
      customArtworkId: { $in: artworkIds },
    }).sort({ _id: -1 });

    const reviewsMap = {};
    for (const rev of reviews) {
      const idKey = rev.customArtworkId.toString();
      if (!reviewsMap[idKey]) {
        reviewsMap[idKey] = rev;
      }
    }

    const result = customArtworks.map((item) => {
      const rev = reviewsMap[item._id.toString()];
      return {
        ...item.toObject(),
        quote: rev?.quote ?? (Number(item.budge) || null),
        startDate: rev?.startDate ?? null,
        artistNote: rev?.messagetoBuyer ?? "",
      };
    });

    res.status(200).json({
      message: "List of Custom Requests",
      customRequests: result,
      getcustomArtworks: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMessage = async (req, res) => {
  const { subject, artist_id } = req.body;
  const buyer_id = req.user.userId;

  try {
    let findArtist = null;
    if (artist_id && mongoose.Types.ObjectId.isValid(artist_id)) {
      findArtist = await User.findOne({ _id: artist_id, role: "artist" });
    }
    if (!findArtist && artist_id) {
      findArtist = await User.findOne({
        name: new RegExp(`^${artist_id.trim()}$`, "i"),
        role: "artist",
      });
    }
    if (!findArtist) {
      findArtist = await User.findOne({ role: "artist" });
    }

    if (!findArtist) {
      return res.status(400).json({ message: "Artist Not Found" });
    }

    const findBuyer = await User.findOne({ _id: buyer_id, role: "buyer" });

    if (!findBuyer) {
      return res.status(400).json({ message: "Buyer Not Found" });
    }

    let existingConversation = await Message.findOne({
      buyer_id,
      artist_id: findArtist._id,
    })
      .populate("artist_id", "name email")
      .populate("buyer_id", "name email");

    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists",
        conversation: existingConversation,
      });
    }

    const newConversation = new Message({
      buyer_id,
      artist_id: findArtist._id,
      subject: subject || "General Inquiry",
      conversation: [],
    });
    await newConversation.save();
    await newConversation.populate("artist_id", "name email");

    res.status(201).json({
      message: "Conversation Created",
      conversation: newConversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const conversationMessage = async (req, res) => {
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

    const findConver = await Message.find({ buyer_id: userId })
      .select("artist_id buyer_id subject conversation updatedAt createdAt")
      .populate("artist_id", "name email")
      .sort({ updatedAt: -1, _id: -1 });

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
      .select("artist_id buyer_id subject conversation updatedAt createdAt")
      .populate("artist_id", "name email");

    if (!findConver) {
      return res.status(404).json({ message: "Conversation Not Found" });
    }

    res.status(200).json({ findConver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
