import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendResponse.js";
export const getProfileByUserId=async(req,res,next)=>{
    try {
        const {userId}=req.query;
        const user=await User.findById(userId);
        if(!user){
            return next(new ErrorHandler("User not found",404));
        }
        user.password=undefined;
        sendResponse({
            res,
            message:"Profile updated successfully",
            data:user
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

export const updateProfileInfo=async(req,res,next)=>{
    try {
        const {username,email,mobile,userId}=req.body;
        const user=await User.findById(userId);
        if(!user){
            return next(new ErrorHandler("User not found",404));
        }
        
        const updateProfile=await User.findByIdAndUpdate(userId,{
            image:req?.file?.path,
            username,
            email,
            mobile
        },{new:true});
        console.log(updateProfile)
        if(!updateProfile){
            return next(new ErrorHandler("User not found",400));
        }
        sendResponse({
            res,
            message:"Profile updated successfully",
            data:updateProfile
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}




export const getUserOrders=async(req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    let limit;
    const skip=(page-1)*limit;
    const {userId}=req.query;

    try{
        if(!userId){
            return next(new ErrorHandler("Please Provide User Id",400));
        }
        let getOrders=[]
        const checkUser=await User.findById(userId);

        if(!checkUser){
            return next(new ErrorHandler("User Not Found",400));
        }
        getOrders = await Order.find({buyer:userId})
            .populate({
                path: "product"
            })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();

        if(!getOrders||getOrders.length===0){
            sendResponse({
                res,
                message:"No Orders Found",
                data:[]
            })
        }
        const totalOrders = await Order.countDocuments({ isDeleted: false,buyer:userId });
        const pagination = {
            limit:getOrders.length,
            page,
            pages: Math.ceil(totalOrders / limit),
            nextPage: page < Math.ceil(totalOrders / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalOrders / limit)
        };

            getOrders.push(pagination)

        sendResponse({
            res,
            message:"User Orders are Fetched successfully",
            data:getOrders
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}
