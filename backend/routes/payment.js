const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Payment, Invoice, User } = require('../models');
const authenticateToken = require('../middleware/auth');

// Get all payments for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Invoice,
        attributes: ['invoiceNumber', 'amount', 'currency']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: Invoice,
        attributes: ['invoiceNumber', 'amount', 'currency']
      }]
    });
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Record a new payment
router.post(
  '/',
  [
    authenticateToken,
    body('invoiceId').isInt(),
    body('amount').isDecimal(),
    body('currency').isLength({ min: 3, max: 3 }).uppercase(),
    body('method').isIn(['bank_transfer', 'credit_card', 'paypal', 'crypto', 'zinli_ach', 'swift']),
    body('transactionId').optional(),
    body('gatewayResponse').optional().isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { invoiceId, amount, currency, method, transactionId, gatewayResponse } = req.body;

      // Verify invoice belongs to user
      const invoice = await Invoice.findOne({
        where: { id: invoiceId, userId: req.user.id }
      });
      if (!invoice) {
        return res.status(404).json({ msg: 'Invoice not found' });
      }

      // Check if payment already exists for this invoice (optional, depending on business rules)
      // const existingPayment = await Payment.findOne({ where: { invoiceId } });
      // if (existingPayment) {
      //   return res.status(400).json({ msg: 'Payment already recorded for this invoice' });
      // }

      const payment = await Payment.create({
        userId: req.user.id,
        invoiceId,
        amount,
        currency,
        method,
        status: 'completed', // Assume immediate completion for simulation
        transactionId,
        gatewayResponse
      });

      // Update invoice status to paid if fully paid (simplified logic)
      // In a real app, you'd check if total payments >= invoice amount
      await invoice.update({ status: 'paid' });

      res.status(201).json(payment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
});

// Simulate payment gateway integration (NOWPayments - crypto)
router.post(
  '/simulate/nowpayments',
  authenticateToken,
  async (req, res) => {
    try {
      const { invoiceId, amount, currency } = req.body;

      // Verify invoice belongs to user
      const invoice = await Invoice.findOne({
        where: { id: invoiceId, userId: req.user.id }
      });
      if (!invoice) {
        return res.status(404).json({ msg: 'Invoice not found' });
      }

      // Simulate NOWPayments response
      const simulationResponse = {
        status: Math.random() > 0.2 ? 'completed' : 'failed', // 80% success rate
        payment_id: `np_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        pay_address: '0x742d35Cc6634C0532925a3b8D4C0532950532950', // Example address
        pay_amount: amount,
        pay_currency: currency.toLowerCase(),
        purchase_id: invoice.invoiceNumber,
        purchase_id: invoice.invoiceNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (simulationResponse.status === 'completed') {
        // Record successful payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'crypto',
          status: 'completed',
          transactionId: simulationResponse.payment_id,
          gatewayResponse: simulationResponse
        });

        // Update invoice status
        await invoice.update({ status: 'paid' });

        res.json({
          success: true,
          payment,
          gatewayResponse: simulationResponse
        });
      } else {
        // Record failed payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'crypto',
          status: 'failed',
          transactionId: simulationResponse.payment_id,
          gatewayResponse: simulationResponse
        });

        res.json({
          success: false,
          payment,
          gatewayResponse: simulationResponse
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
});

// Simulate PayPal payment gateway
router.post(
  '/simulate/paypal',
  authenticateToken,
  async (req, res) => {
    try {
      const { invoiceId, amount, currency } = req.body;

      // Verify invoice belongs to user
      const invoice = await Invoice.findOne({
        where: { id: invoiceId, userId: req.user.id }
      });
      if (!invoice) {
        return res.status(404).json({ msg: 'Invoice not found' });
      }

      // Simulate PayPal response
      const simulationResponse = {
        status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
        id: `PAYPAL-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: invoice.invoiceNumber,
          amount: {
            currency_code: currency,
            value: amount.toString()
          }
        }],
        processor_response: {
          approval_code: Math.floor(Math.random() * 900000) + 100000
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };

      if (simulationResponse.status === 'completed') {
        // Record successful payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'paypal',
          status: 'completed',
          transactionId: simulationResponse.id,
          gatewayResponse: simulationResponse
        });

        // Update invoice status
        await invoice.update({ status: 'paid' });

        res.json({
          success: true,
          payment,
          gatewayResponse: simulationResponse
        });
      } else {
        // Record failed payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'paypal',
          status: 'failed',
          transactionId: simulationResponse.id,
          gatewayResponse: simulationResponse
        });

        res.json({
          success: false,
          payment,
          gatewayResponse: simulationResponse
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
});

