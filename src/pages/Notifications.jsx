import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Bell, Mail, CheckCircle2, XCircle } from "lucide-react";
import { getNotificationHistory, sendAllPendingReminders } from "../services/notifications";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { formatDate } from "../utils/formatters";

export default function Notifications() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotificationHistory({ limit: 50 });
      setHistory(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendAll = async () => {
    setSending(true);
    try {
      const res = await sendAllPendingReminders();
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send reminders");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
        <p className="text-sm text-ink/50">Email fee reminders and see what's already gone out.</p>
      </div>

      <Card>
        <h3 className="mb-1 font-display text-base font-bold text-ink">Email Reminders to All Pending Students</h3>
        <p className="mb-4 text-sm text-ink/50">
          Sends an email to every student (or their parent) with a pending, partial, or overdue fee. Students
          without an email on file are skipped and marked as failed below.
        </p>
        <Button icon={Mail} onClick={handleSendAll} loading={sending} className="w-full sm:w-auto">
          {sending ? "Sending..." : "Send Reminders"}
        </Button>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <h3 className="px-5 pt-5 pb-3 font-display text-base font-bold text-ink">Reminder History</h3>
        {loading ? (
          <Loader label="Loading history..." />
        ) : history.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState icon={Bell} title="No reminders sent yet" description="Once you send a reminder, it'll show up here." />
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {history.map((n) => {
              const sent = n.status === "Sent";
              return (
                <div key={n._id} className="flex items-start gap-3 px-5 py-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      sent ? "bg-meadow-100 text-meadow-600" : "bg-oxblood-100 text-oxblood-600"
                    }`}
                  >
                    {sent ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {n.student?.fullName}{" "}
                      <span className="font-normal text-ink/40">{sent ? "— email sent" : "— failed"}</span>
                    </p>
                    <p className="truncate text-xs text-ink/50">
                      {sent ? n.message : n.failureReason || "Couldn't send"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink/40">{formatDate(n.sentAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
