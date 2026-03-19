import { Bell, CalendarClock, Search, Send } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { useEvents } from "../../context/EventContext";
import { useUsers } from "../../context/UserContext";
import LoadingSpinner from "../common/LoadingSpinner";

const NotificationModal = ({ event, onClose }) => {
  const { createNotificationJob } = useEvents();
  const { users } = useUsers();

  const [activeTab, setActiveTab] = useState("topic"); // "topic" | "users"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── User search filtering ────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(userSearch),
    );
  }, [users, userSearch]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAll = () => {
    setSelectedUserIds(filteredUsers.map((u) => u.id));
  };

  const deselectAll = () => {
    setSelectedUserIds([]);
  };

  // ─── Submit handler ────────────────────────────────────────────────────────
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
    if (activeTab === "users" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (isScheduled && !scheduledAt) {
      toast.error("Please pick a scheduled date/time");
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        title: title.trim(),
        body: body.trim(),
        type: activeTab === "topic" ? "topic" : "users",
        topic: activeTab === "topic" ? (event.notificationTopic || "leaderboard") : null,
        userIds: activeTab === "users" ? selectedUserIds : [],
        scheduledAt: isScheduled
          ? Timestamp.fromDate(new Date(scheduledAt))
          : Timestamp.fromDate(new Date()),
      };

      await createNotificationJob(event.id, jobData);

      toast.success(
        isScheduled
          ? "Notification scheduled successfully!"
          : "Notification job created!",
      );
      onClose();
    } catch {
      toast.error("Failed to create notification job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("topic")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "topic"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell size={16} />
          Topic Notification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send size={16} />
          Specific Users
        </button>
      </div>

      {/* Topic info */}
      {activeTab === "topic" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700">
          Sending to topic:{" "}
          <span className="font-semibold">
            {event.notificationTopic || "leaderboard"}
          </span>
        </div>
      )}

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

      {/* User selection (only for "users" tab) */}
      {activeTab === "users" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Users ({selectedUserIds.length} selected)
          </label>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="input w-full ps-10"
            />
          </div>

          {/* Select/Deselect all */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className="text-xs text-indigo-600 hover:underline"
              onClick={selectAll}
            >
              Select all ({filteredUsers.length})
            </button>
            <button
              type="button"
              className="text-xs text-gray-500 hover:underline"
              onClick={deselectAll}
            >
              Deselect all
            </button>
          </div>

          {/* User list */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUserIds.includes(user.id) ? "bg-indigo-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || user.phoneNumber || ""}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}

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
