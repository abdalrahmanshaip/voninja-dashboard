import { CalendarClock, Clock, Trash, User } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEvents } from "../../context/EventContext";

const formatDate = (value) => {
  if (!value) return "-";
  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "-";
};

const statusBadge = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "sent":
      return "bg-green-100 text-green-800 border-green-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const ScheduledNotifications = ({ event }) => {
  const { fetchNotificationJobs, deleteNotificationJob } = useEvents();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNotificationJobs(event.id).then((data) => {
      if (!cancelled) {
        setJobs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [event.id, fetchNotificationJobs]);

  const handleDelete = async (jobId) => {
    try {
      await deleteNotificationJob(event.id, jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Notification job deleted");
    } catch {
      toast.error("Failed to delete notification job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <span>Loading notification jobs…</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No notification jobs found for this event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500 font-medium">
        {jobs.length} notification job{jobs.length !== 1 ? "s" : ""}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title + Status */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${statusBadge(job.status)}`}
                  >
                    {job.status}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {job.type === "topic" ? (
                      <>Topic: {job.topic}</>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        {job.userIds?.length || 0} user
                        {job.userIds?.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </span>
                </div>

                {/* Body */}
                <p className="text-sm text-gray-600">{job.body}</p>

                {/* Timestamps */}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    Scheduled: {formatDate(job.scheduledAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created: {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              {/* Delete action (only for pending jobs) */}
              {job.status === "pending" && (
                <button
                  onClick={() => handleDelete(job.id)}
                  className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete this notification job"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ScheduledNotifications.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default ScheduledNotifications;
