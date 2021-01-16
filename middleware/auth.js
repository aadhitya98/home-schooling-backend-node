const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token)
        return res.status(401).json({
            message: `Authentication Error ${token}`,
        });

    try {
        const decode = jwt.verify(token, "bearer");
        req.user = decode.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Invalid Token" });
    }
};