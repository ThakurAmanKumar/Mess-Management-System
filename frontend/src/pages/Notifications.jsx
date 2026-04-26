import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  FiBell, 
  FiCheck,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { notificationAPI } from '../services/api'
import toast from 'react-hot-toast'
import styles from './Notifications.module.css'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getAll()
      if (response.data.success) {
        setNotifications(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return <FiAlertCircle />
      case 'warning': return <FiAlertTriangle />
      case 'success': return <FiCheckCircle />
      default: return <FiInfo />
    }
  }

  const getTypeClass = (type) => {
    switch (type) {
      case 'urgent': return styles.urgent
      case 'warning': return styles.warning
      case 'success': return styles.success
      default: return styles.info
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const safeFormat = (value, fmt, fallback = '—') => {
    if (!value) return fallback
    const d = new Date(value)
    if (isNaN(d.getTime())) return fallback
    return format(d, fmt)
  }

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>
              <FiBell /> Notifications
            </h1>
            <p>Stay updated with mess announcements</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="danger" className={styles.unreadBadge}>
              {unreadCount} unread
            </Badge>
          )}
        </header>

        {/* Filter Tabs */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'read' ? styles.active : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={FiBell}
            title="No notifications"
            description={
              filter === 'all' 
                ? "You don't have any notifications yet."
                : filter === 'unread'
                ? "You've read all your notifications!"
                : "No read notifications yet."
            }
          />
        ) : (
          <div className={styles.notificationsList}>
            {filteredNotifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''} ${getTypeClass(notification.type)}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className={styles.notificationIcon}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h3>{notification.title}</h3>
                    {!notification.isRead && (
                      <span className={styles.newBadge}>NEW</span>
                    )}
                  </div>
                  <p className={styles.message}>{notification.message}</p>
                  <span className={styles.time}>
                    {safeFormat(notification.created_at || notification.createdAt, 'MMM dd, yyyy • hh:mm a', '—')}
                  </span>
                </div>

                {notification.isRead && (
                  <div className={styles.readIndicator}>
                    <FiCheck /> Read
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Notifications
