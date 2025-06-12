import mongoose from "mongoose";

const wishListSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    product:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    }],
    isActive:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

const wishListModel=mongoose.model('WishList',wishListSchema);

export default wishListModel;
