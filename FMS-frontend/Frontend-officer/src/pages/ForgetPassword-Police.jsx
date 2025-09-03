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

const ForgetPasswordPolice = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [reset, setReset] = useState(false);
    const [verified, setVerified] = useState(true);
    const [submittedData, setSubmittedData] = useState(null);
    const [token, setToken] = useState(null);
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);
    const navigate = useNavigate();
    const email = localStorage.getItem("email");


    const isPasswordVisible = () => {
        setPasswordVisibility(!passwordVisibility);
    };

    const isConfirmPasswordVisible = () => {
        setConfirmPasswordVisibility(!confirmPasswordVisibility);
    };

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required')
            // .matches(/[A-Z]/, 'Must contain uppercase')
            // .matches(/[a-z]/, 'Must contain lowercase')
            // .matches(/[0-9]/, 'Must contain number')
            // .matches(/[@$!%*?&]/, 'Must contain special character')
            ,
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required'),
        }),
        onSubmit: (values) => {
            setSubmittedData(values);
            setReset(true);
        },
        context: { selectedUser }
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        localStorage.setItem('token', tokenFromUrl);
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setVerified(true);
            setReset(true);
        }
    }, []);


    const resetUser = async (submittedData) => {
        const { password, confirmPassword } = submittedData;
        try {
            const response = await api.post('/police/password/reset?token=${token}', {
                email, password, confirmPassword
            });
            if (response.status === 200) {
                alert("Password Reset Successfully!");
                closeModal();
            }

        }
        catch (error) {
            alert("Password Reset Failed!");
            console.error(error);
        }
    };

    const handleAdd = () => {
        setReset(true);
    };

    const closeModal = () => {
        formik.resetForm();
        setSubmittedData(null);
        setSelectedUser(null);
        setVerified(false);
        setReset(false);
        setToken(null);
        navigate("/loginPolice");
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center my-lg-3">
            <div className="login-container d-flex shadow rounded overflow-hidden bg-white" style={{width: '55%'}}>
                <img src={LoginImage} alt="Login image" className="login-image object-fit-cover"
                     style={{width: "39%"}}/>
                <div className="login-form-container d-flex flex-grow-1 flex-column" style={{padding: "2rem"}}>
                    <header className="header">
                        <nav className="d-flex" style={{marginBottom: "2rem"}}>
                            <ul className="d-flex">
                                <li><Link to="/loginPolice" className="return-link justify-content-start">&lt; Back to Login</Link></li>
                                {/*<li><Link to="/register" className="login-link justify-content-end"*/}
                                {/*          style={{marginLeft: "70%", marginRight: "0"}}>SignUp</Link></li>*/}
                            </ul>
                        </nav>
                    </header>

                    <div className="form-container mx-auto mt-4">
                        <div>
                            <div className="welcome mb-5">
                                <h1>Forget Password</h1>
                                <h6>Enter a different password with previous</h6>
                            </div>
                            <div className="d-inline-flex d-lg-none d-md-none justify-content-center align-content-center w-100" style={{marginBottom:"1.5rem"}}>
                                <img src={Login_sm_image} alt=""
                                     className="header-image justify-content-center align-content-center"/>
                            </div>
                            <div className="mx-auto">

                                <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (formik.isValid) handleAdd();
                                    formik.handleSubmit(e);
                                }}>
                                    <div className="text-center">
                                        <Form.Group controlId="Password" className="form-group">
                                            <div className="password-wrapper">
                                                <Form.Control
                                                    type={passwordVisibility ? "text" : "password"}
                                                    placeholder="New Password"
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

                                        <Form.Group controlId="confirmPassword" className="form-group">
                                            <div className="password-wrapper">
                                                <Form.Control
                                                    type={confirmPasswordVisibility ? "text" : "password"}
                                                    placeholder="Confirm New Password"
                                                    id="confirmPassword"
                                                    {...formik.getFieldProps('confirmPassword')}
                                                    isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                                />
                                                <button type="button" onClick={isConfirmPasswordVisible} className="show">
                                                    {confirmPasswordVisibility ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                            <Form.Control.Feedback type="invalid" className="d-block">
                                                {formik.errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <div className="form-group mt-5">
                                            <button type="submit" className="btn-submit">
                                                Confirm Reset Password →
                                            </button>
                                        </div>
                                    </div>

                                </Form>
                            </div>

                        </div>

                    </div>


                    <footer className="footer">
                        <p>© 2022-2024 FinTech Inc. All Rights Reserved</p>
                    </footer>
                </div>
            </div>

            {submittedData && verified && reset && (
                <div className="modal-overlay w-100" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h5>Confirm Reset Password?</h5>
                        <div className="warning-box">
                            <p><strong>Username:</strong> {submittedData.username}</p>
                            <p><strong>Password:</strong> {submittedData.password}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal} style={{width:"35%"}}>
                                No, Cancel
                            </button>
                            <button className="btn-confirm" onClick={() => resetUser(submittedData)} style={{width:"35%"}}>
                                Yes, Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForgetPasswordPolice;
