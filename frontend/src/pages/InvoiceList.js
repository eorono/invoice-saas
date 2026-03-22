import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './InvoiceList.css';

const InvoiceList = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/invoices');
        setInvoices(response.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="invoice-list-container">
        <h1>Invoices</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-list-container">
        <h1>Invoices</h1>
        <p className="error">{error}</p>
        <Link to="/invoices/new" className="btn btn-primary">
          Create Invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-list-container">
      <div className="header">
        <h1>Invoices</h1>
        <Link to="/invoices/new" className="btn btn-primary">
          Create New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <h2>No invoices found</h2>
          <p>You haven't created any invoices yet.</p>
          <Link to="/invoices/new" className="btn btn-primary">
            Create First Invoice
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>{invoice.clientInfo.name || 'N/A'}</td>
                  <td>${invoice.amount} {invoice.currency}</td>
                  <td>
                    <span className={`status-badge ${invoice.status}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/invoices/${invoice.id}/edit`} className="btn btn-sm btn-outline-primary">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Delete
                    </button>
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

export default InvoiceList;