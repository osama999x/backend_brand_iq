const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    banner: {type:String,required:true},
    type:{
      type:String,
      enum:["newArrival","underPrice" ,"discount" ,"isSale"],
      unique:true,
      required:true
    },
    isPercentage:{
      type:Boolean,
      default:false
    },
    price:{
      type:Number,
      default :null
    }
  },
  { timestamps: true }
);

const bannerModel = new mongoose.model("Banner", schema);
module.exports = bannerModel;
