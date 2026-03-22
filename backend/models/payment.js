'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    method: {
      type: DataTypes.ENUM('bank_transfer', 'credit_card', 'paypal', 'crypto', 'zinli_ach', 'swift'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    gatewayResponse: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {});
  Payment.associate = function(models) {
    Payment.belongsTo(models.User, { foreignKey: 'userId' });
    Payment.belongsTo(models.Invoice, { foreignKey: 'invoiceId' });
  };
  return Payment;
};