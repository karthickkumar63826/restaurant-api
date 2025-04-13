const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const orderRoutes = require("./routes/order");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*"
    }
});

global.io = io;

io.on("connection", (socket) => {
    console.log("A User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log('User disconnected', socket.id);
    });
});


app.get("/", (req, res) => {
    res.send("Restaurant App API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});