import React from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload } from 'react-icons/fa';

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

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const calculateTotal = () => {
    return data.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-preview');
    if (element) {
      const opt = {
        margin: 1,
        filename: `invoice-${data.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  // Get currency symbol
  const currencySymbol = data.currency || '$';

  // Check if a field has a value
  const hasValue = (value) => {
    return value !== undefined && value !== null && value !== '';
  };

  return (
    <div className="card">
      <div id="invoice-preview" className="space-y-6">
        {/* Header */}
        <div className="flex justify-between border-top pb-4">
          <div>
            <h1>INVOICE</h1>
            <p className="text-medium">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-medium">Date: {data.date}</p>
            <p className="text-medium">Due Date: {data.dueDate}</p>
          </div>
        </div>

        {/* Sender and Recipient */}
        <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
          <div>
            <h3 className="section-title">From:</h3>
            <p className="font-medium">{data.sender.name}</p>
            {hasValue(data.sender.address) && <p className="text-medium">{data.sender.address}</p>}
            {hasValue(data.sender.email) && <p className="text-medium">{data.sender.email}</p>}
            {hasValue(data.sender.phone) && <p className="text-medium">{data.sender.phone}</p>}
          </div>
          <div>
            <h3 className="section-title">To:</h3>
            <p className="font-medium">{data.recipient.companyName}</p>
            {hasValue(data.recipient.address) && <p className="text-medium">{data.recipient.address}</p>}
            {hasValue(data.recipient.regNo) && <p className="text-medium">Reg No: {data.recipient.regNo}</p>}
            {hasValue(data.recipient.vatId) && <p className="text-medium">VAT ID: {data.recipient.vatId}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                  <td>{currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-between">
          <div></div>
          <div style={{ width: '250px' }}>
            <div className="flex justify-between mb-4">
              <span className="font-medium text-medium">Subtotal:</span>
              <span className="text-dark">{currencySymbol}{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-medium text-medium">VAT (0%):</span>
              <span className="text-dark">{currencySymbol}0.00</span>
            </div>
            <div className="flex justify-between border-top">
              <span className="font-bold text-dark">Total:</span>
              <span className="font-bold text-primary">{currencySymbol}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="section-title">Payment Information</h3>
          <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
            {data.bankingType === 'indian' ? (
              // Indian Banking Details
              <>
                <div>
                  {hasValue(data.payment.accountName) && (
                    <p className="text-medium">Account Name: {data.payment.accountName}</p>
                  )}
                  {hasValue(data.payment.accountNumber) && (
                    <p className="text-medium">Account Number: {data.payment.accountNumber}</p>
                  )}
                </div>
                <div>
                  {hasValue(data.payment.ifsc) && (
                    <p className="text-medium">IFSC: {data.payment.ifsc}</p>
                  )}
                  {hasValue(data.payment.upi) && (
                    <p className="text-medium">UPI: {data.payment.upi}</p>
                  )}
                </div>
              </>
            ) : (
              // International Banking Details
              <>
                <div>
                  {hasValue(data.payment.bankName) && (
                    <p className="text-medium">Bank: {data.payment.bankName}</p>
                  )}
                  {hasValue(data.payment.iban) && (
                    <p className="text-medium">IBAN: {data.payment.iban}</p>
                  )}
                </div>
                <div>
                  {hasValue(data.payment.swift) && (
                    <p className="text-medium">SWIFT/BIC: {data.payment.swift}</p>
                  )}
                </div>
              </>
            )}
            
            {/* Only show crypto if it has a value */}
            {hasValue(data.payment.cryptoAddress) && (
              <div className="col-span-2">
                <p className="text-medium">Crypto: {data.payment.cryptoAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {hasValue(data.notes) && (
          <div>
            <h3 className="section-title">Notes</h3>
            <p className="text-medium">{data.notes}</p>
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="mt-4 flex justify-between">
        <div></div>
        <button
          onClick={handleDownloadPDF}
          className="btn btn-primary"
        >
          <FaDownload className="mr-2" /> Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview; 