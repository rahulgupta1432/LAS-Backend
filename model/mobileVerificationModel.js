import mongoose from "mongoose";

const mobileVerificationSchema=new mongoose.Schema({
    mobile:{
        type:Number,
        required:false
    },
    email:{
        type:String,
        required:false
    },
    otp:{
        type:Number,
        required:true
    },
    type:{
        type:String,
    },
    expiresAt:{
        type:Date,
        default:()=>new Date(Date.now()+60*5000)
    }
},{
    timestamps:true
});

mobileVerificationSchema.pre('validate', function(next) {
    if (!this.mobile && !this.email) {
        return next(new Error('Either mobile or email must be provided.'));
    }
    next();
});

mobileVerificationSchema.index({expiresAt:5},{expireAfterSeconds:0})

const MobileVerification=mongoose.model("MobileVerification",mobileVerificationSchema);

export default MobileVerification;

