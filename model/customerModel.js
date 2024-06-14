const mongoose = require("mongoose");
const { isValidPassword } = require("mongoose-custom-validators");
const Schema = mongoose.Schema;
const schema = new Schema(
    {
        firstName: {
            type: String,

        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: "Please enter a valid email",
            },
        },
        password: {
            type: String,
            //required: true,
            validate: {
                validator: isValidPassword,
                message:
                    "Password must have at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
            },
        },
        cnic: {
            type: String,
        },
        contact: {
            type: String,

        },
        province: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        address: {
            type: String,

        },
        gender: {
            type: String,
        },
        image: {
            type: String,
            default: "images/profile.png",
        },
        isVarified: {
            type: Boolean,
            default: false,
        },
        points: {
            type: Number,
            default: 0,
            min: 0,
        },
        membershipCategory: {
            type: String,
            default: null,
        },
        fcmToken: {
            type: String,
            default: null,
        },
        token: {
            type: String,
            default: null,
        },
        openId: {
            type: String,
            unique: true,
            required: true

        },
        zindigiWallet: {
            zindigiWalletNumber: {
                type: String,
                default: null,
            },
            title: { type: String, default: null },
            linked: {
                type: Boolean,
                default: false,
            },
        },
        reigon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TaxType",
        }
    },
    { timestamps: true }
);

const customerModel = new mongoose.model("Customer", schema);
module.exports = customerModel;
