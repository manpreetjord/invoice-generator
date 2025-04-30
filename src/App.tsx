import React, { useState, useEffect, useRef } from 'react';
import { FaFileInvoice, FaDownload, FaSave, FaEye, FaPlusCircle, FaTrash, FaInfoCircle, FaDatabase, FaDollarSign, FaEuroSign, FaPoundSign, FaYenSign } from 'react-icons/fa';
import InvoicePreview from './components/InvoicePreview';
import html2pdf from 'html2pdf.js';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: string;
  sender: {
    name: string;
    address: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  recipient: {
    companyName: string;
    address: string;
    regNo: string;
    vatId: string;
  };
  items: InvoiceItem[];
  payment: {
    // International bank details
    bankName: string;
    iban: string;
    swift: string;
    // Indian bank details
    accountNumber?: string;
    ifsc?: string;
    accountName?: string;
    upi?: string;
    // Crypto
    cryptoAddress: string;
  };
  notes: string;
  bankingType: string; // 'international' or 'indian'
}

// Sample data for the invoice
const sampleData: InvoiceData = {
  invoiceNumber: 'INV-2025-0042',
  date: '2025-04-30',
  dueDate: '2025-05-30',
  currency: '₹',
  sender: {
    name: 'Global Tech Solutions',
    address: 'A-21, Sector 62, Noida, UP 201301, India',
    email: 'accounts@globaltechsolutions.com',
    phone: '+91 98765 43210',
    countryCode: '+91'
  },
  recipient: {
    companyName: 'Acme Corporation',
    address: 'B-12, Connaught Place, New Delhi, 110001, India',
    regNo: 'ACM-98765-X',
    vatId: 'GSTIN-29AAACC1206D1ZB'
  },
  items: [
    {
      description: 'Website Design Services',
      quantity: 1,
      unitPrice: 150000
    },
    {
      description: 'UI/UX Consulting (Hours)',
      quantity: 15,
      unitPrice: 2500
    },
    {
      description: 'Content Creation Package',
      quantity: 1,
      unitPrice: 35000
    },
    {
      description: 'SEO Optimization',
      quantity: 1,
      unitPrice: 45000
    }
  ],
  payment: {
    // International details
    bankName: 'HDFC Bank',
    iban: '',
    swift: 'HDFCINBB',
    // Indian details
    accountNumber: '50100184251234',
    ifsc: 'HDFC0001402',
    accountName: 'Global Tech Solutions',
    upi: 'globaltechsol@hdfcbank',
    // Crypto
    cryptoAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  notes: 'Thank you for your business! Payment is due within 30 days. Please include the invoice number in your payment reference. For questions regarding this invoice, please contact accounts@globaltechsolutions.com.',
  bankingType: 'indian' // Default to Indian banking for sample
};

// Currency symbols
const currencySymbols = [
  { symbol: '$', name: 'USD' },
  { symbol: '€', name: 'EUR' },
  { symbol: '£', name: 'GBP' },
  { symbol: '¥', name: 'JPY' },
  { symbol: '₹', name: 'INR' }
];

// Add country codes array
const countryCodes = [
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+61', country: 'Australia' },
  { code: '+55', country: 'Brazil' },
  { code: '+971', country: 'UAE' },
];

interface InputWithTooltipProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  tooltipText: string;
  validation?: (value: string) => string;
  required?: boolean;
  customInput?: React.ReactNode;
}

