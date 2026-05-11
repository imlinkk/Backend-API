const Order = require("../models/Order");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"];

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

const findOrderByIdentifier = (id) => {
  const orderId = normalizeIdentifier(id);

  return typeof orderId === "number"
    ? Order.findOne({ shortId: orderId })
    : Order.findById(orderId);
};

const getNextOrderStatus = (status) => {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  return currentIndex === -1 ? null : ORDER_STATUSES[currentIndex + 1] || null;
};

const getStatusTransitionError = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    return null;
  }

  const expectedStatus = getNextOrderStatus(currentStatus);
  if (expectedStatus === nextStatus) {
    return null;
  }

  if (!expectedStatus) {
    return `Order status is already ${currentStatus}`;
  }

  return `Invalid status transition from ${currentStatus} to ${nextStatus}. Next status must be ${expectedStatus}.`;
};

module.exports = {
  ORDER_STATUSES,
  findOrderByIdentifier,
  getStatusTransitionError,
};
