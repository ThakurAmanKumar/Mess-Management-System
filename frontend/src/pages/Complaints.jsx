import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  FiAlertCircle, 
  FiPlus, 
  FiCheck, 
  FiClock, 
  FiLoader,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { complaintAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Complaints.module.css'

const Complaints = () => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  })

  const categories = [
    { value: 'food_quality', label: '🍽️ Food Quality' },
    { value: 'hygiene', label: '🧹 Hygiene' },
    { value: 'service', label: '👨‍🍳 Service' },
    { value: 'quantity', label: '📏 Quantity' },
    { value: 'other', label: '📝 Other' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await complaintAPI.getMyComplaints()
      if (response.data.success) {
        setComplaints(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await complaintAPI.create({
        studentId: user.id,
        ...formData
      })
      
      if (response.data.success) {
        toast.success('Complaint submitted successfully!')
        setShowModal(false)
        setFormData({
          category: '',
          subject: '',
          description: '',
          priority: 'medium'
        })
        fetchComplaints()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <FiCheck />
      case 'in-progress': return <FiLoader className={styles.spinning} />
      case 'rejected': return <FiAlertCircle />
      default: return <FiClock />
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'in-progress': return 'warning'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      default: return 'info'
    }
  }

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
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
            <h1>My Complaints</h1>
            <p>Submit and track your complaints</p>
          </div>
          <Button icon={FiPlus} onClick={() => setShowModal(true)}>
            New Complaint
          </Button>
        </header>

        {complaints.length === 0 ? (
          <EmptyState
            icon={FiMessageSquare}
            title="No complaints yet"
            description="You haven't submitted any complaints. If you have any issues, feel free to submit one."
            action={
              <Button icon={FiPlus} onClick={() => setShowModal(true)}>
                Submit Complaint
              </Button>
            }
          />
        ) : (
          <div className={styles.complaintsList}>
            {complaints.map(complaint => {
              const id = complaint.id || complaint._id;
              const createdAt = complaint.created_at || complaint.createdAt;
              const resolvedAt = complaint.resolved_at || complaint.resolvedAt;
              return (
              <Card key={id} className={styles.complaintCard}>
                <div 
                  className={styles.complaintHeader}
                  onClick={() => toggleExpand(complaint.id)}
                >
                  <div className={styles.complaintInfo}>
                    <span className={styles.category}>
                      {getCategoryLabel(complaint.category)}
                    </span>
                    <h3>{complaint.subject}</h3>
                    <span className={styles.date}>
                      {createdAt ? format(new Date(createdAt), 'MMM dd, yyyy • hh:mm a') : 'Unknown'}
                    </span>
                  </div>
                  <div className={styles.complaintMeta}>
                    <Badge variant={getPriorityVariant(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                    <Badge variant={getStatusVariant(complaint.status)}>
                      {getStatusIcon(complaint.status)}
                      <span>{complaint.status}</span>
                    </Badge>
                    {expandedId === complaint.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {expandedId === complaint.id && (
                  <div className={styles.complaintDetails}>
                    <div className={styles.detailSection}>
                      <h4>Description</h4>
                      <p>{complaint.description}</p>
                    </div>

                    {complaint.admin_response && (
                      <div className={styles.responseSection}>
                        <h4>
                          <FiMessageSquare /> Admin Response
                        </h4>
                        <p>{complaint.admin_response}</p>
                        {resolvedAt && (
                          <span className={styles.resolvedDate}>
                            Resolved on {format(new Date(resolvedAt), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
          </div>
        )}

        {/* New Complaint Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Submit New Complaint"
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
              placeholder="Select category"
              required
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorities}
            />

            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief subject of your complaint"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your complaint in detail..."
              rows={5}
              required
            />

            <div className={styles.formActions}>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit Complaint
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default Complaints
