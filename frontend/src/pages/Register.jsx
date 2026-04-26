import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiHash, FiHome, FiPhone, FiArrowRight } from "react-icons/fi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import styles from "./Auth.module.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    hostelName: "",
    roomNumber: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in name and email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.rollNumber || !formData.hostelName || !formData.roomNumber || !formData.phoneNumber) {
      toast.error("Please fill in all fields");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        hostelName: formData.hostelName,
        roomNumber: formData.roomNumber,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      if (response.data.success) {
        // Check if account requires admin approval
        if (response.data.requiresApproval) {
          toast.success("Registration successful! Awaiting admin approval.");
          navigate("/pending-approval");
        } else {
          toast.success("Account created successfully! 🎉");
          navigate("/dashboard");
        }
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>

        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <span className={styles.emoji}>🍽️</span>
            <h1>Create Account</h1>
            <p>Join SmartMess to rate meals & view menus</p>
          </div>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
              <span>1</span>
              <p>Basic Info</p>
            </div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ""}`} />
            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
              <span>2</span>
              <p>Details</p>
            </div>
            <div className={`${styles.stepLine} ${step >= 3 ? styles.active : ""}`} />
            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
              <span>3</span>
              <p>Password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">
                    <FiUser className={styles.inputIcon} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">
                    <FiMail className={styles.inputIcon} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button type="button" onClick={handleNext} fullWidth size="large">
                  Continue
                  <FiArrowRight />
                </Button>
              </>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="rollNumber">
                      <FiHash className={styles.inputIcon} />
                      Roll No.
                    </label>
                    <input
                      type="text"
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="21CS001"
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phoneNumber">
                      <FiPhone className={styles.inputIcon} />
                      Mobile No.
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="hostelName">
                      <FiHome className={styles.inputIcon} />
                      Hostel
                    </label>
                    <input
                      type="text"
                      id="hostelName"
                      name="hostelName"
                      value={formData.hostelName}
                      onChange={handleChange}
                      placeholder="Hostel A"
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="roomNumber">
                      <FiHome className={styles.inputIcon} />
                      Room No.
                    </label>
                    <input
                      type="text"
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="A-101"
                      required
                    />
                  </div>
                </div>

                <div className={styles.buttonRow}>
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Continue
                    <FiArrowRight />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="password">
                    <FiLock className={styles.inputIcon} />
                    Create Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    minLength="6"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword">
                    <FiLock className={styles.inputIcon} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                <div className={styles.buttonRow}>
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" loading={loading}>
                    Create Account
                    <FiArrowRight />
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className={styles.authDivider}>
            <span>or</span>
          </div>

          <p className={styles.authFooter}>
            Already have an account?{" "}
            <Link to="/login" className={styles.authLink}>
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
