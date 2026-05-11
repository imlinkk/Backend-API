require("dotenv").config();
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");
const Review = require("../src/models/Review");
const Counter = require("../src/models/Counter");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin@123",
      role: "admin",
    });

    const customer = await User.create({
      name: "Demo Customer",
      email: "user@example.com",
      password: "User@123",
      role: "user",
    });

    const categorySeeds = [
      {
        name: "Electronics",
        description: "Devices, accessories, and tech products",
      },
      {
        name: "Fashion",
        description: "Clothing, shoes, and lifestyle goods",
      },
      {
        name: "Home & Living",
        description: "Furniture and home improvement items",
      },
    ];

    const categories = [];
    for (const categoryData of categorySeeds) {
      categories.push(await Category.create(categoryData));
    }

    const productSeeds = [
      {
        name: "Wireless Headphones Pro",
        description:
          "Premium wireless headphones with active noise cancellation and long battery life.",
        price: 149.99,
        stock: 35,
        category: categories[0]._id,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        ],
      },
      {
        name: "Minimal Everyday Backpack",
        description:
          "Water-resistant backpack with padded laptop compartment for daily commuting.",
        price: 59.5,
        stock: 50,
        category: categories[1]._id,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        ],
      },
      {
        name: "Ergonomic Desk Lamp",
        description:
          "Adjustable LED desk lamp with touch controls and three brightness modes.",
        price: 42,
        stock: 28,
        category: categories[2]._id,
        images: [
          "https://images.unsplash.com/photo-1517705008128-361805f42e86",
        ],
      },
    ];

    const products = [];
    for (const productData of productSeeds) {
      products.push(await Product.create(productData));
    }

    console.log("Seed completed successfully.");
    console.log("Admin:", admin.email, "/ Admin@123");
    console.log("User:", customer.email, "/ User@123");
    console.log("Categories:", categories.length);
    console.log("Products:", products.length);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
