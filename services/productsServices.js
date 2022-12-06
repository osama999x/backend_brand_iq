const productsModel = require("../model/productsModel");
const productMetaModel = require("../model/productMetaModel");
const projection = require("../config/mongoProjection");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const uploadFile = require("../utils/uploadFile");
const ProductQuantityLogModel = require("../model/productQuntityLogModel");
// const productsImagesModel = require("../model/productsImagesModel");

const productsServices = {
  getproducts: async () => {
    let products = await productsModel
      .find({}, projection.projection)
      .populate({
        path: "category",
        select: { _id: 1, title: 1, name: 1 },
      })
      .populate({
        path: "subcategory",
        select: { _id: 1, title: 1, name: 1 },
      })
      .sort({ createdAt: "asc", updatedAt: "asc" });
    products = JSON.stringify(products);
    products = JSON.parse(products);
    var productLength = products.length;
    var variantQuantity = 0;
    if (products.length != 0) {
      for (let i = 0; i < productLength; i++) {
        var calculateQuantity = 0;
        var variantLength = products[i].variant.length;
        for (let j = 0; j < variantLength; j++) {
          variantQuantity = products[i].variant[j].quantity;
          var addQuantity = variantQuantity;
          calculateQuantity += addQuantity;
        }

        products[i]["AvailbeQuantity"] = calculateQuantity;
      }
    }
    return products;
  },
  quantityUpdate: async (
    productId,
    sku,
    actualPrice,
    discountedPrice,
    quantity
  ) => {
    const filter = { _id: productId, "variant.sku": sku };
    const update = {
      $inc: {
        "variant.$.quantity": +quantity,
      },
      $set: {
        "variant.$.actualPrice": actualPrice,
        "variant.$.discountedPrice": discountedPrice,
      },
    };
    const updateProduct = await productsModel.updateMany(filter, update);
    if (updateProduct) {
      const data = new ProductQuantityLogModel({
        product: productId,
        sku,
        actualPrice,
        discountedPrice,
        quantity,
      });
      await data.save();
    }
    return updateProduct;
  },
  getProductsById: async (_id) => {
    const list = await productsModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "category",
        select: { _id: 1, title: 1, name: 1 },
      })
      .populate({
        path: "subcategory",
        select: { _id: 1, title: 1, name: 1 },
      })
      .lean();
    // if (list.length != 0 && list.addons.length != 0) {
    //   addons = list.addons;
    //   var addonsArr = [];
    //   for (var i of addons) {
    //     product = i.product;
    //     sku = i.sku;
    //     addons = await productsModel.findOne(
    //       { _id: { $in: product } },
    //       {
    //         variant: { $elemMatch: { sku: { $eq: sku } } },
    //         name: 1,
    //         title: 1,
    //         thumbnail: 1,
    //       }
    //     );
    //     addonsArr.push(addons);
    //   }
    //   list.addons = addonsArr;
    // }
    // list = JSON.stringify(list);
    // list = JSON.parse(list);
    // var variantQuantity = 0;
    // if (list) {
    //   let tag = list.tags;
    //   let productId = list._id.toLocaleString();
    //   var tags = await productsModel
    //     .find(
    //       { $and: [{ _id: { $nin: productId } }, { tags: { $in: tag } }] },
    //       { name: 1, title: 1, thumbnail: 1, variant: 1 }
    //     )
    //     .lean();
    //   list.tagProducts = tags.map((item) => {
    //     item.actualPrice = item.variant[0].actualPrice;
    //     item.discountedPrice = item.variant[0].discountedPrice;
    //     delete item.variant;
    //     return item;
    //   });
    // console.log(tags);
    //   .populate({
    //     path: "category",
    //     select: { _id: 1, title: 1, name: 1 },
    //   })
    //   .populate({
    //     path: "subcategory",
    //     select: { _id: 1, title: 1, name: 1 },
    //   });
    // // var variantLength = list.variant.length;
    // for (var j = 0; j < variantLength; j++) {
    //   variantQuantity += list.variant[j].quantity;
    // }
    // list["AvailbeQuantity"] = variantQuantity;
    // list.tagProducts = tags;
    // }
    return list;
  },
  getProductsDetails: async (productId, sku, quantity) => {
    var product = await productsModel.findOne({
      $and: [{ _id: productId }, { "variant.sku": sku }],
    });
    if (product) {
      var productVariantLength = product.variant.length;
      for (var i = 0; i < productVariantLength; i++) {
        if (
          product.variant[i].sku === sku &&
          product.variant[i].quantity >= quantity
        ) {
          return true;
        }
      }
    } else {
      throw "Product Not Availble";
    }
  },

  add: async (
    category,
    subcategory,
    name,
    title,
    description,
    longDescription,
    isColor,
    variant,
    thumbnail,
    images,
    vendor,
    isTaxable,
    taxHead,
    taxType,
    isPercentage,
    taxAmount,
    metaData,
    metaDescription,
    size,
    tags,
    addons
  ) => {
    thumbnail = await uploadFile(thumbnail);
    var imgArr = [];
    imgArr[0] = thumbnail;
    //Product have images
    if (images.length != 0) {
      var arrayLength = images.length;
      for (var i = 0; i < arrayLength; i++) {
        img = await uploadFile(images[i]);
        imgArr.push(img);
      }
    }
    if (isTaxable === true && isPercentage === false && variant.length != 0) {
      var variantArr = [];
      for (var i = 0; i < variant.length; i++) {
        colorName = variant[i].colorName;
        colorHex = variant[i].colorHex;
        actualPrice = variant[i].actualPrice + taxAmount;
        discountedPrice = variant[i].discountedPrice;
        quantity = variant[i].quantity;
        sku = variant[i].sku;
        size = variant[i].size;
        variantArr.push({
          colorName: colorName,
          colorHex: colorHex,
          actualPrice: actualPrice,
          discountedPrice: discountedPrice,
          quantity: quantity,
          sku: sku,
          size: size,
        });
      }
      variant = variantArr;
    }
    if (isTaxable === true && isPercentage === true && variant.length != 0) {
      let variantArr = [];
      for (var i = 0; i < variant.length; i++) {
        colorName = variant[i].colorName;
        colorHex = variant[i].colorHex;
        actualPrice = variant[i].actualPrice;
        actualPrice = actualPrice + (taxAmount / 100) * actualPrice;
        discountedPrice = variant[i].discountedPrice;
        quantity = variant[i].quantity;
        sku = variant[i].sku;
        size = variant[i].size;
        variantArr.push({
          colorName: colorName,
          colorHex: colorHex,
          actualPrice: actualPrice,
          discountedPrice: discountedPrice,
          quantity: quantity,
          sku: sku,
          size: size,
        });
      }
      variant = variantArr;
    }
    products = new productsModel({
      category: mongoose.Types.ObjectId(category),
      subcategory: mongoose.Types.ObjectId(subcategory),
      name,
      title,
      description,
      longDescription,
      isColor,
      variant,
      thumbnail,
      images: imgArr,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      size,
      tags,
      addons,
    });
    const result = await products.save({
      "variant.sku": { $ne: variant.sku },
    });
    if (result) {
      productMeta = new productMetaModel({
        product: mongoose.Types.ObjectId(result._id),
        category: mongoose.Types.ObjectId(category),
        subcategory: mongoose.Types.ObjectId(subcategory),
        metaData,
        metaDescription,
      });
      await productMeta.save();
    }
    return result;
  },
  update: async (
    _id,
    category,
    subcategory,
    name,
    title,
    description,
    longDescription,
    isColor,
    variant,
    thumbnail,
    images,
    vendor,
    isTaxable,
    taxHead,
    taxType,
    isPercentage,
    taxAmount,
    isActive,
    isFeatured,
    isSale,
    isDeal,
    inStock,
    sequence,
    ratingNumber,
    ratingCount,
    metaData,
    metaDescription,
    size,
    tags,
    addons
  ) => {
    var _id = mongoose.Types.ObjectId(_id);
    if (thumbnail) {
      thumbnail = await uploadFile(thumbnail);
    }
    var imgArr = [];
    if (images.length != 0) {
      var arrayLength = images.length;
      for (var i = 0; i < arrayLength; i++) {
        img = await uploadFile(images[i]);
        imgArr.push(img);
      }
    }
    let result = null;
    if (isTaxable === true && isPercentage === false && variant.length != 0) {
      var variantArr = [];
      for (var i = 0; i < variant.length; i++) {
        colorName = variant[i].colorName;
        colorHex = variant[i].colorHex;
        actualPrice = variant[i].actualPrice + taxAmount;
        discountedPrice = variant[i].discountedPrice;
        quantity = variant[i].quantity;
        sku = variant[i].sku;
        size = variant[i].size;
        variantArr.push({
          colorName: colorName,
          colorHex: colorHex,
          actualPrice: actualPrice,
          discountedPrice: discountedPrice,
          quantity: quantity,
          sku: sku,
          size: size,
        });
      }
      variant = variantArr;
    }
    if (isTaxable === true && isPercentage === true && variant.length != 0) {
      let variantArr = [];
      for (var i = 0; i < variant.length; i++) {
        colorName = variant[i].colorName;
        colorHex = variant[i].colorHex;
        actualPrice = variant[i].actualPrice;
        actualPrice = actualPrice + (taxAmount / 100) * actualPrice;
        discountedPrice = variant[i].discountedPrice;
        quantity = variant[i].quantity;
        sku = variant[i].sku;
        size = variant[i].size;
        variantArr.push({
          colorName: colorName,
          colorHex: colorHex,
          actualPrice: actualPrice,
          discountedPrice: discountedPrice,
          quantity: quantity,
          sku: sku,
          size: size,
        });
      }
      variant = variantArr;
    }
    if (thumbnail) {
      result = await productsModel.findOneAndUpdate(
        { _id },
        {
          category: mongoose.Types.ObjectId(category),
          subcategory: mongoose.Types.ObjectId(subcategory),
          name,
          title,
          description,
          longDescription,
          isColor,
          variant,
          $push: { images: imgArr },
          vendor,
          isTaxable,
          taxHead,
          taxType,
          isPercentage,
          taxAmount,
          isActive,
          isFeatured,
          thumbnail,
          isSale,
          isDeal,
          inStock,
          sequence,
          ratingNumber,
          ratingCount,
          metaData,
          metaDescription,
          size,
          tags,
          addons,
        },
        { new: true }
      );
    } else {
      result = await productsModel.findOneAndUpdate(
        { _id },
        {
          category: mongoose.Types.ObjectId(category),
          subcategory: mongoose.Types.ObjectId(subcategory),
          name,
          title,
          description,
          longDescription,
          isColor,
          variant,
          $push: { images: imgArr },
          vendor,
          isTaxable,
          taxHead,
          taxType,
          isPercentage,
          taxAmount,
          isActive,
          isFeatured,
          isSale,
          isDeal,
          inStock,
          sequence,
          ratingNumber,
          ratingCount,
          metaData,
          metaDescription,
          size,
          tags,
          addons,
        },
        { new: true }
      );
    }
    if (result) {
      await productMetaModel.findOneAndUpdate(
        { product: result._id },
        {
          category: mongoose.Types.ObjectId(category),
          subcategory: mongoose.Types.ObjectId(subcategory),
          metaData,
          metaDescription,
        },
        { new: true }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await productsModel.deleteOne({ _id });
    return result;
  },
  getMultipleProducts: async (ids) => {
    const list = await productsModel.find(
      { _id: { $in: ids } },
      { _id: 1, name: 1, thumbnail: 1, isFavourite: 1, variant: 1, title: 1 }
    );
    return list;
  },

  test: async () => {
    let data = await productsModel.find({});
    return data;
  },
};

module.exports = productsServices;
