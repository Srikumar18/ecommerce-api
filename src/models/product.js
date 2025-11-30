const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    images: { 
        type: [String], 
        default: [] 
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'],
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model("Products", ProductSchema)