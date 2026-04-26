import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import {
  FiUsers,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiMinus,
} from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./MealAttendance.module.css";

const MealAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedMeal]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const params = { date: dateStr };
      if (selectedMeal) {
        params.mealType = selectedMeal;
      }
      const response = await adminAPI.getMealAttendance(params);
      if (response.data.success) {
        setAttendanceData(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load attendance data");
      console.error("Attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    const tomorrow = addDays(new Date(), 1);
    if (addDays(selectedDate, 1) <= tomorrow) {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: "🌅",
      lunch: "☀️",
      snacks: "🍪",
      dinner: "🌙",
    };
    return icons[mealType] || "🍽️";
  };

  const getStatusIcon = (status) => {
    if (status === "present") return <FiCheck className={styles.presentIcon} />;
    if (status === "absent") return <FiX className={styles.absentIcon} />;
    return <FiMinus className={styles.notMarkedIcon} />;
  };

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];

  if (loading && !attendanceData) {
    return (
      <AdminLayout>
        <Loader fullScreen />
      </AdminLayout>
    );
  }

  const { stats = {}, students = [], totalStudents = 0 } = attendanceData || {};

  return (
    <AdminLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Meal Attendance</h1>
            <p>Track how many students will attend each meal</p>
          </div>
          <Button icon={FiRefreshCw} variant="ghost" onClick={fetchAttendance}>
            Refresh
          </Button>
        </header>

        {/* Stats Summary */}
        <div className={styles.statsGrid}>
          {mealTypes.map((meal) => {
            const mealStats = stats[meal] || { present: 0, absent: 0, notMarked: totalStudents };
            return (
              <Card
                key={meal}
                className={`${styles.statCard} ${selectedMeal === meal ? styles.selected : ""}`}
                onClick={() => setSelectedMeal(selectedMeal === meal ? null : meal)}
              >
                <div className={styles.statHeader}>
                  <span className={styles.mealEmoji}>{getMealIcon(meal)}</span>
                  <span className={styles.mealName}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </span>
                </div>
                <div className={styles.statNumbers}>
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.present}`}>{mealStats.present}</span>
                    <span className={styles.statLabel}>Present</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.absent}`}>{mealStats.absent}</span>
                    <span className={styles.statLabel}>Absent</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{mealStats.notMarked}</span>
                    <span className={styles.statLabel}>Not Marked</span>
                  </div>
                </div>
                {mealStats.attendanceRate > 0 && (
                  <div className={styles.attendanceRate}>
                    {mealStats.attendanceRate}% Attendance
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Date Selector */}
        <div className={styles.dateSelector}>
          <Button icon={FiChevronLeft} variant="ghost" onClick={handlePrevDay} />
          <div className={styles.dateDisplay}>
            <FiCalendar />
            <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <Button icon={FiChevronRight} variant="ghost" onClick={handleNextDay} />
          <Button size="sm" variant="secondary" onClick={handleToday}>
            Today
          </Button>
        </div>

        {/* Filter Chips */}
        <div className={styles.filterChips}>
          <button
            className={`${styles.chip} ${!selectedMeal ? styles.activeChip : ""}`}
            onClick={() => setSelectedMeal(null)}
          >
            All Meals
          </button>
          {mealTypes.map((meal) => (
            <button
              key={meal}
              className={`${styles.chip} ${selectedMeal === meal ? styles.activeChip : ""}`}
              onClick={() => setSelectedMeal(meal)}
            >
              {getMealIcon(meal)} {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </button>
          ))}
        </div>

        {/* Student Attendance Table */}
        <Card className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>
              <FiUsers /> Student Attendance
            </h3>
            <span className={styles.studentCount}>{totalStudents} students</span>
          </div>

          {students.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Hostel</th>
                    {selectedMeal ? (
                      <th>{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}</th>
                    ) : (
                      mealTypes.map((meal) => (
                        <th key={meal}>
                          {getMealIcon(meal)}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className={styles.studentCell}>
                          <div className={styles.avatar}>
                            {student.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td>{student.roll_number}</td>
                      <td>{student.hostel_name || "-"}</td>
                      {selectedMeal ? (
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[student.attendance?.[selectedMeal] || "notMarked"]
                            }`}
                          >
                            {getStatusIcon(student.attendance?.[selectedMeal])}
                            {student.attendance?.[selectedMeal] === "present"
                              ? "Present"
                              : student.attendance?.[selectedMeal] === "absent"
                              ? "Absent"
                              : "Not Marked"}
                          </span>
                        </td>
                      ) : (
                        mealTypes.map((meal) => (
                          <td key={meal}>
                            <span
                              className={`${styles.statusIcon} ${
                                styles[student.attendance?.[meal] || "notMarked"]
                              }`}
                              title={
                                student.attendance?.[meal] === "present"
                                  ? "Present"
                                  : student.attendance?.[meal] === "absent"
                                  ? "Absent"
                                  : "Not Marked"
                              }
                            >
                              {getStatusIcon(student.attendance?.[meal])}
                            </span>
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FiUsers size={48} />
              <p>No students found</p>
              <span>Students will appear here once they register and get verified</span>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MealAttendance;
