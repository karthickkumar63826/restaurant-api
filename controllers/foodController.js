const Food = require("../models/FoodModel");

const getAllFoods = async (req, res) => {
    try {
        const { type, created_by, start_date, end_date } = req.query;

        const filters = {
            ...(type && { type }),
            ...(created_by && { created_by }),
            ...(start_date && end_date && { start_date, end_date })
        };

        console.log(filters);

        const results = await Food.getAllFoods(filters);
        res.json(results);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
};

const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Food.getFoodById(id);

        if (result.length === 0) {
            return res.status(404).json({ message: "Food Not Found" });
        }
        res.json(result[0]);

    } catch (error) {
        res.status(500).json({ error: error });
    }
};

const createFood = async (req, res) => {
    try {

        const foodData = {
            ...req.body,
            created_by: req.user?.id,
        };
        const result = await Food.createFood(foodData);
        res.status(201).json({ message: "Food Created", foodId: result.insertId });

    } catch (error) {
        res.status(500).json({ error: error });
    }
};

const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        await Food.updateFood(id, updatedData);
        res.json({ message: "Food updated succecssfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
};

const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        await Food.deleteFood(id);
        res.status(200).json({ message: "Food deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
};

module.exports = { getAllFoods, getFoodById, createFood, updateFood, deleteFood };