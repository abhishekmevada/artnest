const jsonwebtoken = require("jsonwebtoken");

const autiMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  console.log("HEADER:", header);

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.split(" ")[1];

  console.log("TOKEN:", token);

  try {
    const decoded = jsonwebtoken.verify(token, process.env.jwt);

    console.log("DECODED:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = autiMiddleware;
