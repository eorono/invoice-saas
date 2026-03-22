import React, { useState, useEffect, useParams, useNavigate } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './InvoiceForm.css';

const InvoiceForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    amount: '',
    currency: 'USD',
    status: 'draft',
    description: '',
    clientInfo: {
      name: '',
      email: '',
      address: '',
      taxId: ''
    },
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch invoice if editing
  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/invoices/${id}`);
          // Transform data to match form state
          const invoice = response.data;
          setFormData({
            ...invoice,
            issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
            clientInfo: invoice.clientInfo || {
              name: '',
              email: '',
              address: '',
              taxId: ''
            },
            items: invoice.items || [
              {
                description: '',
                quantity: 1,
                unitPrice: 0,
                total: 0
              }
            ]
          });
        } catch (err) {
          console.error('Error fetching invoice:', err);
          setError('Failed to load invoice');
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  // Calculate item total when quantity or unitPrice changes
  const calculateItemTotal = (index) => {
    const items = [...formData.items];
    const item = items[index];
    const total = parseFloat(item.quantity) * parseFloat(item.unitPrice || 0);
    item.total = total;
    setFormData({ ...formData, items });
    // Recalculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    setFormData({ ...formData, amount: totalAmount.toString() });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If amount changed, update it (though we calculate from items)
    if (name === 'amount') {
      // We could allow direct amount entry, but for now we calculate from items
      // This is just to keep the field in sync if we allow direct edit
    }
  };

  // Handle nested object changes (clientInfo)
  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      clientInfo: {
        ...formData.clientInfo,
        [name]: value
      }
    });
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    // If quantity or unitPrice changed, recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const total = parseFloat(items[index].quantity) * parseFloat(items[index].unitPrice || 0);
      items[index].total = total;
    }
    setFormData({ ...formData, items });
    // Recalculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    setFormData({ ...formData, amount: totalAmount.toString() });
  };

  // Add new item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ]
    });
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      // At least one item
      return;
    }
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
    // Recalculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    setFormData({ ...formData, amount: totalAmount.toString() });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (id) {
        // Update invoice
        response = await axios.put(`/api/invoices/${id}`, formData);
      } else {
        // Create invoice
        response = await axios.post('/api/invoices', formData);
      }
      setSuccess('Invoice saved successfully!');
      // Redirect to invoices list after a short delay
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError(err.response?.data?.msg || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <button onClick={() => navigate('/invoices')} className="btn btn-outline-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="invoiceNumber">Invoice Number *</label>
            <input
              type="text"
              className="form-control"
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="issueDate">Issue Date</label>
            <input
              type="date"
              className="form-control"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              className="form-control"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="currency">Currency *</label>
            <select
              className="form-control"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="VES">VES</option>
              <option value="BRL">BRL</option>
              <option value="MXN">MXN</option>
              <option value="ARS">ARS</option>
              <option value="CLP">CLP</option>
              <option value="PEN">PEN</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="amount">Total Amount *</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="status">Status *</label>
            <select
              className="form-control"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <h3>Client Information</h3>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="clientName">Name *</label>
            <input
              type="text"
              className="form-control"
              id="clientName"
              name="name"
              value={formData.clientInfo.name}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="clientEmail">Email</label>
            <input
              type="email"
              className="form-control"
              id="clientEmail"
              name="email"
              value={formData.clientInfo.email}
              onChange={handleClientInfoChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="clientAddress">Address</label>
            <input
              type="text"
              className="form-control"
              id="clientAddress"
              name="address"
              value={formData.clientInfo.address}
              onChange={handleClientInfoChange}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="clientTaxId">Tax ID</label>
            <input
              type="text"
              className="form-control"
              id="clientTaxId"
              name="taxId"
              value={formData.clientInfo.taxId}
              onChange={handleClientInfoChange}
            />
          </div>
        </div>

        <h3>Invoice Items</h3>
        <div id="items-container">
          {formData.items.map((item, index) => (
            <div className="item-row" key={index}>
              <div className="form-row">
                <div className="form-group col-md-4">
                  <label htmlDes={`itemDescription_${index}`}>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id={`itemDescription_${index}`}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    value={item.description}
                  />
                </div>
                <div className="form-group col-md-2">
                  <label htmlFor={`itemQuantity_${index}`}>Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id={`itemQuantity_${index}`}
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="form-group col-md-2">
                  <label htmlFor={`itemUnitPrice_${index}`}>Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id={`itemUnitPrice_${index}`}
                    name="unitPrice"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="form-group col-md-2">
                  <label htmlFor={`itemTotal_${index}`}>Total</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id={`itemTotal_${index}`}
                    value={item.total}
                    readOnly
                  />
                </div>
                <div className="form-group col-md-2 align-self-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="form-group">
            <button
              type="button"
              className="btn btn-link"
              onClick={addItem}
            >
              Add Item
            </button>
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;