const express = require("express");
const cors = require("cors");
const AuthRouter = require("./routes/auth.route");
const ArtworkRouter = require("./routes/artist.route");
const AdminRouter = require("./routes/admin.route");
const BuyerRouter = require("./routes/buyer.route");
const ReviewRouter = require("./routes/review.route");
const GuestRouter = require("./routes/guest.route");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", AuthRouter);
app.use("/artwork", ArtworkRouter);
app.use("/admin", AdminRouter);
app.use("/buyer", BuyerRouter);
app.use("/reviews", ReviewRouter);
app.use("/guest", GuestRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Working" });
});

module.exports = app;
