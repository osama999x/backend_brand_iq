const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const productModel = require("../model/productsModel");
const categoryModel = require("../model/categoryModel");
const subcategoryModel = require("../model/subCategoryModel");
const promotionCampaignModel = require("../model/promotionCampaignModel");
// const productsImagesModel = require("../model/productsImagesModel");

const homeServices = {
  get: async () => {
    try {
      const categories = await categoryModel.find(
        { isFeatured: true, isActive: true },
        projection.homecategoryprojection
      );
      // .limit(6);
      // .skip((page - 1) * limit)
      // .limit(limit)
      // .sort("name");
      const subcategories = await subcategoryModel
        .find({ isFeatured: true }, projection.homesubcategoryprojection)
        .limit(6);
      // .skip(page * limit)
      // .limit(limit)
      // .sort("name");
      let products = await productModel
        .find(
          {
            $and: [
              { isDeal: false },
              { isActive: true },
              {
                $or: [{ isFeatured: true }, { isDiscount: true }],
              },
            ],
          },
          projection.hometrendprojection
        )
        .lean();
      if (products.length != 0) {
        products = products.map((item) => {
          item.actualPrice = item.variant[0].actualPrice;
          item.discountedPrice = item.variant[0].discountedPrice;
          delete item.variant;
          return item;
        });
      }
      let currentDate = new Date(new Date().toLocaleDateString());
      let deals = await productModel
        .find(
          {
            isFeatured: true,
            isDiscount: false,
            isDeal: true,
            isActive: true,
            expireDate: { $gte: currentDate },
          },
          projection.hometrendprojection
        )
        .limit(6)
        .lean();
      if (deals.length != 0) {
        deals = deals.map((item) => {
          discount = item.discount;
          actualPrice = item.variant[0].actualPrice;
          item.actualPrice = actualPrice;
          item.dealPrice = actualPrice - discount;
          delete item.variant;
          return item;
        });
      }

      const campaign = await promotionCampaignModel.find(
        { activeFrom: { $lte: currentDate }, activeTo: { $gte: currentDate } },
        projection.projection
      );
      const result = {
        categories: categories,
        subcategories: subcategories,
        allProducts: products,
        campaign: campaign,
        deals: deals,
      };
      return result;
    } catch (error) {
      throw new Error("Some data missing");
    }
  },
  getLimitedProduct: async () => {
    const categories = await categoryModel
      .find({ isActive: true }, projection.homecategoryprojection)
      .limit(10);
    // .skip((page - 1) * limit)
    // .limit(limit)
    // .sort("name");
    const subcategories = await subcategoryModel
      .find({ isActive: true }, projection.homesubcategoryprojection)
      .limit(10);
    // .skip(page * limit)
    // .limit(limit)
    // .sort("name");
    let products = await productModel
      .find(
        {
          $and: [
            { isDeal: false },
            { isActive: true },
            {
              $or: [{ isFeatured: true }, { isDiscount: true }],
            },
          ],
        },
        projection.hometrendprojection
      )
      .limit(10)
      .lean();
    if (products.length != 0) {
      products = products.map((item) => {
        item.actualPrice = item.variant[0].actualPrice;
        item.discountedPrice = item.variant[0].discountedPrice;
        delete item.variant;
        return item;
      });
    }
    // .skip(page * limit)
    // .limit(limit);
    const result = {
      categories: categories,
      subcategories: subcategories,
      products: products,
    };
    return result;
  },
  bannerSearchProductByTags: async (type, price) => {
    let query = {};

    if (type === "newArrival") {
      query.isFeatured = true;
    } else if (type === "isSale") {
      query.isSale = true;
    } else if (type === "discount") {
      query.isDiscount = true;
    } else if (type === "underPrice") {
      query["variant.actualPrice"] = { $lt: price };
    }

    let products = await productModel
      .find(query, projection.hometrendprojection)
      .limit(10)
      .lean();
    if (products.length != 0) {
      products = products.map((item) => {
        item.actualPrice = item.variant[0].actualPrice;
        item.discountedPrice = item.variant[0].discountedPrice;
        delete item.variant;
        return item;
      });
    };
    return products;
  },
  getRecentProduct: async () => {
    let products = await productModel
      .find(
        {
          $and: [
            { isDeal: false },
            { isActive: true },
            {
              $or: [{ isFeatured: true }, { isDiscount: true }],
            },
          ],
        },
        projection.hometrendprojection
      )
      .limit(10)
      .sort({ $natural: -1 })
      .lean();
    if (products.length != 0) {
      products = products.map((item) => {
        item.actualPrice = item.variant[0].actualPrice;
        item.discountedPrice = item.variant[0].discountedPrice;
        delete item.variant;
        return item;
      });
    }
    return products;
  },
  searchProductByTags: async (text) => {
    const products = await productModel.find(
      {
        tags: { $regex: new RegExp(text), $options: "si" },
        isActive: true,
      },
      { tags: 1 }
    );
    return products;
  },
  getProductByTags: async (tags) => {
    let today = new Date(new Date());
    let products = await productModel.aggregate([
      {
        $match: { tags: { $eq: tags }, isActive: true },
        // $match: { name: { $regex: new RegExp(text), $options: "si" } },
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
          name: 1,
          thumbnail: 1,
          isDeal: 1,
          discount: 1,
          isDiscount: 1,
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
    ]);
    if (products.length != 0) {
      products = products.map((item) => {
        if (item.isDeal === true) {
          // actualPrice = item.variant[0].actualPrice;
          // discountedPrice = item.variant[0].actualPrice - item.discount;
          var price = item.variant[0].actualPrice - item.discount;
        } else if (item.isDiscount === true) {
          //actualPrice = item.variant[0].actualPrice;
          //discountedPrice = item.variant[0].discountedPrice;
          price = item.variant[0].discountedPrice;
        } else {
          //actualPrice = item.variant[0].actualPrice;
          //discountedPrice = item.variant[0].discountedPrice;
          if (item.variant[0].discountedPrice > 0) {
            price = item.variant[0].discountedPrice;
          } else {
            price = item.variant[0].actualPrice;
          }
        }
        item.price = price;
        //item.discountedPrice = discountedPrice;
        delete item.variant;
        delete item.isDiscount;
        delete item.discount;
        delete item.isDeal;

        return item;
      });
    }

    // .find(
    //   { name: { $regex: new RegExp(text), $options: "si" } },
    //   { name: 1, variant: 1, thumbnail: 1 }
    // )
    // .limit(10)
    // .lean();
    // if (products.length != 0) {
    //   products = products.map((item) => {
    //     if (item.isDiscount === true) {
    //       productName = item.name;
    //       price = item.variant[0].discountedPrice;
    //       thumbnail = item.thumbnail;
    //     } else {
    //       productName = item.name;
    //       price = item.variant[0].actualPrice;
    //       thumbnail = item.thumbnail;
    //     }
    //     delete item;
    //     return { name: productName, price: price, thumbnail: thumbnail };
    //   });
    // }
    return products;
  },
  getAllCategories: async () => {
    const categories = await categoryModel.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "category",
          as: "subcategories",
        },
      },
      {
        $project: {
          isActive: 0,
          isFeatured: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "subcategories.isActive": 0,
          "subcategories.isFeatured": 0,
          "subcategories.createdAt": 0,
          "subcategories.updatedAt": 0,
          "subcategories.__v": 0,
        },
      },
    ]);
    return categories;
  },
};

module.exports = homeServices;
