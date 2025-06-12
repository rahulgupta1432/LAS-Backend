import jwt from "jsonwebtoken";
import { decryptToken } from "../utils/aes.js";
import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";


const Auth = async (req, res, next) => {
    const token = req.headers['x-authorization'];
    if (token) {
        try {
            // Decrypt the token
            const decryptedToken = decryptToken(token);
            // console.log('Decrypted Token:', decryptedToken); 

            // Verify the JWT
            const decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET);

            // Token expiration check
            if (decoded.expiresOn < Date.now()) {
                return res.status(401).json({
                    status: 'fail',
                    code: 401,
                    message: 'Not Authorized, Token Expired',
                    data: [],
                });
            }

            // Extract the user role and ID from the decoded token
            const { role, userId ,isAdmin} = decoded;
            let user = '';

            // Find the user based on the decoded userId
            user = await User.findOne({$or:[
                // _id:userId,role:role,isAdmin:isAdmin
                {_id:userId,role:role,isAdmin:isAdmin},
            ]});
            // console.log("user",userId,role)
            if (!user) {
                return res.status(401).json({
                    status: 'fail',
                    code: 401,
                    message: 'Not Authorized, Invalid User',
                    data: {},
                });
            }
            if(user.isDeleted){
              return next(new ErrorHandler("User Deleted, Please Contact to the Admin",404));
          }
          if (user.tokenVersion !== decoded.tokenVersion) {
            return next(new ErrorHandler("Token is invalid or has been logged out",401))
        }
        req.user = user;

            next();
        } catch (error) {
            console.log('Token Error:', error.message)
            console.log("error",error)
            return res.status(401).json({
                status: 'fail',
                code: 401,
                message: 'Not Authorized, token failed',
                data: {},
            });
        }
    } else {
        return res.status(401).json({
            status: 'fail',
            code: 401,
            message: 'Not Authorized, no token',
            data: {},
        });
    }
};

export const Admin =async (req, res, next) => {
    try {
        const admin=await User.findById(req.user._id);
        if(admin.role!==1&&!admin.isAdmin){
            return next(new ErrorHandler("UnAuthorized Access",401))
        }
        next();
    } catch (error) {
        console.log("Is Admin",error);
        return next(new ErrorHandler(error.message,500))
    }
};

export default Auth;