const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const bearer = req.headers["authorization"];
    token = bearer && bearer.split(" ")[1];
    if (!token){
        return res.status(401).json({
            message: "Access denied. No token provided. Login to get access."
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.userInfo = decoded;
        console.log(decoded);

        next();
    } catch (err){
        return res.status(403).json({
            message: "Invalid token. Access denied."
        })
    }
}

module.exports = authMiddleware;