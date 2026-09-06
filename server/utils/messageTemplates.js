const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Builds a fee-reminder email (subject + plain-text body) for a student.
 * @param {Object} params
 * @param {String} params.studentName
 * @param {Number} params.amount
 * @param {Number} params.month - 1-12
 * @param {Number} params.year
 * @param {Date} params.dueDate
 * @param {String} params.instituteName
 * @param {String} params.currency
 */
const buildFeeReminderEmail = ({
  studentName,
  amount,
  month,
  year,
  dueDate,
  instituteName = "Your Tuition Classes",
  currency = "INR",
}) => {
  const currencySymbol = currency === "INR" ? "₹" : currency;
  const monthLabel = `${monthNames[month - 1]} ${year}`;
  const dueLabel = formatDate(dueDate);

  const subject = `Fee Reminder — ${monthLabel} (${instituteName})`;

  const text = `Hello ${studentName},

This is a friendly reminder that your tuition fee for ${monthLabel} is currently pending.

Amount Due: ${currencySymbol}${amount}
Due Date: ${dueLabel}

Please make the payment at your earliest convenience. If you have already paid, kindly ignore this message.

Thank you,
${instituteName}`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1E252B; max-width: 480px;">
      <p>Hello ${studentName},</p>
      <p>This is a friendly reminder that your tuition fee for <strong>${monthLabel}</strong> is currently pending.</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #57626B;">Amount Due</td><td style="font-weight: 600;">${currencySymbol}${amount}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #57626B;">Due Date</td><td style="font-weight: 600;">${dueLabel}</td></tr>
      </table>
      <p>Please make the payment at your earliest convenience. If you have already paid, kindly ignore this message.</p>
      <p>Thank you,<br/>${instituteName}</p>
    </div>
  `;

  return { subject, text, html };
};

module.exports = { buildFeeReminderEmail };
