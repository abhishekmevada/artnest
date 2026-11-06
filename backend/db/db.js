const mongoose = require("mongoose");
const { Schema } = mongoose;

const mongooseConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log(error.message);
  }
};

mongooseConnect();

const objectId = mongoose.Schema.Types.ObjectId;

// 1. USERS
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    role: {
      type: String,
      enum: ["buyer", "artist", "admin"],
      required: true,
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "block"],
      default: "active",
      required: true,
    },
    googleId: {
      type: String,
      trim: true,
      default: undefined,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true, collection: "users" },
);

// 2. ARTIST PROFILES
const artistProfileSchema = new Schema(
  {
    user_id: {
      type: objectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: {
      type: [String],
      enum: [
        "painting",
        "sculpture",
        "digital art",
        "abstract art",
        "photography",
      ],
      default: [],
    },
    location: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    bio: { type: String, default: null },
  },
  { timestamps: true, collection: "artist_profiles" },
);

// 4. ARTWORKS
const artworkSchema = new Schema(
  {
    artist_id: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    artworkId: { type: String, required: true },
    image: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "paintings",
        "sculptures",
        "ceramics",
        "photography",
        "digital",
        "textile",
        "printmaking",
      ],
    },
    description: { type: String, default: "" },
    medium: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    location: { type: String, default: "" },
    tag: { type: String, trim: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "sold"],
      default: "draft",
      required: true,
    },
    // moderation_status: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"],
    //   default: "pending",
    //   required: true,
    // },
  },
  { timestamps: true, collection: "artworks" },
);

const customArtworkSchema = new Schema({
  buyerId: { type: objectId, ref: "User", required: true },
  customArtworkId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phonenumber: { type: Number, default: 0 },
  preferedArtist: { type: objectId, ref: "User", default: null },
  typeofArtwork: { type: String, required: true },
  size: { type: String, default: "Not sure yet" },
  style: { type: String, default: "Not sure yet" },
  budge: { type: String, required: true },
  neededDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  description: { type: String, required: true },
  note: { type: String, default: "" },
  status: {
    type: String,
    enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancle"],
    default: "placed",
    required: true,
  },
  sample_images: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
  ],
});

const CustomArtwork = mongoose.model("customArtwork", customArtworkSchema);

const reviewCustomArtworSchema = new Schema({
  customArtworkId: { type: objectId, ref: "customArtwork", required: true },
  quote: { type: Number, required: true },
  startDate: { type: Date, required: true },
  messagetoBuyer: { type: String, default: null },
});

const ReviewCustomArtwork = mongoose.model(
  "reviewCustomArtwor",
  reviewCustomArtworSchema,
);

// 6. OFFERS
const offerSchema = new Schema(
  {
    artwork_id: {
      type: objectId,
      ref: "Artwork",
      required: true,
      index: true,
    },
    offer_price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    discount_pct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ends_on: { type: Date, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: true, collection: "offers" },
);

// 7. COLLECTIONS
const collectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    theme: { type: String, default: "" },
    cover_image: { type: String, default: null },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
  },
  { timestamps: true, collection: "collections" },
);

// 8. COLLECTION ARTWORKS
const collectionArtworkSchema = new Schema(
  {
    collection_id: {
      type: objectId,
      ref: "Collection",
      required: true,
    },
    artwork_id: {
      type: objectId,
      ref: "Artwork",
      required: true,
    },
  },
  { timestamps: true, collection: "collection_artworks" },
);

collectionArtworkSchema.index(
  { collection_id: 1, artwork_id: 1 },
  { unique: true },
);

// 9. WISHLIST ITEMS
const wishlistItemSchema = new Schema(
  {
    user_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    artwork_id: {
      type: objectId,
      ref: "Artwork",
      required: true,
    },
  },
  { timestamps: true, collection: "wishlist_items" },
);

wishlistItemSchema.index({ user_id: 1, artwork_id: 1 }, { unique: true });

// 10. CART ITEMS
// One row per user and artwork. No quantity field.
const cartItemSchema = new Schema(
  {
    user_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    artwork_id: {
      type: objectId,
      ref: "Artwork",
      required: true,
    },
  },
  { timestamps: true, collection: "cart_items" },
);

cartItemSchema.index({ user_id: 1, artwork_id: 1 }, { unique: true });

// 11. FOLLOWS
const followSchema = new Schema(
  {
    user_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    artist_id: {
      type: objectId,
      ref: "ArtistProfile",
      required: true,
    },
  },
  { timestamps: true, collection: "follows" },
);

followSchema.index({ user_id: 1, artist_id: 1 }, { unique: true });

