import { Link } from 'react-router-dom'
import { FiClock, FiMail, FiHome } from 'react-icons/fi'
import styles from './PendingApproval.module.css'

const PendingApproval = () => {
  return (
    <div className={styles.pendingPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <FiClock className={styles.clockIcon} />
          </div>
          
          <h1>Account Pending Approval</h1>
          
          <p className={styles.message}>
            Your registration has been received successfully! 🎉
          </p>
          
          <div className={styles.infoBox}>
            <h3>What happens next?</h3>
            <ul>
              <li>Our admin team will review your registration</li>
              <li>You'll receive access once approved</li>
              <li>This usually takes 24-48 hours</li>
            </ul>
          </div>

          <div className={styles.statusBadge}>
            <span className={styles.dot}></span>
            Waiting for Admin Approval
          </div>

          <p className={styles.contactInfo}>
            <FiMail /> Need help? Contact the mess administrator
          </p>

          <div className={styles.actions}>
            <Link to="/login" className={styles.loginLink}>
              Try Login Again
            </Link>
            <Link to="/" className={styles.homeLink}>
              <FiHome /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval
