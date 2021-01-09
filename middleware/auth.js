const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.header("token");
  if (!token) 
  return res.status(401).json(
      { 
        message: "Authentication Error" 
      }
  );

  try {
    const decode = jwt.verify(token, "bearer");
    req.user = decode.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};