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

// Crear servidor HTTP y pasar app express
const server = http.createServer(app)

// Crear instancia Socket.IO con configuración CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
})

// Socket.IO conexión
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado, id:", socket.id)

  // Opcional: unirse a "room" si envían userId
  socket.on("join", (userId) => {
    socket.join(userId)
    console.log(`Socket ${socket.id} se unió a room: ${userId}`)
  })

  socket.on("disconnect", () => {
    console.log("Cliente desconectado, id:", socket.id)
  })
})

// Hacer accesible io dentro de rutas y controladores vía app
app.set("io", io)

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

// Conectar a DB y levantar servidor HTTP
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running on port", PORT)
  })
}).catch((err) => {
  console.error("Error connecting to DB", err)
})
