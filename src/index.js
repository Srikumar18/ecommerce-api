require("dotenv").config()
const connectDB = require("./loaders/db");
const authRoutes = require("./api/auth/routes");
const productRoutes = require("./api/orders/routes");
const orderRoutes = require("./api/products/routes");

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
    console.log(`Server listening to PORT ${PORT}`);
})