# Invoice Generator

A modern, responsive invoice generator web application built with React and Tailwind CSS.

## Features

- Create and edit professional invoices
- Real-time calculations for line items and totals
- Preview invoice before downloading
- Download invoices as PDF
- Local storage persistence
- Responsive design
- Clean and professional UI

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- html2pdf.js
- React Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

1. Fill in the invoice details:
   - Invoice number, date, and due date
   - Sender information
   - Recipient information
   - Line items (add/remove as needed)
   - Payment information
   - Notes (optional)

2. Use the "Show Preview" button to see how the invoice will look

3. Click "Download PDF" to save the invoice as a PDF file

## Project Structure

```
src/
  ├── components/
  │   └── InvoicePreview.tsx
  ├── App.tsx
  ├── main.tsx
  └── index.css
```

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.
