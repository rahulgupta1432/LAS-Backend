import express from "express";
import { changePassword, forgetPassword, loginUser, registerUser, resendOtp, resetPassword, verifyOtp } from "../controller/authController.js";
import Auth, { Admin } from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/register",registerUser);
router.put("/change-password",changePassword)


router.post("/verify-otp",verifyOtp);
router.get("/resend-otp",resendOtp);
router.post("/login",loginUser);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",resetPassword);

router.get("/user-auth",Auth,(req,res)=>{
    res.send({
        ok:true
    });
})

router.get("/admin-auth",Auth,Admin,(req,res)=>{
    res.send({
        ok:true
    });
})


// export const getAllCategories=async(req,res,next)=>{
//     try{

//     }catch(error){
    // return next(new ErrorHandler(error.message,500));
//     }
// }


export default router;