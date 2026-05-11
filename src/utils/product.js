const Category = require("../models/Category");

const normalizeIdentifier = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const stringValue = String(value);
  if (/^[0-9a-fA-F]{24}$/.test(stringValue)) {
    return stringValue;
  }

  return /^\d+$/.test(stringValue) ? Number(stringValue) : value;
};

const findCategoryByIdentifier = async (id) => {
  const categoryId = normalizeIdentifier(id);

  return typeof categoryId === "number"
    ? Category.findOne({ shortId: categoryId })
    : Category.findById(categoryId);
};

const buildProductFilters = async (query = {}) => {
  const filter = {};

  if (query.category !== undefined && query.category !== null && query.category !== "") {
    const category = await findCategoryByIdentifier(query.category);
    filter.category = category ? category._id : null;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) {
      filter.price.$gte = Number(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      filter.price.$lte = Number(query.maxPrice);
    }
  }

  return filter;
};

const buildPagination = ({ page = 1, limit = 10 }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

module.exports = {
  buildProductFilters,
  buildPagination,
  findCategoryByIdentifier,
};
