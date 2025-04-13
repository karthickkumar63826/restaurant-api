const db = require("../config/db");

const OrderModel = {
    placeOrder: async (orderData, items) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                user_id,
                status = "pending",
                order_type,
                table_number = null
            } = orderData;

            let total_price = 0;

            for (const item of items) {
                const [food] = await connection.query("SELECT price FROM foods WHERE id = ?", [item.food_id]);
                if (food.length > 0) {
                    item.price = food[0].price;
                    total_price += item.price * item.quantity;
                } else {
                    throw new Error(`Food with id ${item.food_id} not found`);
                }
            }

            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, status, order_type, total_price, table_number)
                VALUES (?, ?, ?, ?, ?)`,
                [user_id, status, order_type, total_price, table_number]
            );

            const orderId = orderResult.insertId;

            for (const item of items) {
                await connection.query(
                    `INSERT INTO order_items (order_id, food_id, quantity, price)
                    VALUES (?, ?, ?, ?)`,
                    [orderId, item.food_id, item.quantity, item.price]
                );
            }

            await connection.commit();

            return { orderId };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getOrderById: async (orderId) => {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE id = ?', [orderId]
        );

        const [items] = await db.query(
            `SELECT order_items.*, foods.name as food_name
            FROM order_items
            JOIN foods ON foods.id = order_items.food_id
            WHERE order_items.order_id = ?`,
            [orderId]
        );

        return { order: orders[0], items };
    },

    updateOrderStatus: async (orderId, status) => {
        const [result] = await db.query(
            `UPDATE orders SET status = ? WHERE id = ?`,
            [status, orderId]
        );
        return result;
    },

    getAllOrders: async (filters = {}) => {

        let query = (`SELECT orders.*, users.name as user_name
            FROM orders
            JOIN users ON users.id = orders.user_id
            WHERE 1`
        );

        const params = [];

        if (filters.status) {
            query += " AND orders.status = ?";
            params.push(filters.status);
        }

        if (filters.type) {
            query += " AND orders.order_type = ?";
            params.push(filters.type);
        }

        if (filters.start && filters.end) {
            query += " AND orders.created_at BETWEEN ? AND ?";
            params.push(filters.start, filters.end);
        } else if (filters.start) {
            query += " AND orders.created_at >= ? ";
            params.push(filters.start);
        } else if (filters.end) {
            query += " AND orders.created_at <= ?";
            params.push(filters.end);
        }

        query += " ORDER BY orders.created_at DESC";

        const [rows] = await db.query(query, params);

        return rows;
    },

    getKitchenOrders: async () => {
        const [ordersResult] = await db.query(
            `SELECT o.id as order_id, o.table_number, o.status, o.order_type, o.created_at,
                u.name as user_name
            FROM orders o
            JOIN users u ON u.id = o.user_id
            WHERE o.status IN ('pending', 'in-progress')
            ORDER BY o.created_at ASC
        `);

        const orders = ordersResult || [];

        for (const order of orders) {
            const [items] = await db.query(`
                SELECT oi.food_id, f.name as food_name, oi.quantity
                FROM order_items oi
                JOIN foods f ON f.id = oi.food_id
                WHERE oi.order_id = ?
                `, [order.order_id]);

            order.items = items;
        }
        return orders;
    },

    recordPayments: async (orderId, amount, paymentType) => {
        await db.query('INSERT INTO payments (order_id, payment_type, amount) VALUES (?, ?, ?)',
            [orderId, paymentType, amount]);
    }
};


module.exports = OrderModel;