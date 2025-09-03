import img from '../assets/Signup.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from "react";
import QrCodeScanner from "../components/QrCodeScanner.jsx";
import {Button, Form} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import './Register_Login.css'
import {Link} from "react-router-dom";
import SlideToContinue from "../components/SlideToContinue.jsx";
import api from "../api/axios";
import Login_sm_image from "../assets/login-sm-image.png";

function Register() {
    const [scanResult, setScanResult] = useState(null);
    const [add, setAdd] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [verified, setVerified] = useState(false);
    const [showaddAccount, setshowaddAccount] = useState(false);
    const [qrScan, setQrScan] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);

    useEffect(() => {
        if (scanResult) {
            formik.setFieldValue('DriverQr', scanResult);
            setQrScan(true);
        }
    }, [scanResult]);

    const formik = useFormik({
        initialValues: {
            DriverQr: scanResult,
            Email:"",
            password:"",
            password_confirmation:"",
            otp:"",
            username:""
        },
        validationSchema: Yup.object({
            DriverQr: Yup.string().required("You must want to scan"),
            Email: Yup.string().email("Invalid email format").required("Email is required"),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required')
                .matches(/[A-Z]/, 'Password must contain at least one uppercase letter') // Optional: To check for uppercase letter
                .matches(/[a-z]/, 'Password must contain at least one lowercase letter') // Optional: To check for lowercase letter
                .matches(/[0-9]/, 'Password must contain at least one number') // Optional: To check for a number
                .matches(/[@$!%*?&]/, 'Password must contain at least one special character'), // Optional: To check for special characters

            password_confirmation: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required'),
            otp: Yup.string().required("OTP is required")
                .min(6,'OTP must be 6 characters')
                .max(6,'OTP must be 6 characters')
                .matches(/[0-9]/, 'OTP must contain only numbers'),
            username: Yup.string().required("Username is required")
                .min(6, 'Username at lease 6 characters')
                .max(50, 'Username maximum size 50 characters'),
        }),
        onSubmit: (values) => {
            const formData = {
                ...values,
            };

            setSubmittedData(formData);

            console.log("Form submitted:", formData);
        }
    });

    const handleAccount = () =>{
        setshowaddAccount(true);
    }

    const handleAdd = () => {
        setAdd(true);
    };

    const closeModal = () => {
        setAdd(false);
        setScanResult(null);
        setSelectedDriver(false);
        setSubmittedData(null);
        setVerified(false);
        setshowaddAccount(false);
        setQrScan(false);
    };

    const togglePasswordVisibility = () => setPasswordVisibility((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisibility((prev) => !prev);

    const AddDriver = async () => {
        const { username, password, password_confirmation } = formik.values;
        const license_number = formik.values.DriverQr;

        if (!license_number) {
            alert("Please scan a QR code before registering.");
            return;
        }
        console.log("password:",password);
        console.log("confirm password:",password_confirmation);
        try {
            const response = await api.post('/register-driver', {license_number, username, password, password_confirmation});
            if(response.status === 200){
                const {token,role } = response.data;
                console.log(token);
                console.log(role);
                localStorage.setItem("token",token);
                localStorage.setItem("role", role);
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                setSelectedDriver(true);
                alert("Account created. Please verify OTP.");
            }
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
            alert("Account creation failed!");
            setSelectedDriver(false);
        }
    };

    const driver = localStorage.getItem('user');

    const verifyAccount = async () => {
        const { otp } = formik.values;

        try {
            const response = await api.post('/verify-email', { otp });

            if (response.status === 200) {
                setVerified(true);
                alert("Account Verified Successfully!");
                closeModal();
                window.location.reload();
            } else {
                setVerified(false);
                alert("Invalid OTP!");
            }
        } catch (error) {
            console.error('Verification failed:', error.response?.data || error.message);
            alert("OTP Verification Failed!");
        }
    };

    useEffect(()=>{
        if(qrScan && add){
            document.getElementById("signup-container").style.width = "55%";
            document.getElementById("Signup illustration").style.width = "45%";
        }
        else{
            // document.getElementById("signup-container").style.width = "fit-content";
            document.getElementById("Signup illustration").style.width = "45%";
        }
    },[qrScan,add])


    return (
        <div className="signup-page d-flex justify-content-center align-items-center my-3">
            <div className="signup-container d-flex shadow rounded-lg overflow-lg-hidden bg-white" id="signup-container"  style={{width: '58%'}}>
                <img src={img} alt="Signup illustration" className="signup-image object-fit-cover d-lg-flex d-sm-none" id="Signup illustration" style={{width:"45%"}}/>
                <div className="signup-form-container d-flex flex-column justify-content-between px-4 px-lg-0 px-md-0" style={{paddingTop:'2rem',flex:"1"}}>
                    <header>
                        <nav className="d-flex" style={{marginBottom: "1.5rem"}}>
                            <ul className="d-flex">
                                <li><Link to="/home" className="return-link justify-content-start ms-0">&lt; Return
                                    Home</Link></li>
                                <li><Link to="/login" className="login-link justify-content-end"
                                          style={{marginLeft: "70%", marginRight: "0"}}>Login</Link></li>
                            </ul>
                        </nav>
                        <div className="d-flex">
                            <div className="d-block"
                            >
                                <h1 className="register-h1 fw-bold fs-2 d-flex justify-content-center align-items-center mb-4">
                                    Create Your Account</h1>
                                <div className="mx-auto d-lg-none w-75"
                                     style={{marginBottom: "2rem"}}>
                                    <img src={Login_sm_image} alt=""
                                         className="mx-auto header-image"/>
                                </div>
                                {!verified && !add && !selectedDriver ? (
                                    <div className="d-flex justify-content-center align-items-center">
                                        <h5 className="ms-sm-2" style={{width:"fit-content"}}>Scan your License Qr Code before creating an
                                            Account</h5>
                                    </div>)
                                    : (<div className="d-flex justify-content-center align-items-center">
                                        <h5 className="ms-sm-2" style={{width:"fit-content"}}>Enter your Account Details to create your Account</h5>
                                    </div>
                                    )}
                            </div>
                        </div>



                    </header>
                    {!verified && !add && !selectedDriver && (
                        <div className="page-1">
                            <div className="form-container d-flex"
                                >
                                <div className="d-flex">
                                    <div className="d-flex">
                                        <Form onSubmit={formik.handleSubmit}>
                                            {/*<div className="d-flex justify-content-center align-items-center"*/}
                                            {/*     style={{ height: "41vh", width: "fit-content" }}>*/}
                                            {/*/!*<div className="d-block mb-4" style={{width:"fit-content",height: "41vh"}}>*!/*/}
                                            {/*    <Form.Group className="my-auto" controlId="DriverQr">*/}
                                            {/*        <div className="d-flex justify-content-center align-items-center my-auto"*/}
                                            {/*             style={{}}>*/}
                                            {/*            <div className="my-auto" style={{height:"35vh"}}>*/}
                                            {/*                <QrCodeScanner setScanResult={setScanResult}/>*/}
                                            {/*                {formik.touched.DriverQr && formik.errors.DriverQr && (*/}
                                            {/*                    <Form.Control.Feedback type="invalid">*/}
                                            {/*                        {formik.errors.DriverQr}*/}
                                            {/*                    </Form.Control.Feedback>*/}
                                            {/*                )}*/}
                                            {/*                {formik.values.DriverQr ? (*/}
                                            {/*                    <div style={{color: 'green', marginLeft: "15%"}}>*/}
                                            {/*                        <h5>Qr Scanned Successfully!</h5>*/}
                                            {/*                    </div>*/}
                                            {/*                ) : (*/}
                                            {/*                    <div id="render"></div>*/}
                                            {/*                )}*/}
                                            {/*            </div>*/}
                                            {/*        </div>*/}
                                            {/*    </Form.Group>*/}
                                            {/*</div>*/}
                                        <Form.Group>
                                            <div className="d-flex justify-content-center align-items-center qrscan"
                                                 style={{ height: "45vh", width: "100%" }}>
                                                <QrCodeScanner setScanResult={setScanResult} />
                                                {formik.touched.DriverQr && formik.errors.DriverQr && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {formik.errors.DriverQr}
                                                    </Form.Control.Feedback>
                                                )}
                                                {formik.values.DriverQr ? (
                                                    <div className="d-flex justify-content-center align-items-center" style={{color: 'green',marginLeft:"25%"}}>
                                                        <h5>Qr Scanned Successfully!</h5>
                                                    </div>
                                                ) : (
                                                    <div id="render"></div>
                                                )}
                                            </div>
                                        </Form.Group>

                                            <div className="d-flex flex-column justify-content-center align-items-center"
                                                 style={{ height: "18vh", width: "100%" }}>

                                                <SlideToContinue handleAdd={handleAdd} formValues={formik.values} />

                                            </div>

                                        </Form>
                                    </div>

                                </div>
                            </div>
                        </div>

                    )}

                    {!verified && !selectedDriver && add && qrScan && (
                        <div className="page-2">
                            <div className="form-container mx-auto">

                                <Form onSubmit={async (e) => {
                                    e.preventDefault();
                                    await AddDriver(formik.values);
                                }}>

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
                                                <button type="button" onClick={togglePasswordVisibility} className="show">
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
                                                    placeholder="Confirm Password"
                                                    {...formik.getFieldProps('password_confirmation')}
                                                    isInvalid={formik.touched.password_confirmation && formik.errors.password_confirmation}
                                                />
                                                <button type="button" onClick={toggleConfirmPasswordVisibility} className="show">
                                                    {confirmPasswordVisibility ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                            <Form.Control.Feedback type="invalid" className="d-block">
                                                {formik.errors.password_confirmation}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <div className="form-group">
                                            <button type="submit" className="btn-submit" onClick={handleAccount}>Create My
                                                Account →
                                            </button>
                                        </div>
                                    </div>
                                </Form>

                            </div>
                        </div>
                    )}


                    {!verified && selectedDriver && add && showaddAccount && qrScan && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h2>Verify Email</h2>
                                <p>Enter the OTP sent to {driver.email} to verify</p>
                                <Form onSubmit={async (e) => {
                                    e.preventDefault();
                                    await verifyAccount(formik.values);
                                }}>
                                    <div className="warning-box">
                                        <Form.Group controlId="otp" className="form-group">
                                            <Form.Control
                                                type="text"
                                                placeholder="xxxxxx"
                                                {...formik.getFieldProps("otp")}
                                                isInvalid={formik.touched.otp && formik.errors.otp}
                                                id="otp"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formik.errors.otp}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>

                                    <div className="modal-actions d-flex">
                                        <button
                                            type="button"
                                            className="btn-cancel justify-content-start"
                                            style={{width: "40%"}}
                                            onClick={closeModal}
                                        >
                                            No, Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn-confirm justify-content-end"
                                            style={{width: "40%"}}
                                        >
                                            Yes, ADD
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    )}


                    <footer className="footer">
                        <p>© 2022-2024 FinTech Inc. All Rights Reserved</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default Register;