import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./formatters";

/**
 * Exports tabular data as a titled PDF report.
 * @param {String} title
 * @param {Array<String>} columns
 * @param {Array<Array<String|Number>>} rows
 * @param {String} filename
 */
export const exportToPdf = (title, columns, rows, filename = "report") => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated on ${formatDate(new Date())}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows,
    headStyles: { fillColor: [108, 92, 231] },
    styles: { fontSize: 9 },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Generates a simple one-page fee receipt PDF for a single payment.
 */
export const generateFeeReceipt = ({
  instituteName,
  studentName,
  monthLabel,
  amount,
  paidDate,
  paymentMode,
  receiptNumber,
  currency = "INR",
}) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(108, 92, 231);
  doc.text(instituteName || "ClassPilot", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text("Fee Payment Receipt", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Receipt No: ${receiptNumber || "-"}`, 14, 38);
  doc.text(`Date: ${formatDate(paidDate)}`, 14, 44);

  autoTable(doc, {
    startY: 52,
    head: [["Description", "Details"]],
    body: [
      ["Student Name", studentName],
      ["Fee Month", monthLabel],
      ["Payment Mode", paymentMode],
      ["Amount Paid", formatCurrency(amount, currency)],
    ],
    headStyles: { fillColor: [108, 92, 231] },
  });

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("This is a system-generated receipt.", 14, doc.lastAutoTable.finalY + 12);

  doc.save(`receipt-${studentName.replace(/\s+/g, "-")}-${monthLabel.replace(/\s+/g, "-")}.pdf`);
};
