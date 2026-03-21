import { CalendarClock } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { useEvents } from "../../context/EventContext";
import { sendTopicNotification } from "../../utils/fcmService";
import LoadingSpinner from "../common/LoadingSpinner";

const NotificationModal = ({ event, onClose }) => {
  const { createNotificationJob } = useEvents();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topic = event.notificationTopic || "leaderboard";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Body is required");
      return;
    }
    if (isScheduled && !scheduledAt) {
      toast.error("Please pick a scheduled date/time");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isScheduled) {
        // ── Send Now: call FCM V1 API directly ────────────────────────────
        await sendTopicNotification(topic, title.trim(), body.trim(), event.id);

        await createNotificationJob(event.id, {
          title: title.trim(),
          body: body.trim(),
          type: "topic",
          topic: topic,
          userIds: [],
          scheduledAt: Timestamp.fromDate(new Date()),
          status: "sent",
        });

        toast.success("Notification sent successfully!");
      } else {
        // ── Schedule: save to Firestore only ──────────────────────────────
        await createNotificationJob(event.id, {
          title: title.trim(),
          body: body.trim(),
          type: "topic",
          topic: topic,
          userIds: [],
          scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
        });

        toast.success("Notification scheduled successfully!");
      }

      onClose();
    } catch (err) {
      console.error("Notification error:", err);
      toast.error(err?.message || "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Topic info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700">
        Sending to topic:{" "}
        <span className="font-semibold">{topic}</span>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notification Title
        </label>
        <input
          type="text"
          className="mt-1 input w-full"
          placeholder="Enter notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notification Body
        </label>
        <textarea
          className="mt-1 input w-full min-h-[80px]"
          placeholder="Enter notification message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {/* Schedule toggle */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CalendarClock size={16} />
            Schedule for later
          </span>
        </label>

        {isScheduled && (
          <input
            type="datetime-local"
            className="input w-full"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "btn-disabled" : "btn btn-primary"}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              Sending...
            </div>
          ) : isScheduled ? (
            "Schedule Notification"
          ) : (
            "Send Now"
          )}
        </button>
      </div>
    </form>
  );
};

NotificationModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    notificationTopic: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationModal;