// Simulate SWIFT bank transfer
router.post(
  '/simulate/swift',
  authenticateToken,
  async (req, res) => {
    try {
      const { invoiceId, amount, currency } = req.body;

      // Verify invoice belongs to user
      const invoice = await Invoice.findOne({
        where: { id: invoiceId, userId: req.user.id }
      });
      if (!invoice) {
        return res.status(404).json({ msg: 'Invoice not found' });
      }

      // Simulate SWIFT response (typically slower, 1-3 business days)
      const simulationResponse = {
        status: Math.random() > 0.15 ? 'completed' : 'failed', // 85% success rate
        message_reference: `SWIFT${Date.now()}`,
        end_to_end_id: `E2E${Date.now()}`,
        UETR: `xxxxxxxx-xxxx-xxxx-xxxx-${Date.now().toString(16).slice(-12)}`,
        amount: {
          currency: currency,
          amount: amount
        },
        settlement_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days later
        completion_timestamp: new Date().toISOString()
      };

      if (simulationResponse.status === 'completed') {
        // Record successful payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'swift',
          status: 'completed',
          transactionId: simulationResponse.message_reference,
          gatewayResponse: simulationResponse
        });

        // Update invoice status
        await invoice.update({ status: 'paid' });

        res.json({
          success: true,
          payment,
          gatewayResponse: simulationResponse
        });
      } else {
        // Record failed payment
        const payment = await Payment.create({
          userId: req.user.id,
          invoiceId,
          amount,
          currency,
          method: 'swift',
          status: 'failed',
          transactionId: simulationResponse.message_reference,
          gatewayResponse: simulationResponse
        });

        res.json({
          success: false,
          payment,
          gatewayResponse: simulationResponse
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
});

// Zinli ACH Xpress recharge simulation
router.post(
  '/simulate/zinli-ach',
  authenticateToken,
  async (req, res) => {
    try {
      const { amount, currency, phoneNumber } = req.body;

      // Validate phone number format (simplified)
      if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
        return res.status(400).json({ msg: 'Invalid phone number format' });
      }

      // Simulate Zinli ACH Xpress response
      const simulationResponse = {
        status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
        transaction_id: `ZL${Date.now()}`,
        phone_number: phoneNumber,
        amount: {
          currency: currency,
          value: amount
        },
        fee: {
          currency: currency,
          value: (amount * 0.029).toFixed(2) // 2.9% fee
        },
        total_charged: {
          currency: currency,
          value: (amount * 1.029).toFixed(2)
        },
        timestamp: new Date().toISOString(),
        reference: `ZINLI-${Date.now()}`
      };

      if (simulationResponse.status === 'completed') {
        // Record successful recharge (not tied to invoice)
        const payment = await Payment.create({
          userId: req.user.id,
          amount: parseFloat(simulationResponse.total_charged.value),
          currency,
          method: 'zinli_ach',
          status: 'completed',
          transactionId: simulationResponse.transaction_id,
          gatewayResponse: simulationResponse
        });

        res.json({
          success: true,
          payment,
          gatewayResponse: simulationResponse,
          message: 'Zinli ACH Xpress recharge successful'
        });
      } else {
        // Record failed recharge
        const payment = await Payment.create({
          userId: req.user.id,
          amount: parseFloat(simulationResponse.total_charged.value),
          currency,
          method: 'zinli_ach',
          status: 'failed',
          transactionId: simulationResponse.transaction_id,
          gatewayResponse: simulationResponse
        });

        res.json({
          success: false,
          payment,
          gatewayResponse: simulationResponse,
          message: 'Zinli ACH Xpress recharge failed'
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
});

// Get payment statistics for user
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get payment counts by status
    const paymentStats = await Payment.findAll({
      where: { userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['status']
    });

    // Get invoice counts by status
    const invoiceStats = await Invoice.findAll({
      where: { userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['status']
    });

    res.json({
      payments: paymentStats,
      invoices: invoiceStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;