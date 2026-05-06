const calculateCartTotals = (cart) => {
  const items = cart?.items || [];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return {
    totalItems,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

module.exports = {
  calculateCartTotals,
};
