import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FiPlus, FiTrash2, FiSave, FiCalendar } from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { adminAPI, menuAPI } from "../../services/api";
import toast from "react-hot-toast";
import styles from "./ManageMenu.module.css";

const MEAL_TYPES = ["breakfast", "lunch", "snacks", "dinner"];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ManageMenu = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [menu, setMenu] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });
  const [newItems, setNewItems] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingMenuId, setExistingMenuId] = useState(null);

  useEffect(() => {
    fetchMenuForDate();
  }, [selectedDate]);

  const fetchMenuForDate = async () => {
    setLoading(true);
    try {
      const response = await menuAPI.getMenuByDate(selectedDate);
      if (response.data.success && response.data.menu) {
        const menuData = response.data.menu;
        const normalize = (m) =>
          Array.isArray(m) ? m : (m && Array.isArray(m.items) ? m.items : []);
        setMenu({
          breakfast: normalize(menuData.breakfast),
          lunch: normalize(menuData.lunch),
          snacks: normalize(menuData.snacks),
          dinner: normalize(menuData.dinner),
        });
        setExistingMenuId(menuData._id || menuData.id || null);
      } else {
        setMenu({
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: [],
        });
        setExistingMenuId(null);
      }
    } catch (error) {
      // No menu for this date
      setMenu({
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: [],
      });
      setExistingMenuId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (mealType) => {
    const item = newItems[mealType].trim();
    if (!item) return;
    setMenu((prev) => ({ ...prev, [mealType]: [...prev[mealType], item] }));
    setNewItems((prev) => ({ ...prev, [mealType]: "" }));
  };

  const handleRemoveItem = (mealType, index) => {
    setMenu((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const date = new Date(selectedDate);
      const day = DAYS_OF_WEEK[date.getDay()];

      const menuData = {
        date: selectedDate,
        day,
        breakfast: menu.breakfast,
        lunch: menu.lunch,
        snacks: menu.snacks,
        dinner: menu.dinner,
      };

      const response = await adminAPI.createMenu(menuData);

      if (response.data.success) {
        console.log('Save menu response:', response.data);
        toast.success("Menu saved successfully!");
        setExistingMenuId(response.data.data?._id || response.data.data?.id || null);
        // Refresh from server to ensure saved data is returned in the same shape
        await fetchMenuForDate();
      }
    } catch (error) {
      toast.error("Failed to save menu");
      console.error("Save menu error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e, mealType) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem(mealType);
    }
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
            <h1>Manage Menu</h1>
            <p>Add or edit daily menu items</p>
          </div>
          <Button icon={FiSave} onClick={handleSaveMenu} loading={saving}>
            Save Menu
          </Button>
        </header>

        <Card className={styles.dateCard}>
          <FiCalendar className={styles.calendarIcon} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.datePicker}
          />
          <span className={styles.dateLabel}>
            {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
          </span>
          {existingMenuId && (
            <span className={styles.existingBadge}>Menu Exists</span>
          )}
        </Card>

        <div className={styles.mealsGrid}>
          {MEAL_TYPES.map((mealType) => (
            <Card key={mealType} className={styles.mealCard}>
              <div className={styles.mealHeader}>
                <h3>
                  {getMealIcon(mealType)}{" "}
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </h3>
                <span className={styles.itemCount}>
                  {menu[mealType].length} items
                </span>
              </div>
              <div className={styles.itemsList}>
                {menu[mealType].map((item, index) => (
                  <div key={index} className={styles.item}>
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(mealType, index)}
                      className={styles.removeBtn}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                {menu[mealType].length === 0 && (
                  <p className={styles.noItems}>No items added</p>
                )}
              </div>
              <div className={styles.addItem}>
                <input
                  type="text"
                  value={newItems[mealType]}
                  onChange={(e) =>
                    setNewItems((prev) => ({
                      ...prev,
                      [mealType]: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => handleKeyPress(e, mealType)}
                  placeholder="Add new item..."
                  className={styles.addInput}
                />
                <button
                  onClick={() => handleAddItem(mealType)}
                  className={styles.addBtn}
                  disabled={!newItems[mealType].trim()}
                >
                  <FiPlus />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageMenu;
