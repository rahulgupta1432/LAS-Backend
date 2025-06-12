import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { upload } from "../utils/uploadFile.js";
import { getPaymentGatewayToken, paymentForOrder } from "../controller/paymentController.js";


const router=express.Router();

router.get('/get-payment-token',getPaymentGatewayToken);

router.post('/process',Auth,paymentForOrder);


export default router;