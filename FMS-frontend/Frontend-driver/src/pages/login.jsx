import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LoginImage from "../assets/left-section.png";
import { Link } from "react-router-dom";
import './Register_Login.css';
import { Button, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Login_sm_image from "../assets/login-sm-image.png";
import 'bootstrap/dist/css/bootstrap.min.css';


const Login = () => {
    const [forgetPassword, setForgetPassword] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [verified, setVerified] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const navigate = useNavigate();


    const isPasswordVisible = () => {
        setPasswordVisibility(!passwordVisibility);
    };

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
            otp: ""
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            username: Yup.string().required("Username is required"),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required')
                // .matches(/[A-Z]/, 'Must contain uppercase')
                // .matches(/[a-z]/, 'Must contain lowercase')
                // .matches(/[0-9]/, 'Must contain number')
                // .matches(/[@$!%*?&]/, 'Must contain special character')
                .test("not-same-as-old", "New password must be different from the old one", function (value) {
                    const { selectedUser } = this.options.context;
                    return value !== selectedUser?.password;
                }),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required'),
            otp: Yup.string()
                .required("OTP is required")
                .length(6, 'OTP must be 6 characters')
                .matches(/^\d+$/, 'OTP must contain only numbers'),
            email: Yup.string().email("Invalid email").required("Email is required")
        }),
        onSubmit: (values) => {
            setSubmittedData(values);
        },
        context: { selectedUser }
    });

    const verifyAccount = async (email) => {
        try {
            const response = await api.post('/driver/forgot-password', { email });

            if (response.status === 200) {
                alert("A verification link has been sent to your email. Please check your inbox.");
                setSelectedUser(response.data.user || null);
                localStorage.setItem("email", email);
            } else {
                alert("Email verification failed. Please try again.");
            }
        } catch (error) {
            console.error('Verification error:', error.response?.data || error.message);
            alert("Error verifying email. Please check your input or try again later.");
        }
    };



    const handleLogin = async (values) => {
        const { username, password } = values;
        try {
            const response = await api.post('/login', { username, password });
            console.log("Full login response:", response); // Add this line

            if (response.status === 200) {
                const { token, role } = response.data; // Destructure like this
                // console.log("User data:", user); // Check what you're getting

                localStorage.setItem("role", role);
                localStorage.setItem('token', token);
                // localStorage.setItem('user', JSON.stringify(user));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                navigate("/DriverOverview");
            } else {
                alert(response.data.message || "Invalid Credentials");
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Invalid Credentials");
        }
    };

    const clickForgetPassword = (e) => {
        e.preventDefault();
        setForgetPassword(true);
    };

    const closeModal = () => {
        formik.resetForm();
        setSubmittedData(null);
        setForgetPassword(false);
        setSelectedUser(null);
        setVerified(false);
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center my-3">
            <div className="login-container d-flex shadow rounded-lg overflow-lg-hidden bg-white" style={{width: '55%'}}>
                <img src={LoginImage} alt="Login image" className="login-image object-fit-cover"
                     style={{width: "39%"}}/>
                <div className="login-form-container d-flex flex-grow-1 flex-column" style={{padding: "2rem"}}>
                    <header className="header">
                        <nav className="d-flex" style={{marginBottom: "2rem"}}>
                            <ul className="d-flex">
                                <li><Link to="/home" className="return-link justify-content-start">&lt; Return
                                    Home</Link></li>
                                <li><Link to="/register" className="login-link justify-content-end"
                                          style={{marginLeft: "70%", marginRight: "0"}}>SignUp</Link></li>
                            </ul>
                        </nav>
                    </header>

                    {!verified && !selectedUser && !submittedData &&(
                        <div className="form-container mx-auto mt-4">
                            <div>
                                <div className="welcome">
                                    <h1>Welcome Back</h1>
                                    <h5>LOG IN TO CONTINUE</h5>
                                </div>
                                <div className="d-inline-flex d-lg-none d-md-none justify-content-center align-content-center w-100" style={{marginBottom:"1.5rem"}}>
                                    <img src={Login_sm_image} alt=""
                                         className="header-image justify-content-center align-content-center"/>
                                </div>
                                <div className="mx-auto">

                                        <Form onSubmit={async (e) => {
                                            e.preventDefault();
                                            await handleLogin(formik.values); // Make sure to pass values if required
                                        }} style={{marginTop:"10%"}}>
                                            <div className="text-center">
                                                <Form.Group controlId="username" className="form-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Username"
                                                            {...formik.getFieldProps('username')}
                                                            isInvalid={formik.touched.username && formik.errors.username}
                                                        />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formik.errors.username}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group controlId="Password" className="form-group">
                                                    <div className="password-wrapper">
                                                        <Form.Control
                                                            type={passwordVisibility ? "text" : "password"}
                                                            placeholder="Password"
                                                            id="Password"
                                                            {...formik.getFieldProps('password')}
                                                            isInvalid={formik.touched.password && formik.errors.password}
                                                        />
                                                        <button type="button" onClick={isPasswordVisible} className="show">
                                                            {passwordVisibility ? "Hide" : "Show"}
                                                        </button>
                                                    </div>
                                                    <Form.Control.Feedback type="invalid" className="d-block">
                                                        {formik.errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group controlId="" className="mb-4">
                                                    <p><a href="#" className="forget_password"
                                                          onClick={clickForgetPassword}>
                                                        Forget password?</a></p>
                                                </Form.Group>

                                                <div className="form-group">
                                                    <button type="submit" className="btn-submit">
                                                        Proceed to my Account →
                                                    </button>
                                                </div>
                                            </div>

                                        </Form>
                                    </div>

                                </div>

                        </div>

                    )}
                    <footer className="footer">
                        <p>© 2022-2024 FinTech Inc. All Rights Reserved</p>
                    </footer>
                </div>
            </div>

            {!verified && !selectedUser && forgetPassword &&(
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <header>
                            <h2>Verify Email</h2>
                            <p className="fw-semibold">Enter the Email Address to verify Account?</p>
                        </header>
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            verifyAccount(formik.values.email); // pass email properly
                        }}>
                            <div className="warning-box d-block">
                                <div className="ms-2">
                                    <h6 className="text-primary fs-5 ms-2">Warning</h6>
                                    <p>By Verifying this panel, you won’t be able to access
                                        the system by this account</p>
                                </div>

                            </div>
                            <Form.Group controlId="otp" className="form-group mt-3">
                                <Form.Control
                                    type="email"
                                    placeholder="Eg:john@example.com"
                                    {...formik.getFieldProps("email")}
                                    isInvalid={formik.touched.email && formik.errors.email} className=""
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={closeModal} style={{width: "45%"}}>No, Cancel</button>
                                <button type="submit" className="btn-confirm" style={{width: "45%"}}>Yes, Verify</button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Login;

