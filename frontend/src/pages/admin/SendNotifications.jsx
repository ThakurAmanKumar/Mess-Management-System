import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiBell, FiSend, FiTrash2, FiRefreshCw, FiInfo } from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./SendNotifications.module.css";

const SendNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const safeFormat = (value, fmt, fallback = "—") => {
    if (!value) return fallback;
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications();
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSending(true);
      const response = await adminAPI.sendNotification(formData);
      if (response.data.success) {
        toast.success("Notification sent successfully!");
        setFormData({ title: "", message: "", type: "info" });
        fetchNotifications();
      }
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const getTypeVariant = (type) => {
    const variants = {
      info: "info",
      warning: "warning",
      success: "success",
      urgent: "danger",
    };
    return variants[type] || "default";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "urgent":
        return "🚨";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <AdminLayout>
        <Loader fullScreen />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Send Notifications</h1>
            <p>Broadcast messages to all students</p>
          </div>
          <Button icon={FiRefreshCw} variant="ghost" onClick={fetchNotifications}>
            Refresh
          </Button>
        </header>

        <div className={styles.content}>
          {/* Send Notification Form */}
          <Card className={styles.formCard}>
            <div className={styles.formHeader}>
              <FiSend />
              <h3>New Notification</h3>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Title"
                placeholder="Enter notification title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <Textarea
                label="Message"
                placeholder="Enter your message to students..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
              />

              <Select
                label="Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                options={[
                  { value: "info", label: "ℹ️ Information" },
                  { value: "success", label: "✅ Success" },
                  { value: "warning", label: "⚠️ Warning" },
                  { value: "urgent", label: "🚨 Urgent" },
                ]}
              />

              {/* Preview */}
              {(formData.title || formData.message) && (
                <div className={styles.preview}>
                  <span className={styles.previewLabel}>Preview:</span>
                  <div
                    className={`${styles.previewCard} ${
                      styles[`preview${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`]
                    }`}
                  >
                    <span className={styles.previewIcon}>
                      {getTypeIcon(formData.type)}
                    </span>
                    <div>
                      <strong>{formData.title || "Notification Title"}</strong>
                      <p>{formData.message || "Your message will appear here..."}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                icon={FiSend}
                loading={sending}
                fullWidth
              >
                Send Notification
              </Button>
            </form>
          </Card>

          {/* Recent Notifications */}
          <Card className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <FiBell />
              <h3>Recent Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <FiInfo size={48} />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              <div className={styles.notificationsList}>
                {notifications.map((notification) => (
                  <div key={notification._id || notification.id} className={styles.notificationItem}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationTitle}>
                        <span className={styles.typeIcon}>
                          {getTypeIcon(notification.type)}
                        </span>
                        <strong>{notification.title}</strong>
                      </div>
                      <Badge variant={getTypeVariant(notification.type)}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <span className={styles.notificationDate}>
                      {safeFormat(notification.created_at || notification.createdAt, "MMM d, yyyy 'at' h:mm a", "—")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SendNotifications;
