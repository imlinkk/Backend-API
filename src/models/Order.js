const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    shortId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        if (ret.shortId !== undefined && ret.shortId !== null) {
          ret.id = ret.shortId;
          delete ret._id;
        } else if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.shortId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.pre("validate", async function setShortId(next) {
  if (this.isNew && (this.shortId === undefined || this.shortId === null)) {
    try {
      const { getNextSequence } = require("../utils/sequence");
      this.shortId = await getNextSequence("order");
    } catch (err) {
      return next(err);
    }
  }

  return next();
});

module.exports = mongoose.model("Order", orderSchema);
