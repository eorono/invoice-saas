const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Invoice, User, Payment } = require('../models');
const authenticateToken = require('../middleware/auth');

// Get all invoices for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create new invoice
router.post(
  '/',
  [
    authenticateToken,
    body('invoiceNumber').notEmpty(),
    body('dueDate').isISO8601().toDate(),
    body('amount').isDecimal(),
    body('currency').isLength({ min: 3, max: 3 }).uppercase(),
    body('status').isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    body('clientInfo').isObject(),
    body('items').isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        invoiceNumber,
        issueDate,
        dueDate,
        amount,
        currency,
        status,
        description,
        clientInfo,
        items
      } = req.body;

      // Check if invoice number already exists for this user
      const existingInvoice = await Invoice.findOne({
        where: { invoiceNumber, userId: req.user.id }
      });
      if (existingInvoice) {
        return res.status(400).json({ msg: 'Invoice number already exists' });
      }

      const invoice = await Invoice.create({
        userId: req.user.id,
        invoiceNumber,
        issueDate: issueDate || new Date(),
        dueDate,
        amount,
        currency,
        status: status || 'draft',
        description,
        clientInfo,
        items
      });

      res.status(201).json(invoice);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Update invoice
router.put(
  '/:id',
  [
    authenticateToken,
    body('invoiceNumber').optional().notEmpty(),
    body('dueDate').optional().isISO8601().toDate(),
    body('amount').optional().isDecimal(),
    body('currency').optional().isLength({ min: 3, max: 3 }).uppercase(),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    body('description').optional(),
    body('clientInfo').optional().isObject(),
    body('items').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const invoice = await Invoice.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });
      if (!invoice) {
        return res.status(404).json({ msg: 'Invoice not found' });
      }

      // Check if invoice number is being changed and already exists
      if (req.body.invoiceNumber && req.body.invoiceNumber !== invoice.invoiceNumber) {
        const existingInvoice = await Invoice.findOne({
          where: { invoiceNumber: req.body.invoiceNumber, userId: req.user.id }
        });
        if (existingInvoice) {
          return res.status(400).json({ msg: 'Invoice number already exists' });
        }
      }

      await invoice.update(req.body);
      res.json(invoice);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    await invoice.destroy();
    res.json({ msg: 'Invoice deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Send invoice (change status to sent)
router.put('/:id/send', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ msg: 'Only draft invoices can be sent' });
    }

    await invoice.update({ status: 'sent' });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Mark invoice as paid
router.put('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ msg: 'Invoice is already paid' });
    }

    await invoice.update({ status: 'paid' });
    res.json(invoice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;