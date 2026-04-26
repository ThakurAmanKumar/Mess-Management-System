import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiStar, FiFilter, FiRefreshCw } from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./ViewRatings.module.css";

const ViewRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, [filter]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { mealType: filter } : {};
      const response = await adminAPI.getAllRatings(params);
      if (response.data.success) {
        setRatings(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load ratings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getRatingStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const getMealBadgeVariant = (mealType) => {
    const variants = {
      breakfast: "primary",
      lunch: "success",
      snacks: "warning",
      dinner: "info",
    };
    return variants[mealType] || "default";
  };

  if (loading && ratings.length === 0) {
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
            <h1>View Ratings</h1>
            <p>All student meal ratings and feedback</p>
          </div>
          <Button icon={FiRefreshCw} variant="ghost" onClick={fetchRatings}>
            Refresh
          </Button>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
              <Card key={meal} className={styles.statCard}>
                <h3 className={styles.statMeal}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </h3>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {stats[meal]?.average || 0}
                  </span>
                  <span className={styles.statLabel}>
                    {stats[meal]?.count || 0} ratings
                  </span>
                </div>
                <div className={styles.starDisplay}>
                  {renderStars(Math.round(parseFloat(stats[meal]?.average) || 0))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <FiFilter />
          <button
            className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
            <button
              key={meal}
              className={`${styles.filterBtn} ${filter === meal ? styles.active : ""}`}
              onClick={() => setFilter(meal)}
            >
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </button>
          ))}
        </div>

        {/* Ratings List */}
        <Card className={styles.ratingsCard}>
          {ratings.length === 0 ? (
            <div className={styles.emptyState}>
              <FiStar size={48} />
              <p>No ratings found</p>
            </div>
          ) : (
            <div className={styles.ratingsList}>
              {ratings.map((rating) => (
                <div key={rating.id} className={styles.ratingItem}>
                  <div className={styles.ratingHeader}>
                    <div className={styles.studentInfo}>
                      <div className={styles.avatar}>
                        {rating.students?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <span className={styles.studentName}>
                          {rating.students?.name || "Unknown"}
                        </span>
                        <span className={styles.studentRoll}>
                          {rating.students?.roll_number}
                        </span>
                      </div>
                    </div>
                    <div className={styles.ratingMeta}>
                      <Badge variant={getMealBadgeVariant(rating.meal_type)}>
                        {rating.meal_type}
                      </Badge>
                      <span className={styles.ratingDate}>
                        {rating.menus?.date
                          ? format(new Date(rating.menus.date), "MMM d, yyyy")
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.ratingContent}>
                    <div className={styles.stars}>{renderStars(rating.rating)}</div>
                    {rating.comment && (
                      <p className={styles.comment}>"{rating.comment}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ViewRatings;
