const productsModel = require("../model/productsModel");
const productMetaModel = require("../model/productMetaModel");
const projection = require("../config/mongoProjection");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const uploadFile = require("../utils/uploadFile");
const ProductQuantityLogModel = require("../model/productQuntityLogModel");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const promotionModel = require("../model/promotionModel");
const SubscribeModel = require("../model/subscribeModel");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const productVariantServices = require("./productVariantServices");
const dealBuyerLogModel = require("../model/dealBuyerLogModel");
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
      .sort({ createdAt: -1 });
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
  getProductsByIdWeb: async (productId) => {
    const product = await productsModel
      .findById({ _id: productId })
      .populate({
        path: "category",
      })
      .populate({
        path: "subcategory",
      });
    return product;
  },
  getProductsById: async (productId) => {
    let today = new Date(new Date());
    // let checkProduct = await productsModel.findOne(
    //   {
    //     _id: productId,
    //   },
    //   { isDeal: 1 }
    // );
    // if (checkProduct.isDeal === true) {
    //   var product = await productsModel.aggregate([
    //     {
    //       $match: {
    //         $and: [
    //           { _id: new mongoose.Types.ObjectId(productId) },
    //           { dealExpire: { $gte: today } },
    //         ],
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         category: 1,
    //         subcategory: 1,
    //         name: 1,
    //         title: 1,
    //         description: 1,
    //         longDescription: 1,
    //         isColor: 1,
    //         thumbnail: 1,
    //         images: 1,
    //         isActive: 1,
    //         vendor: 1,
    //         isFeatured: 1,
    //         isSale: 1,
    //         isDeal: 1,
    //         dealExpire: 1,
    //         discount: 1,
    //         isDiscount: 1,
    //         inStock: 1,
    //         sequence: 1,
    //         ratingCount: 1,
    //         ratingNumber: 1,
    //         isFavourite: 1,
    //         isTaxable: 1,
    //         taxHead: 1,
    //         taxType: 1,
    //         isPercentage: 1,
    //         taxAmount: 1,
    //         metaData: 1,
    //         metaDescription: 1,
    //         addons: 1,
    //         tags: 1,
    //         variant: {
    //           $map: {
    //             input: "$variant",
    //             as: "variant",
    //             in: {
    //               colorName: "$$variant.colorName",
    //               colorHex: "$$variant.colorHex",
    //               actualPrice: "$$variant.actualPrice",
    //               quantity: "$$variant.quantity",
    //               size: "$$variant.size",
    //               image: "$$variant.image",
    //               sku: "$$variant.sku",
    //               _id: "$$variant._id",
    //               discountedPrice: {
    //                 $ifNull: [
    //                   {
    //                     $subtract: ["$$variant.actualPrice", "$discount"],
    //                   },
    //                   "$$variant.discountedPrice",
    //                 ],
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "categories",
    //         localField: "category",
    //         foreignField: "_id",
    //         let: {
    //           id: "$category",
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $eq: ["$_id", "$$id"],
    //               },
    //             },
    //           },
    //           {
    //             $project: {
    //               _id: 1,
    //               name: 1,
    //             },
    //           },
    //         ],
    //         as: "category",
    //       },
    //     },
    //     {
    //       $unwind: {
    //         path: "$category",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "subcategories",
    //         localField: "subcategory",
    //         foreignField: "_id",
    //         let: {
    //           id: "$subcategory",
    //         },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $eq: ["$_id", "$$id"],
    //               },
    //             },
    //           },
    //           {
    //             $project: {
    //               _id: 1,
    //               name: 1,
    //             },
    //           },
    //         ],
    //         as: "subcategory",
    //       },
    //     },
    //     {
    //       $unwind: {
    //         path: "$subcategory",
    //       },
    //     },
    //   ]);
    // } else {
    var product = await productsModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(productId) },
      },
      {
        $lookup: {
          from: "promotions",
          localField: "_id",
          foreignField: "product",
          pipeline: [{ $match: { expireDate: { $gte: today } } }],
          as: "promotion",
        },
      },
      {
        $unwind: {
          path: "$promotion",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          subcategory: 1,
          name: 1,
          title: 1,
          description: 1,
          longDescription: 1,
          isColor: 1,
          thumbnail: 1,
          images: 1,
          isActive: 1,
          vendor: 1,
          isFeatured: 1,
          isSale: 1,
          isDeal: 1,
          discount: 1,
          oneTimeDeal: 1,
          isDiscount: 1,
          inStock: 1,
          sequence: 1,
          ratingCount: 1,
          ratingNumber: 1,
          isFavourite: 1,
          isTaxable: 1,
          taxHead: 1,
          taxType: 1,
          isPercentage: 1,
          taxAmount: 1,
          metaData: 1,
          metaDescription: 1,
          addons: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          variant: {
            $map: {
              input: "$variant",
              as: "variant",
              in: {
                colorName: "$$variant.colorName",
                colorHex: "$$variant.colorHex",
                actualPrice: "$$variant.actualPrice",
                quantity: "$$variant.quantity",
                size: "$$variant.size",
                image: "$$variant.image",
                sku: "$$variant.sku",
                _id: "$$variant._id",
                discountedPrice: {
                  $ifNull: [
                    {
                      $subtract: [
                        "$$variant.actualPrice",
                        {
                          $multiply: [
                            "$promotion.discount",
                            {
                              $divide: ["$$variant.actualPrice", 100],
                            },
                          ],
                        },
                      ],
                    },
                    "$$variant.discountedPrice",
                  ],
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          let: { id: "$category" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategory",
          foreignField: "_id",
          let: { id: "$subcategory" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "subcategory",
        },
      },
      {
        $unwind: {
          path: "$subcategory",
        },
      },
    ]);

    if (product.length != 0 && product[0].isDeal === true) {
      discount = product[0].discount;
      images = product[0].images;
      for (var item of product[0].variant) {
        actualPrice = item.actualPrice;
        item.discountedPrice = actualPrice - discount;
        image = item.image;
        if (!images.includes(image)) {
          images.push(image);
        }
      }
    } else {
      images = product[0].images;
      for (var item of product[0].variant) {
        image = item.image;
        if (image && !images.includes(image)) {
          images.push(image);
        }
      }
    }
    return product[0];
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
    categoryId,
    subcategoryId,
    name,
    title,
    description,
    longDescription,
    isDiscount,
    isDeal,
    dealExpire,
    oneTimeDeal,
    discount,
    variant,
    images,
    vendor,
    isTaxable,
    taxHead,
    taxType,
    isPercentage,
    taxAmount,
    metaData,
    metaDescription,
    tags,
    addons,
    isFeatured
  ) => {
    // thumbnail = await uploadFile(thumbnail);
    //console.log("images", images);
    var imgArr = [];
    //Product have images
    if (images.length != 0) {
      imgArr = await Promise.all(images.map(uploadFile));
      console.log(imgArr);
      var thumbnail = imgArr[0];
    }
    console.log("thumbnail", thumbnail);
    let variants = [];
    switch (variant.length !== 0) {
      case variant[0].colorName === "" && variant[0].size.length === 0:
        variants = await productVariantServices.handleNoColorNoSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName !== "" && variant[0].size.length === 0:
        variants = await productVariantServices.handleColorNoSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName === "" && variant[0].size.length !== 0:
        variants = await productVariantServices.handleNoColorSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName !== "" && variant[0].size.length !== 0:
        variants = await productVariantServices.handleColorSize(
          variant,
          isDiscount
        );
        break;
    }
    //case 1 no color no size
    // if (variant[0].colorName === "" && variant[0].size.length === 0) {
    //   let variants = [];
    //   for (let i of variant) {
    //     if (i.image) {
    //       var image = await uploadFile(i.image);
    //     } else {
    //       image = "";
    //     }
    //     variants.push({
    //       colorName: "",
    //       colorHex: "",
    //       actualPrice: i.actualPrice,
    //       discountedPrice: i.discountedPrice,
    //       quantity: i.quantity,
    //       sku: `${i.sku}`,
    //       size: "",
    //       image: image,
    //     });
    //   }
    //   variant = variants;
    // }
    //case 2 no size but color exist
    // else if (variant[0].colorName != "" && variant[0].size.length === 0) {
    //   let variants = [];
    //   for (let i of variant) {
    //     if (i.image) {
    //       var image = await uploadFile(i.image);
    //     } else {
    //       image = "";
    //     }
    //     variants.push({
    //       colorName: i.colorName,
    //       colorHex: i.colorHex,
    //       actualPrice: i.actualPrice,
    //       discountedPrice: i.discountedPrice,
    //       quantity: i.quantity,
    //       sku: `${i.sku}`,
    //       size: "",
    //       image: image,
    //     });
    //   }
    //   variant = variants;
    // }
    //case 3 no color but size exist
    // else if (variant[0].colorName === "" && variant[0].size.length != 0) {
    //   let variants = [];
    //   for (var item of variant) {
    //     if (item.image) {
    //       var image = await uploadFile(item.image);
    //     } else {
    //       image = "";
    //     }
    //     for (var i of item.size) {
    //       variants.push({
    //         colorName: "",
    //         colorHex: "",
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${item.sku}${i.name}`,
    //         size: i.name,
    //         image: image,
    //       });
    //     }
    //   }
    //   variant = variants;
    // }
    // case 3 color and size exist
    // else if (variant[0].colorName != "" && variant[0].size.length != 0) {
    //   let variants = [];
    //   for (var item of variant) {
    //     if (item.image) {
    //       var image = await uploadFile(item.image);
    //     } else {
    //       image = "";
    //     }
    //     for (var i of item.size) {
    //       variants.push({
    //         colorName: item.colorName,
    //         colorHex: item.colorHex,
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${item.sku}${i.name}`,
    //         size: i.name,
    //         image: image,
    //       });
    //     }
    //   }
    //   variant = variants;
    // }

    products = new productsModel({
      category: mongoose.Types.ObjectId(categoryId),
      subcategory: mongoose.Types.ObjectId(subcategoryId),
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant: variants,
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
      tags,
      addons,
      isFeatured,
    });
    const result = await products.save();
   // {'variant.sku':{$ne:variant.sku}}
    console.log(result);
    if (result) {
      let subject = sendEmailNotificationInfo.product.title;
      let text =
        sendEmailNotificationInfo.product.body + `${name}. Now you can buy`;
      await sendNotificationEmail(subject, text);
      productMeta = new productMetaModel({
        product: mongoose.Types.ObjectId(result._id),
        category: mongoose.Types.ObjectId(result.category),
        subcategory: mongoose.Types.ObjectId(result.subcategory),
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
    isDiscount,
    isDeal,
    dealExpire,
    oneTimeDeal,
    discount,
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
    tags,
    addons,
    newImages,
    isFeatured
  ) => {
    var _id = mongoose.Types.ObjectId(_id);
    var imgArr = [];
    if (thumbnail) {
      thumbnail = await uploadFile(thumbnail);
    }
    // convert images to base64
    if (newImages.length != 0) {
      imgArr = await Promise.all(newImages.map(uploadFile));
      images = [...images, ...imgArr];
    }
    //new images
    let result = null;
    let variants = [];
    switch (variant.length !== 0) {
      case variant[0].colorName === "" && variant[0].size.length === 0:
        variants = await productVariantServices.handleNoColorNoSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName !== "" && variant[0].size.length === 0:
        variants = await productVariantServices.handleColorNoSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName === "" && variant[0].size.length !== 0:
        variants = await productVariantServices.handleNoColorSize(
          variant,
          isDiscount
        );
        break;
      case variant[0].colorName !== "" && variant[0].size.length !== 0:
        variants = await productVariantServices.handleColorSize(
          variant,
          isDiscount
        );
        break;
    }
    // case 1 if color and image are empty
    // if (variant[0].colorName === "" && variant[0].size.length === 0) {
    //   let variants = [];
    //   for (let i of variant) {
    //     if (i.image) {
    //       var image = await uploadFile(i.image);
    //       variants.push({
    //         colorName: "",
    //         colorHex: "",
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${i.sku}`,
    //         size: "",
    //         image: image,
    //       });
    //     } else {
    //       variants.push({
    //         colorName: "",
    //         colorHex: "",
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${i.sku}`,
    //         size: "",
    //       });
    //     }
    //   }
    //   variant = variants;
    // }
    // case 2 if there is color but no size
    // else if (variant[0].colorName != "" && variant[0].size.length === 0) {
    //   let variants = [];
    //   for (let i of variant) {
    //     if (i.image) {
    //       var image = await uploadFile(i.image);
    //       variants.push({
    //         colorName: i.colorName,
    //         colorHex: i.colorHex,
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${i.sku}`,
    //         size: "",
    //         image: image,
    //       });
    //     } else {
    //       variants.push({
    //         colorName: i.colorName,
    //         colorHex: i.colorHex,
    //         actualPrice: i.actualPrice,
    //         discountedPrice: i.discountedPrice,
    //         quantity: i.quantity,
    //         sku: `${i.sku}`,
    //         size: "",
    //       });
    //     }
    //   }
    //   variant = variants;
    // }
    // case if there is size but no color
    // else if (variant[0].colorName === "" && variant[0].size.length != 0) {
    //   let variants = [];
    //   for (var item of variant) {
    //     if (item.image) {
    //       var image = await uploadFile(item.image);
    //       for (var i of item.size) {
    //         variants.push({
    //           colorName: "",
    //           colorHex: "",
    //           actualPrice: i.actualPrice,
    //           discountedPrice: i.discountedPrice,
    //           quantity: item.quantity,
    //           sku: `${item.sku}${i.name}`,
    //           size: i.name,
    //           image: image,
    //         });
    //       }
    //     } else {
    //       for (var i of item.size) {
    //         variants.push({
    //           colorName: "",
    //           colorHex: "",
    //           actualPrice: i.actualPrice,
    //           discountedPrice: i.discountedPrice,
    //           quantity: item.quantity,
    //           sku: `${item.sku}${i.name}`,
    //           size: i.name,
    //         });
    //       }
    //     }
    //   }
    //   variant = variants;
    // }
    // if we have size and color both
    // else if (variant[0].colorName != "" && variant[0].size.length != 0) {
    //   let variants = [];
    //   for (var item of variant) {
    //     if (item.image) {
    //       var image = await uploadFile(item.image);
    //       for (var i of item.size) {
    //         variants.push({
    //           colorName: item.colorName,
    //           colorHex: item.colorHex,
    //           actualPrice: i.actualPrice,
    //           discountedPrice: i.discountedPrice,
    //           quantity: i.quantity,
    //           sku: `${item.sku}${i.name}`,
    //           size: i.name,
    //           image: image,
    //         });
    //       }
    //     } else {
    //       for (var i of item.size) {
    //         variants.push({
    //           colorName: item.colorName,
    //           colorHex: item.colorHex,
    //           actualPrice: i.actualPrice,
    //           discountedPrice: i.discountedPrice,
    //           quantity: i.quantity,
    //           sku: `${item.sku}${i.name}`,
    //           size: i.name,
    //         });
    //       }
    //     }
    //   }
    //   variant = variants;
    // }

    // final update
    if (thumbnail) {
      result = await productsModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            category: mongoose.Types.ObjectId(category),
            subcategory: mongoose.Types.ObjectId(subcategory),
            name,
            title,
            description,
            longDescription,
            isDiscount,
            isDeal,
            dealExpire,
            oneTimeDeal,
            discount,
            variant: variants,
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
            tags,
            addons,
            isFeatured,
          },
        },
        { new: true }
      );
    } else {
      result = await productsModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            category: mongoose.Types.ObjectId(category),
            subcategory: mongoose.Types.ObjectId(subcategory),
            name,
            title,
            description,
            longDescription,
            isDiscount,
            isDeal,
            dealExpire,
            oneTimeDeal,
            discount,
            variant: variants,
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
            tags,
            addons,
          },
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
    const result = await productsModel.deleteOne({ _id: _id });
    return result;
  },
  getMultipleProducts: async (ids) => {
    const list = await productsModel.find(
      { _id: { $in: ids } },
      { _id: 1, name: 1, thumbnail: 1, isFavourite: 1, variant: 1, title: 1 }
    );
    return list;
  },
  logSoldDealProduct: async (product, customerId) => {
    let currentDate = new Date(new Date().toLocaleDateString());
    var productLength = product.length;
    for (let i = 0; i < productLength; i++) {
      productId = product[i].productId;
      quantity = product[i].quantity;
      price = product[i].price;
      sku = product[i].sku;
      size = product[i].size;
      var dealProduct = await productsModel.findOne(
        { _id: productId, isDeal: true, dealExpire: { $gte: currentDate } },
        { dealExpire: 1 }
      );
      if (dealProduct) {
        productId = dealProduct._id;
        dealExpire = dealProduct.dealExpire;
        const dealData = new dealBuyerLogModel({
          customer: customerId,
          product: productId,
          dealExpire: dealExpire,
        });
        await dealData.save();
      }
    }
  },
  updateLogDealProduct: async (product, customerId) => {
    let productIdArr = [];
    for (var i of product) {
      productIdArr.push(i.productId);
    }
    const deal = await dealBuyerLogModel.updateMany({
      customer: customerId,
      product: productIdArr,
    });
    return deal;
  },
  test: async () => {
    let data = await productsModel.find({});
    return data;
  },
  productCategory: async (categoryId) => {
    const result = await productsModel.find({
      category: { $in: categoryId },
    });
    return result;
  },
  productsubCategory: async (subCategoryId) => {
    const result = await productsModel.find({
      subcategory: { $in: subCategoryId },
    });
    return result;
  },
  calculateTax: async (product) => {
    const tax = await productsModel.aggregate([
      {
        $addFields: {
          product: product,
        },
      },
      {
        $match: {
          _id: "product.productId",
        },
      },
      {
        $project: {
          totalTax: {
            $multiply: ["$taxAmount", "$product.quantity"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTax: {
            $sum: "$totalTax",
          },
        },
      },
    ]);
    return tax;
  },
};

module.exports = productsServices;
