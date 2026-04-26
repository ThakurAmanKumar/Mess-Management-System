import { useState, useEffect } from "react";
import {
  FiSearch,
  FiMail,
  FiCheck,
  FiX,
  FiUserPlus,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./ManageStudents.module.css";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    rollNumber: "",
    hostelName: "",
    roomNumber: "",
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? filter === "verified" : undefined;
      const response = await adminAPI.getAllStudents(params);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (studentId) => {
    try {
      const response = await adminAPI.verifyStudent(studentId);
      if (response.data.success) {
        toast.success("Student verified successfully");
        fetchStudents();
      }
    } catch (error) {
      toast.error("Failed to verify student");
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteStudent(studentId);
      if (response.data.success) {
        toast.success("Student deleted successfully");
        fetchStudents();
      }
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const handleToggleStatus = async (studentId) => {
    try {
      const response = await adminAPI.toggleStudentStatus(studentId);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchStudents();
      }
    } catch (error) {
      toast.error("Failed to update student status");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);

    try {
      const response = await adminAPI.addStudent(newStudent);
      if (response.data.success) {
        toast.success("Student added successfully");
        setShowAddModal(false);
        setNewStudent({
          name: "",
          email: "",
          rollNumber: "",
          hostelName: "",
          roomNumber: "",
          phoneNumber: "",
          password: "",
        });
        fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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
            <h1>Manage Students</h1>
            <p>Add, verify, and manage student accounts</p>
          </div>
          <div className={styles.headerActions}>
            <Button icon={FiRefreshCw} variant="ghost" onClick={fetchStudents}>
              Refresh
            </Button>
            <Button icon={FiUserPlus} onClick={() => setShowAddModal(true)}>
              Add Student
            </Button>
          </div>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={FiSearch}
            />
          </div>
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({students.length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "unverified" ? styles.active : ""} ${students.filter(s => !s.is_verified).length > 0 ? styles.hasNew : ""}`}
              onClick={() => setFilter("unverified")}
            >
              🔔 Pending Approval ({students.filter(s => !s.is_verified).length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === "verified" ? styles.active : ""}`}
              onClick={() => setFilter("verified")}
            >
              Approved
            </button>
          </div>
        </div>

        <Card className={styles.tableCard}>
          {filteredStudents.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No students found</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Hostel</th>
                  <th>Status</th>
                  <th>Ratings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.studentInfo}>
                          <span className={styles.name}>{student.name}</span>
                          <a
                            href={`mailto:${student.email}`}
                            className={styles.email}
                          >
                            <FiMail size={12} /> {student.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>{student.rollNumber}</td>
                    <td>
                      <span className={styles.hostelInfo}>
                        {student.hostelName} - {student.roomNumber}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statusBadges}>
                        <Badge variant={student.isVerified ? "success" : "warning"}>
                          {student.isVerified ? "Approved" : "⏳ Pending Approval"}
                        </Badge>
                        <Badge variant={student.isActive ? "primary" : "danger"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <span className={styles.ratingsBadge}>
                        {student.ratingsCount || 0} ratings
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {!student.isVerified && (
                          <button
                            className={`${styles.actionBtn} ${styles.approve}`}
                            onClick={() => handleVerifyStudent(student._id)}
                            title="Approve Student"
                          >
                            <FiCheck /> Approve
                          </button>
                        )}
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleToggleStatus(student._id)}
                          title={
                            student.is_active ? "Deactivate" : "Activate"
                          }
                        >
                          {student.is_active ? <FiX /> : <FiCheck />}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() =>
                            handleDeleteStudent(student._id, student.name)
                          }
                          title="Delete Student"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
      >
        <form onSubmit={handleAddStudent} className={styles.addForm}>
          <Input
            label="Full Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            value={newStudent.email}
            onChange={(e) =>
              setNewStudent({ ...newStudent, email: e.target.value })
            }
            required
          />
          <div className={styles.formRow}>
            <Input
              label="Roll Number"
              value={newStudent.rollNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, rollNumber: e.target.value })
              }
              required
            />
            <Input
              label="Phone Number"
              value={newStudent.phoneNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, phoneNumber: e.target.value })
              }
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Hostel Name"
              value={newStudent.hostelName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, hostelName: e.target.value })
              }
              required
            />
            <Input
              label="Room Number"
              value={newStudent.roomNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, roomNumber: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Password"
            type="password"
            value={newStudent.password}
            onChange={(e) =>
              setNewStudent({ ...newStudent, password: e.target.value })
            }
            required
          />
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={addingStudent}>
              Add Student
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default ManageStudents;
