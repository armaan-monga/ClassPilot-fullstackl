import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Bell, MessageCircle, Mail, MessageSquare } from "lucide-react";
import { getNotificationHistory, sendAllPendingReminders } from "../services/notifications";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { formatDate } from "../utils/formatters";

const CHANNEL_ICONS = {
  WhatsApp: { icon: MessageCircle, color: "bg-meadow-100 text-meadow-600" },
  SMS: { icon: MessageSquare, color: "bg-sky-100 text-sky-600" },
  Email: { icon: Mail, color: "bg-iris-100 text-iris-600" },
};

export default function Notifications() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

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

  const handleSendAll = async (channel) => {
    setSending(channel);
    try {
      const res = await sendAllPendingReminders([channel]);
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send reminders");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
        <p className="text-sm text-ink/50">Send fee reminders and see what's already gone out.</p>
      </div>

      <Card>
        <h3 className="mb-1 font-display text-base font-bold text-ink">Send Reminders to All Pending Students</h3>
        <p className="mb-4 text-sm text-ink/50">
          Generates a ready-to-send message for every student with a pending, partial, or overdue fee.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(CHANNEL_ICONS).map(([channel, { icon: Icon, color }]) => (
            <button
              key={channel}
              onClick={() => handleSendAll(channel)}
              disabled={sending === channel}
              className="flex flex-col items-center gap-2 rounded-2xl border border-ink/5 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft disabled:opacity-50"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={19} />
              </div>
              <span className="text-sm font-semibold text-ink">
                {sending === channel ? "Sending..." : `Send via ${channel}`}
              </span>
            </button>
          ))}
        </div>
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
              const conf = CHANNEL_ICONS[n.channel] || CHANNEL_ICONS.WhatsApp;
              const Icon = conf.icon;
              return (
                <div key={n._id} className="flex items-start gap-3 px-5 py-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${conf.color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {n.student?.fullName} <span className="font-normal text-ink/40">via {n.channel}</span>
                    </p>
                    <p className="truncate text-xs text-ink/50">{n.message}</p>
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
