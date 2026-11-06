const { OAuth2Client } = require("google-auth-library");

const verifyGoogleToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("A valid Google ID token is required");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is missing from backend environment");
  }

  // Initialize using the current environment value.
  const googleClient = new OAuth2Client(clientId);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Google token payload is incomplete");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0],
  };
};

module.exports = { verifyGoogleToken };
