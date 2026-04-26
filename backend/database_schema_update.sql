-- SmartMess Database Schema Update
-- Run these queries in Supabase SQL Editor to add new tables

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
  target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'hostel', 'specific')),
  created_by UUID REFERENCES admins(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. NOTIFICATION_READS TABLE (Track which students read which notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(notification_id, student_id)
);

-- ============================================
-- 9. MEAL_ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meal_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  marked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date, meal_type)
);

-- ============================================
-- 10. INDEXES FOR NEW TABLES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_reads_student ON notification_reads(student_id);
CREATE INDEX IF NOT EXISTS idx_meal_attendance_student ON meal_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_meal_attendance_date ON meal_attendance(date);
CREATE INDEX IF NOT EXISTS idx_meal_attendance_meal_type ON meal_attendance(meal_type);

-- ============================================
-- 11. TRIGGERS FOR NEW TABLES
-- ============================================
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_attendance_updated_at BEFORE UPDATE ON meal_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
