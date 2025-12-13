const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const user = req.userInfo;
    if (user && user.role === 'admin'){
        next();
    } else {
        return res.status(403).json({
            message: "Access denied. Only admin can access this page."
        })
    }
}

module.exports = adminMiddleware;