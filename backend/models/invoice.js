'use strict';
module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clientInfo: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {});
  Invoice.associate = function(models) {
    Invoice.belongsTo(models.User, { foreignKey: 'userId' });
    Invoice.hasMany(models.Payment, { foreignKey: 'invoiceId' });
  };
  return Invoice;
};