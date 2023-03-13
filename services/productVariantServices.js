const uploadFile = require("../utils/uploadFile");

const productVariantServices = {
  handleNoColorNoSize: async (variants, isDiscount) => {
    let result = [];
    for (let i of variants) {
      if (i.image) {
        var image = await uploadFile(i.image);
      } else {
        image = "";
      }
      result.push({
        colorName: "",
        colorHex: "",
        actualPrice: i.actualPrice,
        discountedPrice: isDiscount ? i.discountedPrice : 0,
        quantity: i.quantity,
        sku: `${i.sku}`,
        size: "",
        image: image,
      });
    }
    return result;
  },
  handleColorNoSize: async (variants, isDiscount) => {
    let result = [];
    for (let i of variants) {
      if (i.image) {
        var image = await uploadFile(i.image);
      } else {
        image = "";
      }
      result.push({
        colorName: i.colorName,
        colorHex: i.colorHex,
        actualPrice: i.actualPrice,
        discountedPrice: isDiscount ? i.discountedPrice : 0,
        quantity: i.quantity,
        sku: `${i.sku}`,
        size: "",
        image: image,
      });
    }
    return result;
  },
  handleNoColorSize: async (variants, isDiscount) => {
    let result = [];
    for (let i of variants) {
      if (i.image) {
        var image = await uploadFile(i.image);
      } else {
        image = "";
      }
      for (let size of i.size) {
        result.push({
          colorName: "",
          colorHex: "",
          actualPrice: size.actualPrice,
          discountedPrice: isDiscount ? size.discountedPrice : 0,
          quantity: size.quantity,
          sku: `${i.sku}${size.name}`,
          size: size.name,
          image: image,
        });
      }
    }
    return result;
  },
  handleColorSize: async (variants, isDiscount) => {
    let result = [];
    for (let i of variants) {
      if (i.image) {
        var image = await uploadFile(i.image);
      } else {
        image = "";
      }
      for (let size of i.size) {
        result.push({
          colorName: i.colorName,
          colorHex: i.colorHex,
          actualPrice: size.actualPrice,
          discountedPrice: isDiscount ? size.discountedPrice : 0,
          quantity: size.quantity,
          sku: `${i.sku}${size.name}`,
          size: size.name,
          image: image,
        });
      }
    }
    return result;
  },
};
module.exports = productVariantServices;