// 13. ORDERS
const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    buyerId: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: { type: String, required: true },
    phonenumber: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    country: { type: String, required: true },
    deliverymode: {
      type: String,
      enum: ["standard", "express"],
      required: true,
      default: "standard",
    },
    payment: [
      {
        paymentMethod: {
          type: String,
          enum: ["upi", "card", "net banking"],
          required: true,
        },
        transactionId: {
          type: String,
          default: null,
        },
        paymentGateway: {
          type: String,
          default: "razorpay",
        },
        upiId: {
          type: String,
          default: null,
        },
        cardName: {
          type: String,
          default: null,
        },
        cardLast4: {
          type: String,
          default: null,
        },
        bankingName: {
          type: String,
          default: null,
        },
        paidAt: {
          type: Date,
          default: null,
        },
      },
    ],
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
    },
    placed_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    subtotal: { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancle"],
      default: "placed",
      required: true,
    },
    orderItems: [
      {
        artworkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Artwork",
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collection: "orders" },
);

// 18. REVIEWS
const reviewSchema = new Schema(
  {
    artwork_id: {
      type: objectId,
      ref: "Artwork",
      required: true,
      index: true,
    },
    buyer_id: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: { type: String, default: "" },
  },
  { timestamps: true, collection: "reviews" },
);

// 19. REVIEW REPLIES
const reviewReplySchema = new Schema(
  {
    review_id: {
      type: objectId,
      ref: "Review",
      required: true,
      unique: true,
    },
    artist_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, collection: "review_replies" },
);

// 21. MESSAGES
const messageSchema = new Schema(
  {
    buyer_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    artist_id: {
      type: objectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    conversation: [
      {
        message: {
          type: String,
          default: null,
          trim: true,
        },
        messageTimeDate: { type: Date, default: Date.now },
        messageBy: {
          type: objectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collection: "messages" },
);

messageSchema.index({ conversation_id: 1, createdAt: 1 });

// 22. COMMISSION REQUESTS
const commissionRequestSchema = new Schema(
  {
    buyer_id: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    artist_id: {
      type: objectId,
      ref: "ArtistProfile",
      default: null,
      index: true,
    },
    type: { type: String, required: true, trim: true },
    size: { type: String, default: "" },
    style: { type: String, default: "" },
    budget: { type: Number, required: true },
    deadline: { type: Date, default: null },
    description: { type: String, required: true },
    notes: { type: String, default: "" },
    reference_urls: [{ type: String }],
    status: {
      type: String,
      enum: [
        "NEW",
        "REVIEWING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "DECLINED",
        "REJECTED",
      ],
      default: "NEW",
      required: true,
    },
    quote: { type: Number, default: null },
    eta: { type: Date, default: null },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true, collection: "commission_requests" },
);

// 23. CONTACT MESSAGES
const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    topic: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["NEW", "READ", "REPLIED", "CLOSED"],
      default: "NEW",
      required: true,
    },
  },
  { timestamps: true, collection: "contact_messages" },
);

// 24. NEWSLETTER SUBSCRIBERS
const newsletterSubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribed_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false, collection: "newsletter_subscribers" },
);

// 27. NOTIFICATIONS
const notificationSchema = new Schema(
  {
    user_id: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, collection: "notifications" },
);

notificationSchema.index({
  user_id: 1,
  read: 1,
  createdAt: -1,
});
const refreshTokenSchema = new Schema(
  {
    userId: {
      type: objectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    family: {
      type: String,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    createdByIp: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, collection: "refresh_tokens" },
);

refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

// CREATE MODELS

const User = mongoose.model("User", userSchema);
const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
const Artwork = mongoose.model("Artwork", artworkSchema);
const Offer = mongoose.model("Offer", offerSchema);
const Collection = mongoose.model("Collection", collectionSchema);
const CollectionArtwork = mongoose.model(
  "CollectionArtwork",
  collectionArtworkSchema,
);
const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);
const CartItem = mongoose.model("CartItem", cartItemSchema);
const Follow = mongoose.model("Follow", followSchema);
const Order = mongoose.model("Order", orderSchema);
const Review = mongoose.model("Review", reviewSchema);
const ReviewReply = mongoose.model("ReviewReply", reviewReplySchema);
const Message = mongoose.model("Message", messageSchema);
const CommissionRequest = mongoose.model(
  "CommissionRequest",
  commissionRequestSchema,
);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema,
);
const Notification = mongoose.model("Notification", notificationSchema);

// EXPORT ALL 27 MODELS

module.exports = {
  User,
  ArtistProfile,
  Artwork,
  Offer,
  Collection,
  CollectionArtwork,
  WishlistItem,
  CartItem,
  Follow,
  Order,
  Review,
  ReviewReply,
  Message,
  CommissionRequest,
  ContactMessage,
  NewsletterSubscriber,
  Notification,
  RefreshToken,
  CustomArtwork,
  ReviewCustomArtwork,
};
