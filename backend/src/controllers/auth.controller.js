const {
  validateEmail,
  validateName,
  validatePassword,
  validateStudioName,
} = require("../validators/auth.validator");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const { User, ArtistProfile } = require("../../db/db");
const jsonwebtoken = require("jsonwebtoken");
const { verifyGoogleToken } = require("../services/googleAuthService");
const tokenService = require("../services/token.service");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const jwt = process.env.jwt;

const googleBuyer = async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({
        message: "A valid idToken is required",
      });
    }

    let googleUser;

    try {
      googleUser = await verifyGoogleToken(idToken);
    } catch (error) {
      // Inspect the actual verification failure in your backend terminal.
      console.error("Google token verification failed:", error.message);

      return res.status(401).json({
        message: "Google token verification failed",
      });
    }

    const { googleId, email, name } = googleUser;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    let isNewUser = false;

    if (user) {
      if (user.status === "block") {
        return res.status(403).json({
          message: "Your account is blocked",
        });
      }

      if (user.role !== "buyer") {
        return res.status(409).json({
          message: `This email is already registered with role: ${user.role}`,
        });
      }

      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          message: "This account is linked to a different Google account",
        });
      }

      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        await user.save();
      }
    } else {
      user = new User({
        name,
        email,
        googleId,
        authProvider: "google",
        role: "buyer",
        status: "active",
      });

      await user.save();
      isNewUser = true;
    }

    const authTokens = await tokenService.generateAuthTokens(user, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(isNewUser ? 201 : 200).json({
      message: isNewUser
        ? "Buyer registered successfully with Google"
        : "Google login successful",
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // This catches database, token-generation, and other unexpected failures.
    console.error("Google buyer controller failed:", error);

    return res.status(500).json({
      message: "Google signup/login failed due to a server error",
    });
  }
};

const registerBuyer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const nameError = validateName(name);
    if (nameError) {
      return res.status(400).json({ message: nameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate email in MongoDB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    // Hash passwords using bcryptjs
    const hashPassword = await bcrypt.hash(password, 10);

    // Save the user using the existing Mongoose User model with role BUYER
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashPassword,
      role: "buyer",
      authProvider: "local",
    });

    await newUser.save();

    return res.status(201).json({
      message: "Buyer registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during buyer registration",
      error: error.message,
    });
  }
};

const googleArtist = async (req, res) => {
  const { idToken } = req.body || {};

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({
      message: "A valid idToken is required",
    });
  }

  // Verify Google ID token
  let googleUser;

  try {
    googleUser = await verifyGoogleToken(idToken);
  } catch (error) {
    console.error("Google artist token verification failed:", error.message);

    return res.status(401).json({
      message: "Invalid or expired Google token",
      error: error.message,
    });
  }

  const { googleId, email, name } = googleUser;

  try {
    // Find an account using Google ID or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    // Existing account
    if (user) {
      // Reject blocked accounts
      if (
        ["block", "blocked", "blockend", "BLOCKED"].includes(
          String(user.status || "").toLowerCase(),
        )
      ) {
        return res.status(403).json({
          message: "Account is blocked",
        });
      }

      // Do not convert buyer/admin accounts into artist accounts
      const normalizedRole = String(user.role || "").toLowerCase();

      if (normalizedRole !== "artist") {
        return res.status(409).json({
          message: `This email already belongs to a ${normalizedRole || "different"} account. Please use the appropriate login page.`,
        });
      }

      // Prevent linking an account to a different Google identity
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          message: "This account is linked to a different Google account",
        });
      }

      // Link an existing artist account to Google if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        await user.save();
      }

      // Ensure the artist profile exists
      let artistProfile = await ArtistProfile.findOne({
        user_id: user._id,
      });

      if (!artistProfile) {
        artistProfile = new ArtistProfile({
          user_id: user._id,
          verified: false,
        });

        await artistProfile.save();
      }

      // Generate authentication tokens
      const authTokens = await tokenService.generateAuthTokens(user, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.status(200).json({
        message: "Artist Google login successful",
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }

    // Create a new artist account
    const newUser = new User({
      name,
      email,
      googleId,
      authProvider: "google",
      role: "artist",
      status: "active",
    });

    await newUser.save();

    // Create the associated artist profile
    const newArtistProfile = new ArtistProfile({
      user_id: newUser._id,
      verified: false,
    });

    await newArtistProfile.save();

    // Generate authentication tokens
    const authTokens = await tokenService.generateAuthTokens(newUser, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      message: "Artist registered successfully with Google",
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
      artistProfile: {
        id: newArtistProfile._id,
        user_id: newArtistProfile.user_id,
        verified: newArtistProfile.verified,
      },
    });
  } catch (error) {
    console.error("Google artist authentication failed:", error);

    return res.status(500).json({
      message: "Server error during Google artist authentication",
    });
  }
};

