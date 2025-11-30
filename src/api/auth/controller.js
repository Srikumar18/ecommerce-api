const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const { validateEmail, validatePassword } = require('../../services/userservice');

const login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne(email);
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

        const payload = { email: user.email, id: user._id}

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '15m'});

        res.status(200).json({
            message: "Login successful",
            token
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

const findUser = async (req, res) => {
    const userId = req.params.id;
    try{

    } catch (err){
        console.error("Error fetching user details", err);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}
module.exports = { login, register, findUser };