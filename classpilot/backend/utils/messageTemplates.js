const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Builds a fee-reminder message for a given channel.
 * @param {Object} params
 * @param {String} params.channel - "WhatsApp" | "SMS" | "Email"
 * @param {String} params.studentName
 * @param {Number} params.amount
 * @param {Number} params.month - 1-12
 * @param {Number} params.year
 * @param {Date} params.dueDate
 * @param {String} params.instituteName
 * @param {String} params.currency
 */
const buildFeeReminderMessage = ({
  channel,
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

  if (channel === "SMS") {
    // SMS: short and to the point (character-limit friendly)
    return `Dear ${studentName}, your ${monthLabel} tuition fee of ${currencySymbol}${amount} is pending. Please pay by ${dueLabel}. - ${instituteName}`;
  }

  if (channel === "Email") {
    return `Subject: Fee Reminder - ${monthLabel}

Hello ${studentName},

This is a friendly reminder that your tuition fee for ${monthLabel} is currently pending.

Amount Due: ${currencySymbol}${amount}
Due Date: ${dueLabel}

Please make the payment at your earliest convenience. If you have already paid, kindly ignore this message.

Thank you,
${instituteName}`;
  }

  // Default: WhatsApp
  return `Hello ${studentName},

Your tuition fee for ${monthLabel} is pending.
Amount: ${currencySymbol}${amount}
Please submit before ${dueLabel}.

Thank you.
- ${instituteName}`;
};

module.exports = { buildFeeReminderMessage };
