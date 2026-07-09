const GENDER_VALUES = ["men", "women", "juniors", "unisex", "cosmetics"];

const COSMETICS_NAME_RE = /cosmetic|herbal/i;

function inferCategoryGender(name, explicitGender) {
    if (explicitGender && GENDER_VALUES.includes(explicitGender)) {
        return explicitGender;
    }

    const normalized = String(name || "").toLowerCase();
    if (COSMETICS_NAME_RE.test(normalized)) return "cosmetics";
    if (/\bmen\b|\bman\b/.test(normalized)) return "men";
    if (/\bwomen\b|\bwoman\b/.test(normalized)) return "women";
    if (/\bkid|\bjunior/.test(normalized)) return "juniors";
    return "unisex";
}

/**
 * Builds a Mongo filter for category.gender based on the home/shop gender tab.
 * Cosmetics categories are matched by gender value or category name.
 */
function buildCategoryGenderQuery(gender) {
    if (!gender) return {};

    if (gender === "cosmetics") {
        return {
            $or: [{ gender: "cosmetics" }, { name: COSMETICS_NAME_RE }],
        };
    }

    if (gender === "men" || gender === "women" || gender === "juniors") {
        return {
            $or: [
                { gender },
                {
                    gender: "unisex",
                    name: { $not: COSMETICS_NAME_RE },
                },
            ],
        };
    }

    return { gender };
}

module.exports = {
    GENDER_VALUES,
    COSMETICS_NAME_RE,
    inferCategoryGender,
    buildCategoryGenderQuery,
};
