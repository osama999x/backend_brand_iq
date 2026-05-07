const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const homeServices = require("../services/homeServices");

const homeRouter = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    return { page, limit };
};

const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "popular"];
const BANNER_TYPES = ["newArrival", "isSale", "discount", "underPrice"];
const GENDER_VALUES = ["men", "women", "juniors", "unisex"];

/**
 * Parses optional filter query params shared by product listing routes:
 *   sortBy   – one of SORT_OPTIONS (default: "newest")
 *   minPrice – positive number
 *   maxPrice – positive number, must be >= minPrice when both supplied
 *   isSale   – "true" → filter to sale products only
 *   inStock  – "true" → filter to in-stock products only
 *
 * Returns { filters, error } where error is a string message or null.
 */
const parseFilters = (query) => {
    const filters = {};

    if (query.sortBy) {
        if (!SORT_OPTIONS.includes(query.sortBy)) {
            return { filters: null, error: `sortBy must be one of: ${SORT_OPTIONS.join(", ")}` };
        }
        filters.sortBy = query.sortBy;
    }

    if (query.minPrice !== undefined) {
        const min = Number(query.minPrice);
        if (isNaN(min) || min < 0) {
            return { filters: null, error: "minPrice must be a non-negative number" };
        }
        filters.minPrice = min;
    }

    if (query.maxPrice !== undefined) {
        const max = Number(query.maxPrice);
        if (isNaN(max) || max < 0) {
            return { filters: null, error: "maxPrice must be a non-negative number" };
        }
        if (filters.minPrice != null && max < filters.minPrice) {
            return { filters: null, error: "maxPrice must be greater than or equal to minPrice" };
        }
        filters.maxPrice = max;
    }

    if (query.isSale === "true")  filters.isSale  = true;
    if (query.inStock === "true") filters.inStock = true;

    // Optional keyword search (name/title). Accepts either `q` or `keyword`.
    const keyword = (query.q ?? query.keyword ?? "").toString().trim();
    if (keyword) {
        filters.keyword = keyword;
    }

    return { filters, error: null };
};

// ─── Routes ───────────────────────────────────────────────────────────────────

homeRouter.get(
    "/all",
    expressAsyncHandler(async (req, res) => {
        const { gender } = req.query;
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.get(gender, filters);
        res.status(200).json({ msg: "Home Screen", data });
    })
);

homeRouter.get(
    "/newArrivals",
    expressAsyncHandler(async (req, res) => {
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getNewArrivals(page, limit, filters);
        res.status(200).json({ msg: "New Arrivals", data });
    })
);

homeRouter.get(
    "/recentProduct",
    expressAsyncHandler(async (req, res) => {
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getRecentProduct(page, limit, filters);
        res.status(200).json({ msg: "Recent Products", data });
    })
);

homeRouter.get(
    "/featuredProducts",
    expressAsyncHandler(async (req, res) => {
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getFeaturedProducts(page, limit, filters);
        res.status(200).json({ msg: "Featured Products", data });
    })
);

homeRouter.get(
    "/deals",
    expressAsyncHandler(async (req, res) => {
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getDeals(page, limit, filters);
        res.status(200).json({ msg: "Deals", data });
    })
);

homeRouter.get(
    "/searchProduct",
    expressAsyncHandler(async (req, res) => {
        const { text } = req.query;
        if (!text || !text.trim()) {
            return res.status(400).json({ msg: "text query param is required" });
        }
        const { page, limit } = parsePagination(req.query);
        const data = await homeServices.searchProductByTags(text.trim(), page, limit);
        res.status(200).json({ msg: "Search Results", data });
    })
);

homeRouter.get(
    "/getProductByTags",
    expressAsyncHandler(async (req, res) => {
        const { tags } = req.query;
        if (!tags || !tags.trim()) {
            return res.status(400).json({ msg: "tags query param is required" });
        }
        const { page, limit } = parsePagination(req.query);
        const data = await homeServices.getProductByTags(tags.trim(), page, limit);
        res.status(200).json({ msg: "Products", data });
    })
);

homeRouter.get(
    "/bannerSearchProduct",
    expressAsyncHandler(async (req, res) => {
        const { type, price } = req.query;
        if (!type || !BANNER_TYPES.includes(type)) {
            return res.status(400).json({
                msg: `type is required and must be one of: ${BANNER_TYPES.join(", ")}`,
            });
        }
        if (type === "underPrice" && (!price || isNaN(Number(price)))) {
            return res.status(400).json({ msg: "A valid numeric price is required for underPrice type" });
        }
        const { page, limit } = parsePagination(req.query);
        const data = await homeServices.bannerSearchProductByTags(type, price, page, limit);
        res.status(200).json({ msg: "Products", data });
    })
);

homeRouter.get(
    "/getAllCategories",
    expressAsyncHandler(async (req, res) => {
        const { gender } = req.query;
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const data = await homeServices.getAllCategories(gender);
        res.status(200).json({ msg: "Categories", data });
    })
);

homeRouter.get(
    "/subCategoriesByCategory",
    expressAsyncHandler(async (req, res) => {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ msg: "categoryId is required" });
        }
        const data = await homeServices.getSubCategoriesByCategory(categoryId);
        res.status(200).json({ msg: "SubCategories", data });
    })
);

homeRouter.get(
    "/productsByCategory",
    expressAsyncHandler(async (req, res) => {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ msg: "categoryId is required" });
        }
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getProductsByCategory(categoryId, page, limit, filters);
        res.status(200).json({ msg: "Products by Category", data });
    })
);

homeRouter.get(
    "/productsBySubCategory",
    expressAsyncHandler(async (req, res) => {
        const { subCategoryId } = req.query;
        if (!subCategoryId) {
            return res.status(400).json({ msg: "subCategoryId is required" });
        }
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getProductsBySubCategory(subCategoryId, page, limit, filters);
        res.status(200).json({ msg: "Products by SubCategory", data });
    })
);

homeRouter.get(
    "/relatedProducts",
    expressAsyncHandler(async (req, res) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ msg: "productId is required" });
        }
        const { page, limit } = parsePagination(req.query);
        const { filters, error } = parseFilters(req.query);
        if (error) return res.status(400).json({ msg: error });
        const data = await homeServices.getRelatedProducts(productId, page, limit, filters);
        res.status(200).json({ msg: "Related Products", data });
    })
);

homeRouter.get(
    "/productDetail",
    expressAsyncHandler(async (req, res) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ msg: "productId is required" });
        }
        const data = await homeServices.getProductDetail(productId);
        if (!data) {
            return res.status(404).json({ msg: "Product not found" });
        }
        res.status(200).json({ msg: "Product Detail", data });
    })
);

homeRouter.get(
    "/activeCampaigns",
    expressAsyncHandler(async (req, res) => {
        const data = await homeServices.getActiveCampaigns();
        res.status(200).json({ msg: "Active Campaigns", data });
    })
);

module.exports = homeRouter;