const signupArtist = async (req, res) => {
  const { name, email, password, specialty } = req.body;

  try {
    // 1. Validate name
    const nameError = validateName(name);

    if (nameError) {
      return res.status(400).json({ message: nameError });
    }

    // 2. Validate email
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    // 3. Validate password
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // 5. Validate specialties
    const allowedSpecialties = [
      "painting",
      "sculpture",
      "digital art",
      "abstract art",
      "photography",
    ];

    if (!Array.isArray(specialty) || specialty.length === 0) {
      return res.status(400).json({
        message: "Please select at least one specialty",
      });
    }

    const invalidSpecialties = specialty.filter(
      (item) => !allowedSpecialties.includes(item),
    );

    if (invalidSpecialties.length > 0) {
      return res.status(400).json({
        message: "Invalid specialty selected",
        invalidSpecialties,
      });
    }

    // 6. Clean email
    const cleanEmail = email.trim().toLowerCase();

    // 7. Check existing user
    const existUser = await User.findOne({
      email: cleanEmail,
    });

    if (existUser) {
      return res.status(400).json({
        message: "User Already Exist",
      });
    }

    // 8. Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // 9. Create user
    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashPassword,
      role: "artist",
    });

    await newUser.save();

    // 10. Create artist profile
    const newArtistProfile = new ArtistProfile({
      user_id: newUser._id,
      specialty: [...new Set(specialty)],
    });

    await newArtistProfile.save();

    return res.status(201).json({
      message: "Artist Created Successfully",
      user_id: newUser._id,
      artistProfile: newArtistProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const signupAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const nameError = validateName(name);

    if (nameError) {
      return res.status(400).json({ message: nameError });
    }

    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwrodError = validatePassword(password);

    if (passwrodError) {
      return res.status(400).json({ message: passwrodError });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ message: "User Already Exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role: "admin",
    });

    await newUser.save();

    res.status(200).json({ message: "User Created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwrodError = validatePassword(password);

    if (passwrodError) {
      return res.status(400).json({ message: passwrodError });
    }

    const existEmail = await User.findOne({ email });

    if (!existEmail) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const decryptPassword = await bcrypt.compare(password, existEmail.password);

    if (!decryptPassword) {
      return res.status(400).json({ message: "Incorrect Email and Password" });
    }

    const token = jsonwebtoken.sign({ userId: existEmail._id }, jwt, {
      expiresIn: "2d",
    });

    res.status(200).json({
      message: "Login Successfully",
      token,
      user: {
        userId: existEmail._id,
        name: existEmail.name,
        email: existEmail.email,
        role: existEmail.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Do not reveal whether an email address is registered. Return a generic success response.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // 1. Generate a secure random password reset token
    const rawResetToken = crypto.randomBytes(32).toString("hex");

    // 2. Store the hashed reset token and expiration time
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(rawResetToken)
      .digest("hex");

    // Token expires in 15 minutes
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = tokenExpires;
    await user.save();

    // 3. Send password reset email using Nodemailer
    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/+$/, "");
    const resetLink = `${frontendUrl}/reset-password/${rawResetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS.replace(/\s+/g, ""),
            }
          : undefined,
    });

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER ||
        "no-reply@artnest.com",
      to: user.email,
      subject: "ArtNest - Password Reset Request",
      text: `Hello ${user.name},\n\nYou requested a password reset for your ArtNest account. Please use the following link to reset your password. This link will expire in 15 minutes:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nArtNest Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>ArtNest Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your ArtNest account. Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p>Or copy and paste this URL into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <br />
          <p>Best regards,<br />ArtNest Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      // Clear token and expiry if email sending fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during forgot password request",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body || {};

    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Hash received token using SHA-256 for secure database lookup
    const hashedToken = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    // 4. Verify reset token and update user password using bcrypt
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Password has been successfully reset",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

module.exports = {
  signupArtist,
  login,
  signupAdmin,
  registerBuyer,
  googleBuyer,
  googleArtist,
  logout,
  forgotPassword,
  resetPassword,
};
