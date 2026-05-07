/**
 * Checkout matches orders with `productId` + `variant.sku` (see orderServices.add).
 * Product detail UIs often iterate only `variant.size[]` rows; those subdocs do not
 * store sku in the schema, so we copy the parent variant `sku` onto each size row.
 * If a size row already has `sku` (future schema), that value is kept.
 */

function toPlain(doc) {
    if (doc == null) return doc;
    if (typeof doc.toObject === "function") return doc.toObject();
    return doc;
}

function attachSkuToSizeRows(product) {
    if (!product || !Array.isArray(product.variant)) return product;
    for (const v of product.variant) {
        const parentSku = v && v.sku;
        if (!parentSku || !v.size || !Array.isArray(v.size) || v.size.length === 0) {
            continue;
        }
        v.size = v.size.map((row) => {
            const o = toPlain(row);
            return {
                ...o,
                sku:
                    o.sku != null && o.sku !== ""
                        ? o.sku
                        : parentSku,
            };
        });
    }
    return product;
}

module.exports = { attachSkuToSizeRows };
