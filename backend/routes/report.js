const express = require('express');
const router = express.Router();
const { Invoice, Payment, User } = require('../models');
const authenticateToken = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Get financial summary report
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter[sequelize.Op.gte] = new Date(startDate);
    if (endDate) dateFilter[sequelize.Op.lte] = new Date(endDate);
    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get invoices
    const invoices = await Invoice.findAll({
      where: {
        userId,
        ...dateWhere
      }
    });

    // Get payments
    const payments = await Payment.findAll({
      where: {
        userId,
        ...dateWhere
      }
    });

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const totalPending = totalInvoiced - totalPaid;

    // Group by currency
    const invoicesByCurrency = {};
    invoices.forEach(inv => {
      const currency = inv.currency;
      if (!invoicesByCurrency[currency]) {
        invoicesByCurrency[currency] = { count: 0, amount: 0 };
      }
      invoicesByCurrency[currency].count += 1;
      invoicesByCurrency[currency].amount += parseFloat(inv.amount);
    });

    const paymentsByCurrency = {};
    payments.forEach(pay => {
      const currency = pay.currency;
      if (!paymentsByCurrency[currency]) {
        paymentsByCurrency[currency] = { count: 0, amount: 0 };
      }
      paymentsByCurrency[currency].count += 1;
      paymentsByCurrency[currency].amount += parseFloat(pay.amount);
    });

    // Group by status
    const invoicesByStatus = {};
    invoices.forEach(inv => {
      const status = inv.status;
      if (!invoicesByStatus[status]) {
        invoicesByStatus[status] = { count: 0, amount: 0 };
      }
      invoicesByStatus[status].count += 1;
      invoicesByStatus[status].amount += parseFloat(inv.amount);
    });

    const paymentsByStatus = {};
    payments.forEach(pay => {
      const status = pay.status;
      if (!paymentsByStatus[status]) {
        paymentsByStatus[status] = { count: 0, amount: 0 };
      }
      paymentsByStatus[status].count += 1;
      paymentsByStatus[status].amount += parseFloat(pay.amount);
    });

    res.json({
      period: {
        startDate: startDate || undefined,
        endDate: endDate || undefined
      },
      totals: {
        invoiced: totalInvoiced,
        paid: totalPaid,
        pending: totalPending
      },
      invoicesByCurrency,
      paymentsByCurrency,
      invoicesByStatus,
      paymentsByStatus,
      invoiceCount: invoices.length,
      paymentCount: payments.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export invoices to PDF
router.get('/invoices/pdf', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter[sequelize.Op.gte] = new Date(startDate);
    if (endDate) dateFilter[sequelize.Op.lte] = new Date(endDate);
    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get invoices
    const invoices = await Invoice.findAll({
      where: {
        userId,
        ...dateWhere
      },
      order: [['createdAt', 'DESC']]
    });

    // Create PDF
    const doc = new PDFDocument();
    const fileName = `invoices-report-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    // Pipe to file and response
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.pipe(res);

    // PDF content
    doc.fontSize(25).text('Invoices Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    if (startDate || endDate) {
      doc.text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Now'}`);
    }
    doc.moveDown();

    // Table header
    doc.fontSize(14).text('Invoice Details', { underline: true });
    doc.moveDown();
    
    const tableTop = doc.y;
    doc.fontSize(10);
    
    // Headers
    doc.text('Invoice #', 50, tableTop);
    doc.text('Date', 150, tableTop);
    doc.text('Due Date', 250, tableTop);
    doc.text('Amount', 350, tableTop);
    doc.text('Currency', 450, tableTop);
    doc.text('Status', 550, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(600, tableTop + 15).stroke();
    
    // Table rows
    let yPosition = tableTop + 25;
    invoices.forEach((invoice, index) => {
      doc.text(invoice.invoiceNumber, 50, yPosition);
      doc.text(new Date(invoice.issueDate).toLocaleDateString(), 150, yPosition);
      doc.text(new Date(invoice.dueDate).toLocaleDateString(), 250, yPosition);
      doc.text(`${invoice.amount} ${invoice.currency}`, 350, yPosition);
      doc.text(invoice.currency, 450, yPosition);
      doc.text(invoice.status, 550, yPosition);
      
      yPosition += 20;
      if (yPosition > 750) { // Start new page
        doc.addPage();
        yPosition = 50;
      }
    });

    doc.end();
    writeStream.on('finish', () => {
      // File is saved, response already piped
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export payments to PDF
router.get('/payments/pdf', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter[sequelize.Op.gte] = new Date(startDate);
    if (endDate) dateFilter[sequelize.Op.lte] = new Date(endDate);
    const dateWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get payments
    const payments = await Payment.findAll({
      where: {
        userId,
        ...dateWhere
      },
      include: [{
        model: Invoice,
        attributes: ['invoiceNumber']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Create PDF
    const doc = new PDFDocument();
    const fileName = `payments-report-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    // Pipe to file and response
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.pipe(res);

    // PDF content
    doc.fontSize(25).text('Payments Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    if (startDate || endDate) {
      doc.text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Now'}`);
    }
    doc.moveDown();

    // Table header
    doc.fontSize(14).text('Payment Details', { underline: true });
    doc.moveDown();
    
    const tableTop = doc.y;
    doc.fontSize(10);
    
    // Headers
    doc.text('Payment ID', 50, tableTop);
    doc.text('Date', 150, tableTop);
    doc.text('Invoice #', 250, tableTop);
    doc.text('Amount', 350, tableTop);
    doc.text('Currency', 450, tableTop);
    doc.text('Method', 520, tableTop);
    doc.text('Status', 580, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(620, tableTop + 15).stroke();
    
    // Table rows
    let yPosition = tableTop + 25;
    payments.forEach((payment, index) => {
      doc.text(payment.id.toString(), 50, yPosition);
      doc.text(new Date(payment.paymentDate).toLocaleDateString(), 150, yPosition);
      doc.text(payment.Invoice ? payment.Invoice.invoiceNumber : 'N/A', 250, yPosition);
      doc.text(`${payment.amount} ${payment.currency}`, 350, yPosition);
      doc.text(payment.currency, 450, yPosition);
      doc.text(payment.method, 520, yPosition);
      doc.text(payment.status, 580, yPosition);
      
      yPosition += 20;
      if (yPosition > 750) { // Start new page
        doc.addPage();
        yPosition = 50;
      }
    });

    doc.end();
    writeStream.on('finish', () => {
      // File is saved, response already piped
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;