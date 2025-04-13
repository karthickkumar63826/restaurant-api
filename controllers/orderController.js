const Order = require("../models/OrderModel");

const placeorder = async (req, res) => {
    try {
        let { items, ...orderData } = req.body;

        orderData = {
            ...orderData,
            user_id: req.user?.id,
        };

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Items are required for the order" });
        }

        const { orderId } = await Order.placeOrder(orderData, items);

        const orderDetails = await Order.getOrderById(orderId);

        io.emit('new_kot_order', {
            message: "New Order placed!",
            order: orderDetails
        });

        res.status(201).json({ message: "Order Placed successfully", orderId });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ message: "Order Id is required" });
        }

        const { order, items } = await Order.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            order,
            items
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ message: "Order Id and status are required" });
    }

    try {
        const results = await Order.updateOrderStatus(orderId, status);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ message: "Order status updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {

        const filters = {
            status: req.query?.status,
            type: req.query?.type,
            start: req.query?.start,
            end: req.query?.end
        };

        const orders = await Order.getAllOrders(filters);
        return res.status(200).json({ orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getKitchenOrders = async (req, res) => {
    try {
        const orders = await Order.getKitchenOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch kitchen orders" });
    }
};

const recordPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { amount, paymentType } = req.body;

        if (!amount || !paymentType) {
            return res.status(400).json({ error: "Amount and payment type are required" });
        }

        await Order.recordPayments(orderId, amount, paymentType);

        req.io.emit("order_paid", { orderId });

        res.status(200).json({ message: `Payment recorded for order ${orderId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { placeorder, getOrderById, updateOrderStatus, getAllOrders, getKitchenOrders, recordPayment };