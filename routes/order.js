const express = require("express");
const router = express.Router();
const { placeorder, getOrderById, getAllOrders, updateOrderStatus, getKitchenOrders, recordPayment } = require("../controllers/orderController");
const authMiddleWare = require("../middlewares/authMiddleware");

router.post("/",
    authMiddleWare.verifyToken,
    placeorder);

router.get("/:orderId",
    authMiddleWare.verifyToken,
    getOrderById);

router.get("/",
    authMiddleWare.verifyToken,
    authMiddleWare.checkRole("admin"),
    getAllOrders);

router.patch("/",
    authMiddleWare.verifyToken,
    updateOrderStatus);

router.get("/kitchen/orders",
    authMiddleWare.verifyToken,
    getKitchenOrders
);

router.post("/pay/:orderId",
    authMiddleWare.verifyToken,
    recordPayment
);

module.exports = router;