const InputWithTooltip: React.FC<InputWithTooltipProps> = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  tooltipText, 
  validation, 
  required = false,
  customInput 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(e);
    
    // Validate if validation function is provided
    if (validation) {
      const validationResult = validation(newValue);
      setError(validationResult ? validationResult : '');
    }
  };
  
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-primary">*</span>}
        <span 
          className="ml-2" 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)}
          style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
        >
          <FaInfoCircle size={14} />
        </span>
      </label>
      {showTooltip && (
        <div className="tooltip" style={{
          position: 'absolute',
          backgroundColor: 'var(--bg-white)',
          border: '1px solid var(--border-color)',
          padding: 'var(--spacing-2)',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)',
          zIndex: 100,
          maxWidth: '250px',
          fontSize: '0.8rem'
        }}>
          {tooltipText}
        </div>
      )}
      {customInput ? (
        customInput
      ) : (
        <input
          id={id}
          type={type}
          className={`input-field ${error ? 'border-red-500' : ''}`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: '$',
    sender: {
      name: '',
      address: '',
      email: '',
      phone: '',
      countryCode: '+1',
    },
    recipient: {
      companyName: '',
      address: '',
      regNo: '',
      vatId: '',
    },
    items: [{ description: '', quantity: 0, unitPrice: 0 }],
    payment: {
      bankName: '',
      iban: '',
      swift: '',
      cryptoAddress: '',
      accountNumber: '',
      ifsc: '',
      accountName: '',
      upi: ''
    },
    notes: '',
    bankingType: 'international'
  });

  const [showPreview, setShowPreview] = useState(false);
  const invoicePreviewRef = useRef(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('invoiceData');
    if (savedData) {
      setInvoiceData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
  }, [invoiceData]);

  const handleInputChange = (section: string, field: string, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object'
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 0, unitPrice: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
  };

  const handleDownloadPDF = () => {
    if (invoicePreviewRef.current) {
      const element = invoicePreviewRef.current;
      const opt = {
        margin: 1,
        filename: `invoice-${invoiceData.invoiceNumber || 'new'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // If we're not in preview mode, switch to preview mode first
      if (!showPreview) {
        setShowPreview(true);
        // Wait for the component to render
        setTimeout(() => {
          const previewElement = document.getElementById('invoice-preview');
          if (previewElement) {
            html2pdf().set(opt).from(previewElement).save();
          }
        }, 500);
      } else {
        const previewElement = document.getElementById('invoice-preview');
        if (previewElement) {
          html2pdf().set(opt).from(previewElement).save();
        }
      }
    }
  };

  const loadSampleData = () => {
    setInvoiceData(sampleData);
  };

  // Validation functions
  const validatePhone = (value: string) => {
    if (!value) return '';
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateRequired = (value: string) => {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    return '';
  };

  const validateIFSC = (value: string) => {
    if (!value) return '';
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(value)) {
      return 'Please enter a valid IFSC code (e.g. SBIN0000XXX)';
    }
    return '';
  };

  // Add validation check for preview
  const isFormValid = () => {
    const requiredFields = [
      { value: invoiceData.invoiceNumber, validator: validateRequired },
      { value: invoiceData.date, validator: validateRequired },
      { value: invoiceData.dueDate, validator: validateRequired },
      { value: invoiceData.sender.name, validator: validateRequired },
      { value: invoiceData.sender.address, validator: validateRequired },
      { value: invoiceData.sender.email, validator: validateEmail },
      { value: invoiceData.sender.phone, validator: validatePhone },
      { value: invoiceData.recipient.companyName, validator: validateRequired },
      { value: invoiceData.recipient.address, validator: validateRequired },
    ];

    return requiredFields.every(({ value, validator }) => !validator(value));
  };

  // Update the preview button click handler
  const handlePreviewClick = () => {
    if (isFormValid()) {
      setShowPreview(!showPreview);
    } else {
      // Show validation errors
      const validationErrors = document.querySelectorAll('.text-danger');
      validationErrors.forEach(error => {
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  // Indian bank details component
  const IndianBankDetails = ({ payment, onChange }) => {
    return (
      <>
        <InputWithTooltip 
          id="accountNumber"
          label="Account Number"
          type="text"
          value={payment.accountNumber || ''}
          onChange={(e) => onChange('payment', 'accountNumber', e.target.value)}
          placeholder="XXXXXXXXXX"
          tooltipText="Your bank account number"
        />
        
        <InputWithTooltip 
          id="ifsc"
          label="IFSC Code"
          type="text"
          value={payment.ifsc || ''}
          onChange={(e) => onChange('payment', 'ifsc', e.target.value.toUpperCase())}
          placeholder="SBIN0000XXX"
          tooltipText="Indian Financial System Code (IFSC) - 11 character code to identify the bank branch"
          validation={validateIFSC}
        />
        
        <InputWithTooltip 
          id="accountName"
          label="Account Holder Name"
          type="text"
          value={payment.accountName || ''}
          onChange={(e) => onChange('payment', 'accountName', e.target.value)}
          placeholder="John Smith"
          tooltipText="The name of the account holder as it appears on the bank account"
        />
        
        <InputWithTooltip 
          id="upi"
          label="UPI ID"
          type="text"
          value={payment.upi || ''}
          onChange={(e) => onChange('payment', 'upi', e.target.value)}
          placeholder="name@upi"
          tooltipText="Unified Payments Interface (UPI) ID for instant transfers in India"
        />
      </>
    );
  };

  // International bank details component
  const InternationalBankDetails = ({ payment, onChange }) => {
    return (
      <>
        <InputWithTooltip 
          id="bankName"
          label="Bank Name"
          type="text"
          value={payment.bankName || ''}
          onChange={(e) => onChange('payment', 'bankName', e.target.value)}
          placeholder="Bank Name"
          tooltipText="The name of your bank where payments should be sent."
        />
        
        <InputWithTooltip 
          id="iban"
          label="IBAN"
          type="text"
          value={payment.iban || ''}
          onChange={(e) => onChange('payment', 'iban', e.target.value)}
          placeholder="XX00 0000 0000 0000 0000 0000"
          tooltipText="International Bank Account Number (IBAN) for international transfers."
        />
        
        <InputWithTooltip 
          id="swift"
          label="SWIFT/BIC"
          type="text"
          value={payment.swift || ''}
          onChange={(e) => onChange('payment', 'swift', e.target.value.toUpperCase())}
          placeholder="BANKXXXX"
          tooltipText="SWIFT/BIC code for international bank transfers."
        />
      </>
    );
  };

  return (
    <div className="h-full">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <div className="flex justify-between">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Invoice Generator Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="ml-2 font-bold">Invoice Generator</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={loadSampleData}
                className="btn btn-secondary"
              >
                <FaDatabase className="mr-2" />
                Load Sample Data
              </button>
              <button 
                onClick={handlePreviewClick}
                className="btn btn-primary"
              >
                <FaEye className="mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="btn btn-primary"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container p-4">
        {showPreview ? (
          <div ref={invoicePreviewRef}>
            <InvoicePreview data={invoiceData} />
          </div>
        ) : (
          <div className="card space-y-6">
            <h2 className="font-bold">Invoice Details</h2>
            
            {/* Invoice Information */}
            <div className="grid grid-cols-1 md-grid-cols-3">
              <InputWithTooltip 
                id="invoiceNumber"
                label="Invoice Number"
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', '', e.target.value)}
                placeholder="INV-2025-0001"
                tooltipText="A unique identifier for this invoice. Example: INV-2025-0001"
                required={true}
                validation={validateRequired}
              />
              
              <InputWithTooltip 
                id="date"
                label="Issue Date"
                type="date"
                value={invoiceData.date}
                onChange={(e) => handleInputChange('date', '', e.target.value)}
                placeholder=""
                tooltipText="The date when this invoice was issued."
                required={true}
                validation={validateRequired}
              />
              
              <InputWithTooltip 
                id="dueDate"
                label="Due Date"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange('dueDate', '', e.target.value)}
                placeholder=""
                tooltipText="The deadline for payment. Typically 30 days after the issue date."
                required={true}
                validation={validateRequired}
              />
            </div>

            {/* Currency Selection */}
            <div>
              <h3 className="section-title">Currency</h3>
              <div className="flex gap-4 flex-wrap">
                {currencySymbols.map(currency => (
                  <button
                    key={currency.symbol}
                    onClick={() => handleInputChange('currency', '', currency.symbol)}
                    className={`btn ${invoiceData.currency === currency.symbol ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {getCurrencyIcon(currency.symbol)} {currency.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Information */}
            <div>
              <h3 className="section-title">Sender Information</h3>
              <div className="grid grid-cols-1 md-grid-cols-2">
                <InputWithTooltip 
                  id="senderName"
                  label="Name"
                  type="text"
                  value={invoiceData.sender.name}
                  onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                  placeholder="Your Name or Company Name"
                  tooltipText="Your name or company name that's issuing this invoice."
                  required={true}
                  validation={validateRequired}
                />
                
                <InputWithTooltip 
                  id="senderAddress"
                  label="Address"
                  type="text"
                  value={invoiceData.sender.address}
                  onChange={(e) => handleInputChange('sender', 'address', e.target.value)}
                  placeholder="123 Street Name, City, Country"
                  tooltipText="Your full address including street, city and country."
                  required={true}
                  validation={validateRequired}
                />
                
                <InputWithTooltip 
                  id="senderEmail"
                  label="Email"
                  type="email"
                  value={invoiceData.sender.email}
                  onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                  placeholder="your@email.com"
                  tooltipText="Your contact email address."
                  required={true}
                  validation={validateEmail}
                />
                
                <InputWithTooltip 
                  id="senderPhone"
                  label="Phone"
                  type="text"
                  value={invoiceData.sender.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange('sender', 'phone', value);
                  }}
                  placeholder="1234567890"
                  tooltipText="Your contact phone number"
                  validation={validatePhone}
                  customInput={
                    <div className="country-code-selector">
                      <select
                        value={invoiceData.sender.countryCode}
                        onChange={(e) => handleInputChange('sender', 'countryCode', e.target.value)}
                        className="input-field"
                      >
                        {countryCodes.map(({ code, country }) => (
                          <option key={code} value={code}>
                            {code} ({country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={invoiceData.sender.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('sender', 'phone', value);
                        }}
                        placeholder="1234567890"
                        className="input-field"
                      />
                    </div>
                  }
                />
              </div>
            </div>

            {/* Recipient Information */}
            <div>
              <h3 className="section-title">Recipient Information</h3>
              <div className="grid grid-cols-1 md-grid-cols-2">
                <InputWithTooltip 
                  id="recipientCompany"
                  label="Company Name"
                  type="text"
                  value={invoiceData.recipient.companyName}
                  onChange={(e) => handleInputChange('recipient', 'companyName', e.target.value)}
                  placeholder="Client Company Name"
                  tooltipText="The name of the company or person you're invoicing."
                  required={true}
                  validation={validateRequired}
                />
                
                <InputWithTooltip 
                  id="recipientAddress"
                  label="Address"
                  type="text"
                  value={invoiceData.recipient.address}
                  onChange={(e) => handleInputChange('recipient', 'address', e.target.value)}
                  placeholder="456 Client Street, City, Country"
                  tooltipText="The full address of the client including street, city and country."
                  required={true}
                  validation={validateRequired}
                />
                
                <InputWithTooltip 
                  id="recipientRegNo"
                  label="Registration Number"
                  type="text"
                  value={invoiceData.recipient.regNo}
                  onChange={(e) => handleInputChange('recipient', 'regNo', e.target.value)}
                  placeholder="REG-12345"
                  tooltipText="The business registration number of the client (if applicable)."
                />
                
                <InputWithTooltip 
                  id="recipientVatId"
                  label="VAT ID"
                  type="text"
                  value={invoiceData.recipient.vatId}
                  onChange={(e) => handleInputChange('recipient', 'vatId', e.target.value)}
                  placeholder="VAT123456789"
                  tooltipText="The VAT identification number of the client (if applicable)."
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="section-title" style={{ marginTop: 0 }}>Line Items</h3>
                <button
                  onClick={addItem}
                  className="btn btn-primary"
                >
                  <FaPlusCircle className="mr-2" /> Add Item
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="input-field"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Product or service description"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input-field"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="1"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="input-field"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="100.00"
                        />
                      </td>
                      <td className="text-medium">
                        {invoiceData.currency}{(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => removeItem(index)}
                          className="btn btn-danger"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="section-title">Payment Information</h3>
              
              {/* Banking Type Selection */}
              <div className="mb-4">
                <label className="form-label">Banking Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleInputChange('bankingType', '', 'international')}
                    className={`btn ${invoiceData.bankingType === 'international' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    International Banking
                  </button>
                  <button
                    onClick={() => handleInputChange('bankingType', '', 'indian')}
                    className={`btn ${invoiceData.bankingType === 'indian' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Indian Banking
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md-grid-cols-2">
                {invoiceData.bankingType === 'indian' ? (
                  <IndianBankDetails payment={invoiceData.payment} onChange={handleInputChange} />
                ) : (
                  <InternationalBankDetails payment={invoiceData.payment} onChange={handleInputChange} />
                )}
                
                {/* Crypto is common for both */}
                <InputWithTooltip 
                  id="cryptoAddress"
                  label="Crypto Address"
                  type="text"
                  value={invoiceData.payment.cryptoAddress}
                  onChange={(e) => handleInputChange('payment', 'cryptoAddress', e.target.value)}
                  placeholder="0x0000000000000000000000000000000000000000"
                  tooltipText="Optional: Cryptocurrency wallet address for digital currency payments."
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="section-title">Notes</h3>
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Additional Notes
                  <span 
                    className="ml-2" 
                    style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    title="Any additional information or payment terms for the client."
                  >
                    <FaInfoCircle size={14} />
                  </span>
                </label>
                <textarea
                  id="notes"
                  className="input-field"
                  rows={4}
                  value={invoiceData.notes}
                  onChange={(e) => handleInputChange('notes', '', e.target.value)}
                  placeholder="Thank you for your business! Payment is due within 30 days..."
                />
              </div>
            </div>

            {/* Totals */}
            <div className="border-top">
              <div className="flex justify-between">
                <div></div>
                <div style={{ width: '250px' }}>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-medium">Subtotal:</span>
                    <span className="text-dark">{invoiceData.currency}{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-medium">VAT (0%):</span>
                    <span className="text-dark">{invoiceData.currency}0.00</span>
                  </div>
                  <div className="flex justify-between border-top">
                    <span className="font-bold text-dark">Total:</span>
                    <span className="font-bold text-primary">{invoiceData.currency}{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm">
        Built with ❤️ by JordInc
      </footer>
    </div>
  );
}

// Helper function to get currency icon
function getCurrencyIcon(symbol) {
  switch (symbol) {
    case '$':
      return <FaDollarSign />;
    case '€':
      return <FaEuroSign />;
    case '£':
      return <FaPoundSign />;
    case '¥':
      return <FaYenSign />;
    case '₹':
      return '₹'; // INR symbol
    default:
      return symbol;
  }
}

export default App; 