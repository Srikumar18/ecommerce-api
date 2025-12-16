const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const RefreshToken = require('../../models/refreshToken');
const { validateEmail, validatePassword } = require('../../services/userservice');
const { generateAccessToken, generateRefreshToken, rotateRefreshToken,
  revokeRefreshToken } = require('../../services/tokenService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // set true in prod (HTTPS)
  sameSite: 'Strict',
  // maxAge set per refresh token creation below when sending cookie
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({email: email});
        if (!user){
            return  res.status(400).json({
                message: "Invalid email. Do you want to register?"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({
                message: "Incorrect password. Please try again."
            });
        }

        const payload = { email: user.email, id: user._id, role: user.role };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '15m'});
        const refreshToken = await generateRefreshToken(user._id);

        // send refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, 
            maxAge: 1000 * 60 * 60 * 24 * process.env.REFRESH_TOKEN_DAYS
        });

        res.status(200).json({
            message: "Login successful",
            accessToken
        })
    } catch (err) {
        console.error("Error during user login", err);
        res.status(500).json({
            message: "Some error occurred!! Please try again later."
        })
    }
}

const register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try{
        if (!validateEmail(email)){
            return res.status(400).json({
                message: "Invalid email format"
            })
        }
        if (!validatePassword(password)){
            return res.status(400).json({
                message: "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
            })
        }

        const emailExists = await User.findOne({email})
        if (emailExists){
            return res.status(400).json({
                message: "Email already registered. Try with a different email address."
            })
        }
        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, genSalt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();
        res.status(201).json({
            message: "Registration completed successfully"
        });
    } catch (err){
        console.error("Error during user registration", err);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

// refresh access token using refresh token from cookie or body
const refreshToken = async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incoming) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    const stored = await RefreshToken.findOne({ token: incoming });
    if (!stored || stored.revoked || stored.expiresAt < Date.now()) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // optional: rotate refresh token for better security
    const newRefresh = await rotateRefreshToken(incoming, stored.user);
    if (!newRefresh) {
      // should not usually happen
      return res.status(403).json({ message: "Unable to rotate refresh token" });
    }

    const user = await User.findById(stored.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const payload = { email: user.email, id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);

    res.cookie('refreshToken', newRefresh, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 * (process.env.REFRESH_TOKEN_DAYS || 7) });

    res.status(200).json({
      message: "Token refreshed",
      token: accessToken
    });
  } catch (err) {
    console.error("Error refreshing token", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (incoming) {
      await revokeRefreshToken(incoming);
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
    res.status(200).json({ message: "Logout successful on server and client (cookie cleared)" });
  } catch (err) {
    console.error("Error during logout", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const userId = req.userInfo.id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user){
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch){
      return res.status(400).json({
        message: "Incorrect old password. Please try again."
      })
    }

    if (!validatePassword(newPassword)){
      return res.status(400).json({
        message: "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
      })
    }

    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, genSalt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ 
      message: "Password reset successfully" 
    });
  } catch (err){
    console.error("Error during password reset", err);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
}

module.exports = { login, register, refreshToken, logout, resetPassword };