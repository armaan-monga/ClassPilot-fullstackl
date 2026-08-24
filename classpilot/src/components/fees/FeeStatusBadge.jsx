import { FEE_STATUS_STYLES } from "../../utils/constants";

export default function FeeStatusBadge({ status }) {
  return <span className={`pill ${FEE_STATUS_STYLES[status] || "bg-ink/5 text-ink/50"}`}>{status}</span>;
}
