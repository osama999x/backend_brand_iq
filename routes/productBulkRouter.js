const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const expressAsyncHandler = require("express-async-handler");
const productBulkRouter = express.Router();
const xlsx = require("xlsx");
const productsServices = require("../services/productsServices");
const productsModel = require("../model/productsModel");

// Function to parse and extract data from the Excel file
function parseExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  return data;
}

productBulkRouter.post(
  "/",upload.single('file'),
  expressAsyncHandler(async (req, res) => {
    const  file  = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).send({ msg: "No file uploaded!" });
    }
    const filePath = file.path;
    const excelData = parseExcelFile(filePath);
    try {
      await addProductsFromExcel(excelData);
      return res.status(200).send({ msg: "success" });
    } catch (error) {
      console.error("Error adding products:", error);
      return res.status(400).send({ msg: "failed!" });
    }
  })
);

// Function to add products in bulk from the Excel data
async function addProductsFromExcel(data) {
  for (const item of data) {
    let variants=[];
    // Extract relevant data from the item object
    const {
      category,
      subcategory,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      colorName,
      colorHex,
      actualPrice,
      discountedPrice,
      quantity,
      sku,
      size,
      image,
      images,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      isFeatured,
      vendor,
    } = item;
    // Assuming `variantData` is the extracted variant data from the Excel file
    const transformedVariants = [
      {
        colorName: colorName || "",
        colorHex: colorHex || "",
        actualPrice: actualPrice || 0,
        discountedPrice: discountedPrice || 0,
        quantity: item.quantity || 0,
        sku: sku || "",
        size: size || "",
        image: image || "",
      },
    ];

    // Example usage
    const productVariants =transformedVariants.map((variant) => {
      console.log(variant);
      //variants.push( 
      return  {
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        actualPrice: variant.actualPrice,
        discountedPrice: variant.discountedPrice,
        quantity:variant.quantity,
        sku: variant.sku,
        size: variant.size,
        image: variant.image,
      }
      //);
    });
    //return variants
   console.log(productVariants);
  // return
    // Now you can push the `productVariants` array to the `variant` field of your schema
    const product = new productsModel({
      category,
      subcategory,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant: productVariants,
      images,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      isFeatured,
      vendor,
    });

    await product.save();
  }
}

module.exports=productBulkRouter
