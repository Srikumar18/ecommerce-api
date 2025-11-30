require("dotenv").config()
const connectDB = require("./loaders/db");

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server listening to PORT ${PORT}`);
})