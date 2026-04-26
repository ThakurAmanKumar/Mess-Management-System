import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiAlertCircle, FiCheck, FiClock, FiLoader, FiRefreshCw, FiMessageSquare } from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./ViewComplaints.module.css";

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const res = await adminAPI.getAllComplaints(params);
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      const res = await adminAPI.updateComplaintStatus(selectedComplaint.id, {
        status: newStatus,
        admin_response: response || null,
      });
      if (res.data.success) {
        toast.success("Complaint updated successfully");
        setIsModalOpen(false);
        setSelectedComplaint(null);
        setResponse("");
        setNewStatus("");
        fetchComplaints();
      }
    } catch (error) {
      toast.error("Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResponse(complaint.admin_response || "");
    setIsModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <FiCheck />;
      case "in-progress":
        return <FiLoader />;
      default:
        return <FiClock />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "resolved":
        return "success";
      case "in-progress":
        return "warning";
      default:
        return "danger";
    }
  };

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    "in-progress": complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const safeFormat = (value, fmt, fallback = 'Unknown') => {
    if (!value) return fallback
    const d = new Date(value)
    if (isNaN(d.getTime())) return fallback
    return format(d, fmt)
  }

  if (loading && complaints.length === 0) {
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
            <h1>View Complaints</h1>
            <p>Manage and respond to student complaints</p>
          </div>
          <Button icon={FiRefreshCw} variant="ghost" onClick={fetchComplaints}>
            Refresh
          </Button>
        </header>

        {/* Status Summary */}
        <div className={styles.statusSummary}>
          <div
            className={`${styles.statusCard} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            <FiMessageSquare className={styles.statusIcon} />
            <div>
              <span className={styles.statusCount}>{statusCounts.all}</span>
              <span className={styles.statusLabel}>Total</span>
            </div>
          </div>
          <div
            className={`${styles.statusCard} ${filter === "pending" ? styles.active : ""}`}
            onClick={() => setFilter("pending")}
          >
            <FiClock className={styles.statusIconPending} />
            <div>
              <span className={styles.statusCount}>{statusCounts.pending}</span>
              <span className={styles.statusLabel}>Pending</span>
            </div>
          </div>
          <div
            className={`${styles.statusCard} ${filter === "in-progress" ? styles.active : ""}`}
            onClick={() => setFilter("in-progress")}
          >
            <FiLoader className={styles.statusIconProgress} />
            <div>
              <span className={styles.statusCount}>{statusCounts["in-progress"]}</span>
              <span className={styles.statusLabel}>In Progress</span>
            </div>
          </div>
          <div
            className={`${styles.statusCard} ${filter === "resolved" ? styles.active : ""}`}
            onClick={() => setFilter("resolved")}
          >
            <FiCheck className={styles.statusIconResolved} />
            <div>
              <span className={styles.statusCount}>{statusCounts.resolved}</span>
              <span className={styles.statusLabel}>Resolved</span>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className={styles.complaintsList}>
          {complaints.length === 0 ? (
            <Card className={styles.emptyState}>
              <FiAlertCircle size={48} />
              <p>No complaints found</p>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <Card key={complaint.id || complaint._id} className={styles.complaintCard}>
                <div className={styles.complaintHeader}>
                  <div className={styles.studentInfo}>
                    <div className={styles.avatar}>
                      {complaint.students?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <span className={styles.studentName}>
                        {complaint.students?.name || "Unknown"}
                      </span>
                      <span className={styles.studentRoll}>
                        {complaint.students?.roll_number}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {getStatusIcon(complaint.status)}
                    <span style={{ marginLeft: "0.25rem" }}>
                      {complaint.status.replace("-", " ")}
                    </span>
                  </Badge>
                </div>

                <div className={styles.complaintBody}>
                  <span className={styles.complaintCategory}>{complaint.category}</span>
                  <p className={styles.complaintText}>{complaint.description}</p>
                  {complaint.admin_response && (
                    <div className={styles.adminResponse}>
                      <strong>Admin Response:</strong>
                      <p>{complaint.admin_response}</p>
                    </div>
                  )}
                </div>

                <div className={styles.complaintFooter}>
                  <span className={styles.date}>
                    {safeFormat(complaint.created_at || complaint.createdAt, "MMM d, yyyy 'at' h:mm a", 'Unknown')}
                  </span>
                  <Button
                    size="sm"
                    variant={complaint.status === "resolved" ? "ghost" : "primary"}
                    onClick={() => openUpdateModal(complaint)}
                  >
                    {complaint.status === "resolved" ? "View" : "Respond"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Update Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Update Complaint"
        >
          {selectedComplaint && (
            <div className={styles.modalContent}>
              <div className={styles.complaintDetail}>
                <strong>Student:</strong> {selectedComplaint.students?.name}
              </div>
              <div className={styles.complaintDetail}>
                <strong>Category:</strong> {selectedComplaint.category}
              </div>
              <div className={styles.complaintDetail}>
                <strong>Description:</strong>
                <p>{selectedComplaint.description}</p>
              </div>

              <Select
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                ]}
              />

              <Textarea
                label="Admin Response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response to the student..."
                rows={4}
              />

              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} loading={updating}>
                  Update
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ViewComplaints;
