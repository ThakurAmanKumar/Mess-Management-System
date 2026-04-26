import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import styles from "./Auth.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);

      if (response.data.success) {
        toast.success("Welcome back! 🎉");
        navigate("/dashboard");
      } else {
        const errorMsg = response.data.message || "Login failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorResponse = error.response?.data;
      
      // Check if account is pending approval
      if (errorResponse?.pendingApproval) {
        toast.error("Account pending approval");
        navigate("/pending-approval");
        return;
      }
      
      const errorMsg = errorResponse?.message || "Invalid email or password";
      setError(errorMsg);
      toast.error(errorMsg);
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
            <h1>Welcome Back!</h1>
            <p>Sign in to continue to SmartMess</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
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
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">
                <FiLock className={styles.inputIcon} />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" loading={loading} fullWidth size="large">
              Sign In
              <FiArrowRight />
            </Button>
          </form>

          <div className={styles.authDivider}>
            <span>or</span>
          </div>

          <p className={styles.authFooter}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.authLink}>
              Create Account
            </Link>
          </p>
        </Card>

        <p className={styles.adminLink}>
          Are you an admin?{" "}
          <Link to="/admin/login" className={styles.authLink}>
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
