import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ReportList.css';

const ReportList = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await axios.get(`/api/reports/summary?${params.toString()}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch report on mount (with empty date range for all time)
    fetchReport();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = () => {
    fetchReport();
  };

  const handleExportPDF = (type) => {
    // In a real app, we would call the PDF export endpoints
    // For now, we'll just alert
    alert(`Exporting ${type} report to PDF...`);
    // Alternatively, we could redirect to the export endpoint
    // window.location.href = `/api/reports/${type}/pdf?${new URLSearchParams(dateRange).toString()}`;
  };

  if (loading) {
    return (
      <div className="report-list-container">
        <h1>Reports</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="report-list-container">
      <div className="header">
        <h1>Reports</h1>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          Back to Dashboard
        </Link>
      </div>

      <div className="report-controls">
        <div className="form-row">
          <div className="form-group col-md-3">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group col-md-3">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              className="form-control"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group col-md-3">
            <button onClick={handleGenerateReport} className="btn btn-primary w-100">
              Generate Report
            </button>
          </div>
          <div className="form-group col-md-3">
            <button 
              onClick={() => handleExportPDF('summary')} 
              className="btn btn-outline-success w-100"
            >
              Export Summary PDF
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!reportData && !loading && (
        <div className="empty-state">
          <h2>No report data</h2>
          <p>Click "Generate Report" to see your financial summary.</p>
        </div>
      )}

      {reportData && (
        <div className="report-content">
          <h2>Financial Summary</h2>
          {reportData.period && (
            <p className="report-period">
              Period: {reportData.period.startDate ? new Date(reportData.period.startDate).toLocaleDateString() : 'Beginning'} 
              to {reportData.period.endDate ? new Date(reportData.period.endDate).toLocaleDateString() : 'Now'}
            </p>
          )}

          <div className="report-grid">
            <div className="report-card">
              <h3>Totals</h3>
              <p><strong>Invoiced:</strong> ${reportData.totals.invoiced.toFixed(2)}</p>
              <p><strong>Paid:</strong> ${reportData.totals.paid.toFixed(2)}</p>
              <p><strong>Pending:</strong> ${reportData.totals.pending.toFixed(2)}</p>
            </div>
            <div className="report-card">
              <h3>Invoices by Currency</h3>
              {Object.keys(reportData.invoicesByCurrency).map(currency => (
                <div key={currency} className="currency-item">
                  <span>{currency}:</span> 
                  <span>${reportData.invoicesByCurrency[currency].amount.toFixed(2)} ({reportData.invoicesByCurrency[currency].count} invoices)</span>
                </div>
              ))}
            </div>
            <div className="report-card">
              <h3>Payments by Currency</h3>
              {Object.keys(reportData.paymentsByCurrency).map(currency => (
                <div key={currency} className="currency-item">
                  <span>{currency}:</span> 
                  <span>${reportData.paymentsByCurrency[currency].amount.toFixed(2)} ({reportData.paymentsByCurrency[currency].count} payments)</span>
                </div>
              ))}
            </div>
            <div className="report-card">
              <h3>Invoices by Status</h3>
              {Object.keys(reportData.invoicesByStatus).map(status => (
                <div key={status} className="status-item">
                  <span>{status}:</span> 
                  <span>${reportData.invoicesByStatus[status].amount.toFixed(2)} ({reportData.invoicesByStatus[status].count} invoices)</span>
                </div>
              ))}
            </div>
            <div className="report-card">
              <h3>Payments by Status</h3>
              {Object.keys(reportData.paymentsByStatus).map(status => (
                <div key={status} className="status-item">
                  <span>{status}:</span> 
                  <span>${reportData.paymentsByStatus[status].amount.toFixed(2)} ({reportData.paymentsByStatus[status].count} payments)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="report-actions">
            <button 
              onClick={() => handleExportPDF('invoices')} 
              className="btn btn-outline-primary me-2"
            >
              Export Invoices PDF
            </button>
            <button 
              onClick={() => handleExportPDF('payments')} 
              className="btn btn-outline-primary"
            >
              Export Payments PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;