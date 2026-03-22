import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    invoicesByStatus: {},
    recentInvoices: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await axios.get('/api/payments/stats/summary');
        
        // Fetch recent invoices
        const invoicesResponse = await axios.get('/api/invoices?limit=5');
        
        // Fetch recent payments
        const paymentsResponse = await axios.get('/api/payments?limit=5');

        // Process stats
        const invoiceStats = statsResponse.data.invoices;
        const paymentStats = statsResponse.data.payments;

        let totalInvoices = 0;
        let totalAmount = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        const invoicesByStatus = {};

        invoiceStats.forEach(stat => {
          totalInvoices += parseInt(stat.count);
          totalAmount += parseFloat(stat.totalAmount) || 0;
          invoicesByStatus[stat.status] = {
            count: parseInt(stat.count),
            amount: parseFloat(stat.totalAmount) || 0
          };
        });

        paymentStats.forEach(stat => {
          if (stat.status === 'completed') {
            paidAmount += parseFloat(stat.totalAmount) || 0;
          }
        });

        pendingAmount = totalAmount - paidAmount;

        setStats({
          totalInvoices,
          totalAmount,
          paidAmount,
          pendingAmount,
          invoicesByStatus,
          recentInvoices: invoicesResponse.data,
          recentPayments: paymentsResponse.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome back, {user.name}!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Invoices</h3>
          <p>{stats.totalInvoices}</p>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <p>${stats.totalAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Paid Amount</h3>
          <p>${stats.paidAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <p>${stats.pendingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Invoices by Status</h3>
          <div className="chart-placeholder">
            {/* In a real app, we would render a chart here */}
            <p>Chart placeholder</p>
          </div>
        </div>
        <div className="chart">
          <h3>Payments by Status</h3>
          <div className="chart-placeholder">
            <p>Chart placeholder</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="tabs">
          <button className="tab active" data-tab="invoices">Recent Invoices</button>
          <button className="tab" data-tab="payments">Recent Payments</button>
        </div>
        <div className="tab-content" id="invoices-tab">
          {stats.recentInvoices.length > 0 ? (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td>${invoice.amount} {invoice.currency}</td>
                    <td>
                      <span className={`status-badge ${invoice.status}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent invoices.</p>
          )}
        </div>
        <div className="tab-content" id="payments-tab" style={{ display: 'none' }}>
          {stats.recentPayments.length > 0 ? (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>${payment.amount} {payment.currency}</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent payments.</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/invoices/new" className="action-btn">
            <h3>Create Invoice</h3>
            <p>Create a new invoice for your client</p>
          </Link>
          <Link to="/payments/new" className="action-btn">
            <h3>Record Payment</h3>
            <p>Record a payment received</p>
          </Link>
          <Link to="/reports" className="action-btn">
            <h3>View Reports</h3>
            <p>Generate financial reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;