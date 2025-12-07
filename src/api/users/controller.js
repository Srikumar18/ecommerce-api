const User = require('../../models/user')

const findUser = async (req, res) => {
    const userId = req.params.id;
    try{
        const user = await User.findById(userId);
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

module.exports = { findUser };