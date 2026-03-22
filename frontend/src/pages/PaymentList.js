import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './PaymentList.css';

const PaymentList = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () {
      try {
        setLoading(true);
        const response = await axios.get('/api/payments');
        setPayments(response.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="payment-list-container">
        <h1>Payments</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-list-container">
        <h1>Payments</h1>
        <p className="error">{error}</p>
        <Link to="/payments/new" className="btn btn-primary">
          Record Payment
        </Link>
      </div>
    );
  }

  return (
    <div className="payment-list-container">
      <div className="header">
        <h1>Payments</h1>
        <Link to="/payments/new" className="btn btn-primary">
          Record New Payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <h2>No payments found</h2>
          <p>You haven't recorded any payments yet.</p>
          <Link to="/payments/new" className="btn btn-primary">
            Record First Payment
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>{payment.Invoice ? payment.Invoice.invoiceNumber : 'N/A'}</td>
                  <td>${payment.amount} {payment.currency}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/payments/${payment.id}/edit`} className="btn btn-sm btn-outline-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;