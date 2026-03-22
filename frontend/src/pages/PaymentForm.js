import React, { useState, useEffect, useParams, useNavigate } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './PaymentForm.css';

const PaymentForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    currency: 'USD',
    method: 'bank_transfer',
    transactionId: '',
    gatewayResponse: {}
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gatewaysLoading, setGatewaysLoading] = useState(false);

  // Fetch invoices for dropdown
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('/api/invoices');
        // Filter to show only sent or overdue invoices for payment
        const filtered = response.data.filter(inv => 
          inv.status === 'sent' || inv.status === 'overdue'
        );
        setInvoices(filtered);
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };
    fetchInvoices();
  }, []);

  // Fetch payment if editing
  useEffect(() => {
    if (id) {
      const fetchPayment = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/payments/${id}`);
          const payment = response.data;
          setFormData({
            ...payment,
            invoiceId: payment.invoiceId.toString(),
            amount: payment.amount.toString(),
            currency: payment.currency,
            method: payment.method,
            transactionId: payment.transactionId || '',
            gatewayResponse: payment.gatewayResponse || {}
          });
        } catch (err) {
          console.error('Error fetching payment:', err);
          setError('Failed to load payment');
        } finally {
          setLoading(false);
        }
      };
      fetchPayment();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle gateway simulation
  const simulateGateway = async (gateway) => {
    setGatewaysLoading(true);
    try {
      let response;
      switch (gateway) {
        case 'nowpayments':
          response = await axios.post('/api/payments/simulate/nowpayments', {
            invoiceId: formData.invoiceId,
            amount: formData.amount,
            currency: formData.currency
          });
          break;
        case 'paypal':
          response = await axios.post('/api/payments/simulate/paypal', {
            invoiceId: formData.invoiceId,
            amount: formData.amount,
            currency: formData.currency
          });
          break;
        case 'swift':
          response = await axios.post('/api/payments/simulate/swift', {
            invoiceId: formData.invoiceId,
            amount: formData.amount,
            currency: formData.currency
          });
          break;
        case 'zinli_ach':
          // For Zinli, we need phone number
          const phoneNumber = window.prompt('Enter phone number for Zinli ACH Xpress:');
          if (!phoneNumber) {
            setGatewaysLoading(false);
            return;
          }
          response = await axios.post('/api/payments/simulate/zinli-ach', {
            amount: formData.amount,
            currency: formData.currency,
            phoneNumber: phoneNumber
          });
          break;
        default:
          setGatewaysLoading(false);
          return;
      }

      // Update form with simulation result
      if (response.data.success && response.data.payment) {
        const payment = response.data.payment;
        setFormData({
          ...formData,
          amount: payment.amount.toString(),
          currency: payment.currency,
          method: payment.method,
          transactionId: payment.transactionId,
          gatewayResponse: payment.gatewayResponse
        });
        setSuccess(`Payment simulated successfully via ${gateway}!`);
      } else {
        setError(`Payment simulation failed via ${gateway}`);
      }
    } catch (err) {
      console.error('Error simulating gateway:', err);
      setError('Payment simulation failed');
    } finally {
      setGatewaysLoading(false);
    }
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
        // Update payment
        response = await axios.put(`/api/payments/${id}`, formData);
      } else {
        // Create payment
        response = await axios.post('/api/payments', formData);
      }
      setSuccess('Payment saved successfully!');
      // Redirect to payments list after a short delay
      setTimeout(() => {
        navigate('/payments');
      }, 1500);
    } catch (err) {
      console.error('Error saving payment:', err);
      setError(err.response?.data?.msg || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="form-header">
        <h1>{id ? 'Edit Payment' : 'Record New Payment'}</h1>
        <button onClick={() => navigate('/payments')} className="btn btn-outline-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="invoiceId">Invoice *</label>
            <select
              className="form-control"
              id="invoiceId"
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleChange}
              required
            >
              <option value="">Select an invoice</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  #{invoice.invoiceNumber} - ${invoice.amount} {invoice.currency} ({invoice.status})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="amount">Amount *</label>
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
        </div>

        <div className="form-row">
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
          <div className="form-group col-md-6">
            <label htmlFor="method">Payment Method *</label>
            <select
              className="form-control"
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Cryptocurrency (NOWPayments)</option>
              <option value="swift">SWIFT Bank Transfer</option>
              <option value="zinli_ach">Zinli ACH Xpress</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="transactionId">Transaction ID (optional)</label>
          <input
            type="text"
            className="form-control"
            id="transactionId"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
          />
        </div>

        <h3>Payment Gateway Simulation</h3>
        <p>Use these buttons to simulate payments through various gateways:</p>
        <div className="gateway-buttons">
          <button 
            onClick={() => simulateGateway('nowpayments')}
            disabled={gatewaysLoading || !formData.invoiceId}
            className="btn btn-outline-info me-2 mb-2"
          >
            {gatewaysLoading ? 'Simulating...' : 'Simulate NOWPayments (Crypto)'}
          </button>
          <button 
            onClick={() => simulateGateway('paypal')}
            disabled={gatewaysLoading || !formData.invoiceId}
            className="btn btn-outline-info me-2 mb-2"
          >
            {gatewaysLoading ? 'Simulating...' : 'Simulate PayPal'}
          </button>
          <button 
            onClick={() => simulateGateway('swift')}
            disabled={gatewaysLoading || !formData.invoiceId}
            className="btn btn-outline-info me-2 mb-2"
          >
            {gatewaysLoading ? 'Simulating...' : 'Simulate SWIFT'}
          </button>
          <button 
            onClick={() => simulateGateway('zinli_ach')}
            disabled={gatewaysLoading || !formData.invoiceId}
            className="btn btn-outline-info me-2 mb-2"
          >
            {gatewaysLoading ? 'Simulating...' : 'Simulate Zinli ACH Xpress'}
          </button>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;