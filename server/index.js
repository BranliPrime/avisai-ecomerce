// server.js (o index.js, como lo tengas nombrado)
import express from "express"
import cors from "cors"
import { config } from "dotenv"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import http from "http"
import { Server } from "socket.io"

config()

import connectDB from "./config/connectDB.js"
import userRouter from "./routes/user.route.js"
import categoryRouter from "./routes/category.route.js"
import uploadRouter from "./routes/upload.route.js"
import subCategoryRouter from "./routes/subCategory.route.js"
import productRouter from "./routes/product.route.js"
import cartRouter from "./routes/cart.route.js"
import addressRouter from "./routes/address.route.js"
import orderRouter from "./routes/order.route.js" 
import sunatRouter from "./routes/sunat.route.js"
import installationRouter from "./routes/installation.route.js"
import facturacionRouter from "./routes/facturacion.route.js"
import chatbotRouter from "./routes/chatbot.route.js"

const app = express()

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "*",
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy: false
}))

const PORT = process.env.PORT || 3002

// Rutas
app.use('/api/user', userRouter)
app.use("/api/category", categoryRouter)
app.use("/api/file", uploadRouter)
app.use("/api/subcategory", subCategoryRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/address", addressRouter)
app.use('/api/order', orderRouter)
app.use("/api", sunatRouter)
app.use("/api/installation", installationRouter)
app.use("/api/facturacion", facturacionRouter)
app.use("/api/chatbot", chatbotRouter)

app.get("/", (req, res) => {
  res.json({
    message: "Server is running on port " + PORT,
  })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});