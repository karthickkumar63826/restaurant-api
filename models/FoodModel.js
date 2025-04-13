const db = require("../config/db");

const FoodModel = {
    getAllFoods: async (filters = {}) => {
        let query = "SELECT * FROM foods WHERE 1=1";
        const params = [];

        if (filters.type) {
            query += " AND type = ?";
            params.push(filters.type);
        }

        if (filters.created_by) {
            query += " AND created_by = ?";
            params.push(filters.created_by);
        }

        if (filters.start_date && filters.end_date) {
            query += " AND DATE(created_at) BETWEEN ? AND ?";
            params.push(filters.start_date, filters.end_date);
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    getFoodById: async (id) => {
        const [rows] = await db.query(`
            SELECT foods.*, users.name as created_by_name
            FROM foods
            JOIN users ON foods.created_by = users.id
            WHERE foods.id = ?`,
            [id]
        );
        return rows;
    },
    createFood: async (data) => {
        const { name, price, description, type, image, created_by } = data;
        const [result] = await db.query(
            "INSERT INTO foods (name, price, description, type, image, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            [name, price, description, type, image, created_by]
        );

        return result;
    },
    updateFood: async (id, updatedFields) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                `UPDATE foods SET ? WHERE id = ?`,
                [updatedFields, id]
            );

            await connection.commit();
            return result;

        } catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    },

    deleteFood: async (id) => {
        await db.query("DELETE FROM foods WHERE id = ?", [id]);
    }

};

module.exports = FoodModel;