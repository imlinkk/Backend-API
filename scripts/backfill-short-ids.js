require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Counter = require("../src/models/Counter");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");

const missingShortIdFilter = {
  $or: [{ shortId: { $exists: false } }, { shortId: null }],
};

async function backfillModel(Model, counterName) {
  const maxDoc = await Model.findOne({ shortId: { $exists: true, $ne: null } })
    .sort({ shortId: -1 })
    .select("shortId")
    .lean();

  let seq = maxDoc?.shortId || 0;
  const docs = await Model.find(missingShortIdFilter).sort({
    createdAt: 1,
    _id: 1,
  });

  for (const doc of docs) {
    seq += 1;
    doc.shortId = seq;
    await doc.save();
  }

  await Counter.findByIdAndUpdate(
    counterName,
    { $set: { seq } },
    { upsert: true, new: true }
  );

  return docs.length;
}

const run = async () => {
  let exitCode = 0;

  try {
    await connectDB();

    const [categoriesUpdated, productsUpdated, ordersUpdated] = await Promise.all([
      backfillModel(Category, "category"),
      backfillModel(Product, "product"),
      backfillModel(Order, "order"),
    ]);

    console.log(`Categories updated: ${categoriesUpdated}`);
    console.log(`Products updated: ${productsUpdated}`);
    console.log(`Orders updated: ${ordersUpdated}`);
  } catch (error) {
    exitCode = 1;
    console.error("Backfill failed:", error.message);
  } finally {
    await mongoose.connection.close().catch(() => {});
    process.exit(exitCode);
  }
};

run();
