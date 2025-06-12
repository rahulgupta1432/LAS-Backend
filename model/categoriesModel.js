import mongoose from "mongoose";

const categoriesSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    slug:{
        type:String,
        lowerCase:true
    },
    image:{
        type:String,
        required:true
    },
    parent_category_id: {
        type: String,  
        default: '0',
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
},{
    timestamps:true
});

const Categories=mongoose.model('categories',categoriesSchema);

export default Categories;