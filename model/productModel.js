import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
    required: true
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
    default: null
  },
  imageList: [
    {
      type: String,
    },
  ],
  colors:{
    type:[String]
  },
  quantity:{
    type:Number,
    required:true
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
},{
  timestamps:true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
