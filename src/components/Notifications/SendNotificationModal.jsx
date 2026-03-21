import { Bell, Search, Send } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUsers } from "../../context/UserContext";
import { sendTopicNotification } from "../../utils/fcmService";
import LoadingSpinner from "../common/LoadingSpinner";

const SendNotificationModal = ({ onClose }) => {
  const { users } = useUsers();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, send to each selected user's FCM token
      // Since we're using topics, we send to a special topic or handle individually
      // TODO: Implement per-user FCM token sending when user tokens are available
      await sendTopicNotification("all_users", title.trim(), body.trim(), "");

      toast.success(
        `Notification sent to ${selectedUserIds.length} user(s)!`,
      );
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

      {/* User selection */}
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

      {/* Preview */}
      {(title.trim() || body.trim()) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {title || "Notification Title"}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {body || "Notification body text"}
              </p>
            </div>
          </div>
        </div>
      )}

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
          ) : (
            <div className="flex items-center gap-2">
              <Send size={16} />
              Send Notification
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

SendNotificationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default SendNotificationModal;
