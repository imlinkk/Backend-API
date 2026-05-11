const mongoose = require("mongoose");
const { createSlug } = require("../utils/slug");

const productSchema = new mongoose.Schema(
  {
    shortId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
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

productSchema.pre("validate", function setSlug(next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = createSlug(this.name);
  }

  return next();
});

productSchema.pre("validate", async function setShortId(next) {
  if (this.isNew && (this.shortId === undefined || this.shortId === null)) {
    try {
      const { getNextSequence } = require("../utils/sequence");
      this.shortId = await getNextSequence("product");
    } catch (err) {
      return next(err);
    }
  }

  return next();
});

module.exports = mongoose.model("Product", productSchema);
