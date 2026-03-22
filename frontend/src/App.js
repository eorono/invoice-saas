import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import PaymentList from './pages/PaymentList';
import PaymentForm from './pages/PaymentForm';
import ReportList from './pages/ReportList';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
              <Route path="/invoices/new" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
              <Route path="/invoices/:id/edit" element={<PrivateRoute><InvoiceForm /></PrivateRoute>} />
              <Route path="/payments" element={<PrivateRoute><PaymentList /></PrivateRoute>} />
              <Route path="/payments/new" element={<PrivateRoute><PaymentForm /></PrivateRoute>} />
              <Route path="/payments/:id/edit" element={<PrivateRoute><PaymentForm /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><ReportList /></PrivateRoute>} />
              
              {/* Fallback for 404 */}
              <Route path="*" element={<div className="container py-5"><h1>404 - Page Not Found</h1></div>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;