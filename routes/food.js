const express = require("express");
const router = express.Router();
const {
    getAllFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood
} = require("../controllers/foodController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");


router.get("/", getAllFoods);
router.get("/:id", getFoodById);
router.post("/", verifyToken, checkRole("admin"), createFood);
router.put("/:id", verifyToken, checkRole("admin"), updateFood);
router.delete("/:id", verifyToken, checkRole("admin"), deleteFood);


module.exports = router;