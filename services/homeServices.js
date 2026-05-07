const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");
const productModel = require("../model/productsModel");
const categoryModel = require("../model/categoryModel");
const subcategoryModel = require("../model/subCategoryModel");
const promotionCampaignModel = require("../model/promotionCampaignModel");
const promotionModel = require("../model/promotionModel");
const { attachSkuToSizeRows } = require("../utils/variantSkuEnrichment");
const homeHeroServices = require("./homeHeroServices");

// ─── Shared Helpers ──────────────────────────────────────────────────────────

/**
 * Returns the display price for a variant.
 * New format: prices live inside variant.size[].
 * Legacy format: prices live directly on the variant.
 */
const getVariantPrice = (variant) => {
    if (variant.size && variant.size.length > 0) {
        const first = variant.size[0];
        return {
            actualPrice: first.actualPrice,
            discountedPrice: first.discountedPrice || 0,
        };
    }
    return {
        actualPrice: variant.actualPrice,
        discountedPrice: variant.discountedPrice || 0,
    };
};

const fetchActivePromotions = async () => {
    const currentDate = new Date();
    return promotionModel
        .find({ expireDate: { $gt: currentDate }, status: "active" })
        .populate("product");
};

const applyPromotionPrices = (products, promotions) => {
    products.forEach((item) => {
        const firstVariant = item.variant[0];
        const { actualPrice, discountedPrice } = getVariantPrice(firstVariant);

        item.actualPrice = actualPrice;
        item.discountedPrice = discountedPrice || null;
        item.promotionPrice = null;
        item.promotionDiscount = null;

        if (promotions.length !== 0) {
            const matched = promotions.find((promo) =>
                promo.product.some((pid) => pid.equals(item._id))
            );
            if (matched) {
                item.promotionPrice =
                    actualPrice - (actualPrice / 100) * matched.discount;
                item.promotionDiscount = matched.discount;
            }
        }

        delete item.variant;
    });
};

const paginatedResult = (total, page, limit, products) => ({
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    products,
});

/**
 * Builds the MongoDB sort object from a sortBy string.
 * newest     → createdAt descending (default)
 * price_asc  → first variant actualPrice ascending
 * price_desc → first variant actualPrice descending
 * popular    → ratingCount descending
 */
const buildSort = (sortBy) => {
    switch (sortBy) {
        case "price_asc":  return { "variant.0.actualPrice": 1 };
        case "price_desc": return { "variant.0.actualPrice": -1 };
        case "popular":    return { ratingCount: -1, createdAt: -1 };
        default:           return { createdAt: -1 };
    }
};

/**
 * Merges optional filters (minPrice, maxPrice, isSale, inStock) into an
 * existing Mongoose query object. Mutates and returns the same object.
 */
