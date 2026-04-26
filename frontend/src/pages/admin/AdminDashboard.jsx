import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  FiUsers,
  FiStar,
  FiCalendar,
  FiTrendingUp,
  FiPlus,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
  FiBell,
  FiClipboard,
} from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { adminAPI } from "../../services/api";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    totalRatings: 0,
    avgRating: 0,
    todayRatings: 0,
    pendingComplaints: 0,
    totalMenus: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      subValue: `${stats.verifiedStudents} verified`,
      icon: FiUsers,
      color: "#3b82f6",
    },
    {
      label: "Total Ratings",
      value: stats.totalRatings,
      subValue: `${stats.todayRatings} today`,
      icon: FiStar,
      color: "#f59e0b",
    },
    {
      label: "Average Rating",
      value: stats.avgRating,
      subValue: "out of 5",
      icon: FiTrendingUp,
      color: "#22c55e",
    },
    {
      label: "Pending Complaints",
      value: stats.pendingComplaints,
      subValue: "needs attention",
      icon: FiAlertCircle,
      color: "#ef4444",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Loader fullScreen />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <h1>Admin Dashboard</h1>
            <p className={styles.date}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <Link to="/admin/manage-menu">
            <Button icon={FiPlus}>Add Today's Menu</Button>
          </Link>
        </header>

        <div className={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <Card key={index} className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <stat.icon />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                {stat.subValue && (
                  <span className={styles.statSubValue}>{stat.subValue}</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <section className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link to="/admin/manage-menu">
              <Card className={styles.actionCard} hover>
                <FiCalendar className={styles.actionIcon} />
                <h3>Manage Menu</h3>
                <p>Add or edit daily menus</p>
              </Card>
            </Link>
            <Link to="/admin/ratings">
              <Card className={styles.actionCard} hover>
                <FiStar className={styles.actionIcon} />
                <h3>View Ratings</h3>
                <p>See all student feedback</p>
              </Card>
            </Link>
            <Link to="/admin/students">
              <Card className={styles.actionCard} hover>
                <FiUsers className={styles.actionIcon} />
                <h3>Manage Students</h3>
                <p>Add & verify students</p>
              </Card>
            </Link>
            <Link to="/admin/complaints">
              <Card className={styles.actionCard} hover>
                <FiAlertCircle className={styles.actionIcon} />
                <h3>View Complaints</h3>
                <p>{stats.pendingComplaints} pending</p>
              </Card>
            </Link>
            <Link to="/admin/attendance">
              <Card className={styles.actionCard} hover>
                <FiClipboard className={styles.actionIcon} />
                <h3>Meal Attendance</h3>
                <p>Track who's eating</p>
              </Card>
            </Link>
            <Link to="/admin/notifications">
              <Card className={styles.actionCard} hover>
                <FiBell className={styles.actionIcon} />
                <h3>Send Notifications</h3>
                <p>Announce to students</p>
              </Card>
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>System Overview</h2>
          <div className={styles.overviewGrid}>
            <Card className={styles.overviewCard}>
              <h3>
                <FiCheckCircle /> Students Overview
              </h3>
              <div className={styles.overviewStats}>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.totalStudents}
                  </span>
                  <span className={styles.overviewLabel}>Total</span>
                </div>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.verifiedStudents}
                  </span>
                  <span className={styles.overviewLabel}>Verified</span>
                </div>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.totalStudents - stats.verifiedStudents}
                  </span>
                  <span className={styles.overviewLabel}>Pending</span>
                </div>
              </div>
            </Card>
            <Card className={styles.overviewCard}>
              <h3>
                <FiBarChart2 /> Ratings Overview
              </h3>
              <div className={styles.overviewStats}>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.totalRatings}
                  </span>
                  <span className={styles.overviewLabel}>Total</span>
                </div>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.todayRatings}
                  </span>
                  <span className={styles.overviewLabel}>Today</span>
                </div>
                <div className={styles.overviewItem}>
                  <span className={styles.overviewValue}>
                    {stats.avgRating}
                  </span>
                  <span className={styles.overviewLabel}>Avg Rating</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
