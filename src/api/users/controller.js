const User = require('../../models/user');
const { revokeRefreshToken } = require('../../services/tokenService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  // maxAge set per refresh token creation below when sending cookie
};

const findUser = async (req, res) => {
    try{
        const userId = req.userInfo.id
        if (userId != req.params.id){
            return res.status(403).json({
                message: "Forbidden: You can only access your own user details"
            })
        }
        const user = await User.findById(userId).select("-password");
        if (!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User details",
            user
        }); 
    } catch (err){
        console.error("Error fetching user details", err);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

const updateUser = async (req, res) => {
    try{
        const userId = req.userInfo.id
        if (userId != req.params.id){
            return res.status(403).json({
                message: "Forbidden: You can only access your own user details"
            })
        }
        const updates = req.body;
        delete updates.password;
        delete updates.role;

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User updated successfully",
            user
        });
    } catch (err){
        console.error("Error fetching user details", err);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

const deleteUser = async (req, res) => {
    try{
        const userId = req.userInfo.id
        if (userId != req.params.id){
            return res.status(403).json({
                message: "Forbidden: You can only access your own user details"
            })
        }
        await User.findByIdAndDelete(userId);

        const refreshToken = req.cookies.refreshToken;
        if (refreshToken){
            await revokeRefreshToken(refreshToken);
        }
        res.clearCookie('refreshToken', COOKIE_OPTIONS);

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch(err){
        console.log("Error deleting user", err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

const listUsers = async (req, res) => {
    try{
        if (req.userInfo.role !== 'admin'){
            return res.status(403).json({
                message: "Forbidden: Admins only"
            })
        }
        const users = await User.find().select("-password");
        res.status(200).json({
            message: "User list fetched successfully",
            users
        });
    } catch (err){
        console.error("Error fetching user list", err);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}
module.exports = { findUser, updateUser, deleteUser, listUsers };