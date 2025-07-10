import React, { useContext, useState } from "react";
import axios from "axios";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const { setUser, setToken, backendUrl } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    // Allow only digits
    if (/^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      backendUrl + (isLogin ? "/api/auth/login" : "/api/auth/register");

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await axios.post(url, payload);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);

        localStorage.setItem("Kanban_token", res.data.token);
        toast.success(res.data.message);
        navigate("/");
      } else {
        console.log(11)
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                required
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p className={styles.toggleText}>
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