const applyFilters = (query, { minPrice, maxPrice, isSale, inStock } = {}) => {
    if (minPrice != null || maxPrice != null) {
        const priceRange = {};
        if (minPrice != null) priceRange.$gte = minPrice;
        if (maxPrice != null) priceRange.$lte = maxPrice;
        query["variant.actualPrice"] = priceRange;
    }
    if (isSale === true)   query.isSale = true;
    if (inStock === true)  query.inStock = true;
    return query;
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSidebarFilterOptions = async (gender) => {
    const categoryQuery = { isActive: true };
    if (gender) categoryQuery.gender = gender;

    const categories = await categoryModel
        .find(categoryQuery, { _id: 1, name: 1, icon: 1, gender: 1 })
        .sort({ createdAt: -1 })
        .lean();

    const subQuery = { isActive: true };
    if (categories.length > 0) subQuery.category = { $in: categories.map((c) => c._id) };
    const subcategories = await subcategoryModel
        .find(subQuery, { _id: 1, name: 1, icon: 1, category: 1 })
        .sort({ createdAt: -1 })
        .lean();

    const priceRanges = [
        { id: "under_3000", label: "Under PKR 3,000", min: null, max: 3000 },
        { id: "3000_5000", label: "PKR 3,000 - 5,000", min: 3000, max: 5000 },
        { id: "5000_7000", label: "PKR 5,000 - 7,000", min: 5000, max: 7000 },
        { id: "over_7000", label: "Over PKR 7,000", min: 7000, max: null },
    ];

    return {
        categories,
        subcategories,
        genders: ["men", "women", "juniors", "unisex"],
        priceRanges,
    };
};

// ─── Service Methods ──────────────────────────────────────────────────────────

const homeServices = {

    get: async (gender, filters = {}) => {
        const currentDate = new Date();
        const categoryMatch = { isActive: true, isFeatured: true };
        if (gender) categoryMatch.gender = gender;

        // When gender is provided, pre-fetch matching category IDs to filter featuredProducts
        let featuredProductQuery = {
            isDeal: false,
            isActive: true,
            $or: [{ isFeatured: true }, { isDiscount: true }],
        };
        if (gender) {
            const genderCatIds = await categoryModel.find({ gender, isActive: true }, { _id: 1 }).lean();
            featuredProductQuery.category = { $in: genderCatIds.map((c) => c._id) };
        }
        featuredProductQuery = applyFilters(featuredProductQuery, filters);
        if (filters && filters.keyword) {
            const kw = escapeRegex(String(filters.keyword).trim()).slice(0, 64);
            const re = new RegExp(kw, "i");
            featuredProductQuery.$and = [
                ...(featuredProductQuery.$and || []),
                { $or: [{ name: { $regex: re } }, { title: { $regex: re } }, { tags: { $regex: re } }] },
            ];
        }
        const sort = buildSort(filters.sortBy);

        const lookupExtraMatch = {};
        if (filters && (filters.minPrice != null || filters.maxPrice != null)) {
            const priceRange = {};
            if (filters.minPrice != null) priceRange.$gte = filters.minPrice;
            if (filters.maxPrice != null) priceRange.$lte = filters.maxPrice;
            lookupExtraMatch["variant.actualPrice"] = priceRange;
        }
        if (filters && filters.isSale === true) lookupExtraMatch.isSale = true;
        if (filters && filters.inStock === true) lookupExtraMatch.inStock = true;
        if (filters && filters.keyword) {
            const kw = escapeRegex(String(filters.keyword).trim()).slice(0, 64);
            const re = new RegExp(kw, "i");
            lookupExtraMatch.$or = [{ name: { $regex: re } }, { title: { $regex: re } }, { tags: { $regex: re } }];
        }

        // Run all three DB queries in parallel
        const [hero, filterOptions, categories, featuredProducts, campaigns, promotions] = await Promise.all([
            homeHeroServices.getActive(gender),
            buildSidebarFilterOptions(gender),
            // ── Category → SubCategory → Products (nested lookup) ──────────────
            categoryModel.aggregate([
                { $match: categoryMatch },
                {
                    $lookup: {
                        from: "subcategories",
                        let: { categoryId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$category", "$$categoryId"] },
                                            { $eq: ["$isActive", true] },
                                        ],
                                    },
                                },
                            },
                            // Nested: products under each subcategory
                            {
                                $lookup: {
                                    from: "products",
                                    let: { subCatId: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $and: [
                                                    {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$subcategory", "$$subCatId"] },
                                                                { $eq: ["$isActive", true] },
                                                            ],
                                                        },
                                                    },
                                                    lookupExtraMatch,
                                                ],
                                            },
                                        },
                                        { $sort: sort },
                                        { $limit: 10 },
                                        {
                                            $project: {
                                                name: 1,
                                                title: 1,
                                                thumbnail: 1,
                                                variant: 1,
                                                isSale: 1,
                                                isDeal: 1,
                                                inStock: 1,
                                                ratingCount: 1,
                                                sizeGuide: 1,
                                                sizeFit: 1,
                                                deliveryReturns: 1,
                                            },
                                        },
                                    ],
                                    as: "products",
                                },
                            },
                            {
                                $project: {
                                    name: 1,
                                    icon: 1,
                                    thumbnail: 1,
                                    description: 1,
                                    products: 1,
                                },
                            },
                        ],
                        as: "subCategory",
                    },
                },
                {
                    $addFields: {
                        // Total active product count across all subcategories
                        productCount: {
                            $sum: {
                                $map: {
                                    input: "$subCategory",
                                    as: "sub",
                                    in: { $size: "$$sub.products" },
                                },
                            },
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        name: 1,
                        icon: 1,
                        thumbnail: 1,
                        description: 1,
                        gender: 1,
                        productCount: 1,
                        subCategory: 1,
                    },
                },
            ]),
            // ── Flat featured products strip ────────────────────────────────────
            productModel
                .find(featuredProductQuery, projection.hometrendprojection)
                .sort(sort)
                .limit(10)
                .lean(),
            // ── Active promotion campaigns ──────────────────────────────────────
            promotionCampaignModel.aggregate([
                {
                    $match: {
                        activeFrom: { $lte: currentDate },
                        activeTo: { $gte: currentDate },
                    },
                },
                { $project: projection.projection },
                { $sort: { createdAt: -1 } },
            ]),
            // ── Active promotions (shared for both price applications below) ────
            fetchActivePromotions(),
        ]);

        // Apply promotion prices to the flat featured products strip
        if (featuredProducts.length > 0) {
            applyPromotionPrices(featuredProducts, promotions);
        }

        // Apply variant prices + promotions to products nested inside subcategories
        categories.forEach((cat) => {
            cat.subCategory.forEach((sub) => {
                sub.products.forEach((product) => {
                    if (!product.variant || product.variant.length === 0) return;
                    const { actualPrice, discountedPrice } = getVariantPrice(product.variant[0]);
                    product.actualPrice = actualPrice;
                    product.discountedPrice = discountedPrice || null;
                    const matched = promotions.find((p) =>
                        p.product.some((pid) => pid.equals(product._id))
                    );
                    product.promotionPrice = matched
                        ? +(actualPrice - (actualPrice / 100) * matched.discount).toFixed(2)
                        : null;
                    product.promotionDiscount = matched ? matched.discount : null;
                    delete product.variant;
                });
            });
        });

        return { hero, filterOptions, categories, featuredProducts, campaigns };
    },

    getRecentProduct: async (page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const query = applyFilters(
            { isDeal: false, isActive: true, $or: [{ isFeatured: true }, { isDiscount: true }] },
            filters
        );
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    getNewArrivals: async (page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const query = applyFilters({ isActive: true }, filters);
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    getFeaturedProducts: async (page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const query = applyFilters({ isFeatured: true, isActive: true }, filters);
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    getDeals: async (page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const currentDate = new Date();
        const query = applyFilters(
            { isDeal: true, isActive: true, dealExpire: { $gte: currentDate } },
            filters
        );
        const sort = buildSort(filters.sortBy) ;

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            products.forEach((item) => {
                const { actualPrice } = getVariantPrice(item.variant[0]);
                item.actualPrice = actualPrice;
                item.dealPrice = actualPrice - item.discount;
                delete item.variant;
            });
        }

        return paginatedResult(total, page, limit, products);
    },

    getProductsByCategory: async (categoryId, page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const catId = new mongoose.Types.ObjectId(categoryId);
        const query = applyFilters({ category: catId, isActive: true }, filters);
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    getProductsBySubCategory: async (subCategoryId, page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const subCatId = new mongoose.Types.ObjectId(subCategoryId);
        const query = applyFilters({ subcategory: subCatId, isActive: true }, filters);
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    getRelatedProducts: async (productId, page = 1, limit = 10, filters = {}) => {
        const skip = (page - 1) * limit;
        const pid = new mongoose.Types.ObjectId(productId);

        const sourceProduct = await productModel
            .findById(pid, { subcategory: 1, category: 1 })
            .lean();

        if (!sourceProduct) {
            return paginatedResult(0, page, limit, []);
        }

        const query = applyFilters(
            { _id: { $ne: pid }, isActive: true, subcategory: sourceProduct.subcategory },
            filters
        );
        const sort = buildSort(filters.sortBy);

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            const promotions = await fetchActivePromotions();
            applyPromotionPrices(products, promotions);
        }

        return paginatedResult(total, page, limit, products);
    },

    searchProductByTags: async (text, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const regex = new RegExp(text, "si");
        const query = {
            isActive: true,
            $or: [
                { tags: { $regex: regex } },
                { name: { $regex: regex } },
                { title: { $regex: regex } },
            ],
        };

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            products.forEach((item) => {
                const { actualPrice, discountedPrice } = getVariantPrice(item.variant[0]);
                item.actualPrice = actualPrice;
                item.discountedPrice = discountedPrice || null;
                delete item.variant;
            });
        }

        return paginatedResult(total, page, limit, products);
    },

    getProductByTags: async (tags, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const today = new Date();

        const products = await productModel.aggregate([
            { $match: { $text: { $search: tags }, isActive: true } },
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
                $unwind: { path: "$promotion", preserveNullAndEmptyArrays: true },
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
                            as: "v",
                            in: {
                                actualPrice: "$$v.actualPrice",
                                discountedPrice: {
                                    $ifNull: [
                                        {
                                            $subtract: [
                                                "$$v.actualPrice",
                                                {
                                                    $multiply: [
                                                        "$promotion.discount",
                                                        { $divide: ["$$v.actualPrice", 100] },
                                                    ],
                                                },
                                            ],
                                        },
                                        "$$v.discountedPrice",
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        if (products.length !== 0) {
            products.forEach((item) => {
                const v = item.variant[0];
                if (item.isDeal) {
                    item.price = v.actualPrice - item.discount;
                } else if (item.isDiscount || v.discountedPrice > 0) {
                    item.price = v.discountedPrice;
                } else {
                    item.price = v.actualPrice;
                }
                delete item.variant;
                delete item.isDiscount;
                delete item.discount;
                delete item.isDeal;
            });
        }

        return products;
    },

    bannerSearchProductByTags: async (type, price, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const query = { isActive: true };

        if (type === "newArrival") query.isFeatured = true;
        else if (type === "isSale") query.isSale = true;
        else if (type === "discount") query.isDiscount = true;
        else if (type === "underPrice") query["variant.actualPrice"] = { $lt: Number(price) };

        const [total, products] = await Promise.all([
            productModel.countDocuments(query),
            productModel.find(query, projection.hometrendprojection).skip(skip).limit(limit).lean(),
        ]);

        if (products.length !== 0) {
            products.forEach((item) => {
                const { actualPrice, discountedPrice } = getVariantPrice(item.variant[0]);
                item.actualPrice = actualPrice;
                item.discountedPrice = discountedPrice || null;
                delete item.variant;
            });
        }

        return paginatedResult(total, page, limit, products);
    },

    getAllCategories: async (gender) => {
        const match = { isActive: true };
        if (gender) match.gender = gender;
        return categoryModel.aggregate([
            { $match: match },
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
    },

    getSubCategoriesByCategory: async (categoryId) => {
        const catId = new mongoose.Types.ObjectId(categoryId);
        return subcategoryModel
            .find(
                { category: catId, isActive: true },
                { name: 1, icon: 1, thumbnail: 1, description: 1 }
            )
            .lean();
    },

    getProductDetail: async (productId) => {
        const id = new mongoose.Types.ObjectId(productId);
        const currentDate = new Date();

        const [productArr, promotion] = await Promise.all([
            productModel.aggregate([
                { $match: { _id: id, isActive: true } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1, icon: 1, thumbnail: 1, gender: 1 } }],
                        as: "category",
                    },
                },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "subcategory",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1, icon: 1, thumbnail: 1 } }],
                        as: "subcategory",
                    },
                },
                {
                    $addFields: {
                        category: { $arrayElemAt: ["$category", 0] },
                        subcategory: { $arrayElemAt: ["$subcategory", 0] },
                        averageRating: {
                            $cond: [
                                { $gt: ["$ratingCount", 0] },
                                { $divide: ["$ratingNumber", "$ratingCount"] },
                                0,
                            ],
                        },
                    },
                },
                {
                    $project: {
                        name: 1,
                        title: 1,
                        description: 1,
                        longDescription: 1,
                        sizeGuide: 1,
                        sizeFit: 1,
                        deliveryReturns: 1,
                        thumbnail: 1,
                        images: 1,
                        vendor: 1,
                        isSale: 1,
                        isDeal: 1,
                        dealExpire: 1,
                        discount: 1,
                        inStock: 1,
                        isFeatured: 1,
                        isFavourite: 1,
                        tags: 1,
                        ratingCount: 1,
                        averageRating: 1,
                        isTaxable: 1,
                        taxAmount: 1,
                        isPercentage: 1,
                        metaData: 1,
                        metaDescription: 1,
                        variant: 1,
                        addons: 1,
                        category: 1,
                        subcategory: 1,
                    },
                },
            ]),
            promotionModel.findOne(
                { product: id, expireDate: { $gt: currentDate }, status: "active" },
                { discount: 1 }
            ),
        ]);

        if (!productArr || productArr.length === 0) return null;

        const result = productArr[0];

        result.promotionPrice = null;
        result.promotionDiscount = null;
        if (promotion && result.variant && result.variant.length > 0) {
            const { actualPrice } = getVariantPrice(result.variant[0]);
            result.promotionPrice = +(actualPrice - (actualPrice / 100) * promotion.discount).toFixed(2);
            result.promotionDiscount = promotion.discount;
        }

        attachSkuToSizeRows(result);
        return result;
    },

    getActiveCampaigns: async () => {
        const currentDate = new Date();
        return promotionCampaignModel.aggregate([
            {
                $match: {
                    activeFrom: { $lte: currentDate },
                    activeTo: { $gte: currentDate },
                },
            },
            {
                $project: {
                    campaignName: 1,
                    description: 1,
                    banner: 1,
                    activeFrom: 1,
                    activeTo: 1,
                },
            },
            { $sort: { activeFrom: -1 } },
        ]);
    },
};

module.exports = homeServices;
