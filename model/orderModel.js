const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const { generateLongLowercaseUuid, generateShortUuid } = require("custom-uuid");
const { boolean } = require("zod");

const schema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        product: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                sku: {
                    type: String,
                    required: true,
                },
                size: {
                    type: String,
                },
                colour: {
                    type: String,
                },
                returnStatus: {
                    type: Boolean,
                    default: false,
                }
            },
        ],
        // address: {
        //     type: String,
        //     required: true,
        // },
        // city: {
        //     type: String,
        //     required: true,
        // },
        // contact: {
        //     type: Number,
        //     required: true,
        // },
        status: {
            type: String,
            default: "Pending",
        },
        webStatus: {
            type: String,
            default: "Pending",
        },
        totalBill: {
            type: Number,
            required: true,
        },//including TotalBill
        totalAmount: {
            type: Number,
            required: true,
        },
        //WithOut tax amount and Shipping Amount
        tax: {
            type: Number,
            default: 0
        },
        redeemValue: {
            type: Number,
        },
        paymentMode: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
        trackingId: {
            type: String,
            default: null,
        },
        placedOn: {
            type: Date,
            default: Date.now(),
        },
        isDeletedByUser: {
            type: Number,
            default: 0,
        },
        isDeletedByAdmin: {
            type: Number,
            default: 0,
        },
        channel: {
            type: String,
            required: true,
        },
        payment: {
            type: Boolean,
            default: false,
        },
        couponCode: {
            type: String,
            default: "00",
        },
        isAdminReturn: {
            type: Boolean,
            default: false,
        },
        courierType: {
            type: String,
            default: null,
        },
        isDeliver: {
            type: Boolean,
            default: false,
        }
        , Reigon: {
            type: Schema.Types.ObjectId,
            ref: "TaxType",
        },
        billingAddress: {
            firstName: {
                type: String,
            },
            lastName: {
                type: String,
            },
            email: {
                type: String,
            },
            contact: {
                type: String,
            }, addressLine: {
                type: String,
            },
            zipCode: {
                type: String
            },
            province: {
                type: String
            }, billingRegion: {
                type: String
            }
        }, shippingAddress: {
            firstName: {
                type: String,
            },
            lastName: {
                type: String,
            },
            email: {
                type: String,
            },
            contact: {
                type: String,
            },
            addressLine: {
                type: String,
            },
            zipCode: {
                type: String
            },
            province: {
                type: String
            }, Shippingregion: {
                type: String
            }
        },
        points: {
            type: Number,
        }
    },
    { timestamps: true }
);

const orderModel = new mongoose.model("Order", schema);
module.exports = orderModel;
