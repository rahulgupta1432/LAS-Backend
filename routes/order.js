import express from "express";
import { getMyOrders } from "../controller/orderController.js";

const router=express.Router();


// Route to get all orders for a user
router.get("/get/my-orders", getMyOrders);

export default router;