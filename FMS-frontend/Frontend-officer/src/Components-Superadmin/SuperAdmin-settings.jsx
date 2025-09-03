import React, { useEffect, useState } from 'react';
import {Link} from "react-router-dom";
import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt, FaTrash, FaFacebook, FaInstagram, FaMailBulk, FaFilePdf } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import "../Components-officer/Officer-styles.css";
import { Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../api/axios.jsx";
import {useNavigate} from "react-router-dom";
import SettingItem from "../components/SettingItem.jsx";
import HelpItem from "../components/HelpItem.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

// Add these error handling functions at the top
const getToken = () => {
    try {
        const tokenString = localStorage.getItem('token');
        if (tokenString && !tokenString.startsWith('{') && !tokenString.startsWith('[')) {
            return tokenString;
        }
        return tokenString ? JSON.parse(tokenString) : null;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};

const getUser = () => {
    try {
        const userString = localStorage.getItem('user');
        if (userString && !userString.startsWith('{') && !userString.startsWith('[')) {
            return { username: userString };
        }
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        console.error('Error parsing user:', error);
        return null;
    }
};

const token = getToken();
const user = getUser();

function SuperAdminSettings() {
    const navigate = useNavigate();
    const [submittedData, setSubmittedData] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [accountSection, setAccountSection] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [officerData, setOfficerData] = useState(null);
    const [loading, setLoading] = useState(false);

    const getToken = () => {
        try {
            const tokenString = localStorage.getItem('token');
            if (tokenString && !tokenString.startsWith('{') && !tokenString.startsWith('[')) {
                return tokenString;
            }
            return tokenString ? JSON.parse(tokenString) : null;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    };
    const token = getToken();

    useEffect(() => {
        if (!token) {
            navigate('/loginPolice');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (activeSection === null) {
            setAccountSection(null);
        }
    }, [activeSection]);



    const fetchUsernameEmail = async () => {
        try {
            setLoading(true);
            const response = await api.get('/police/get-username-email',
                {headers: {'Authorization':`Bearer ${token}`}
                }
            );
            if (response.status === 200) {
                const username = response.data.user_name;
                const email = response.data.email;
                setOfficerData({
                    username,
                    email
                })
            } else {
                console.log("Failed to fetch username email");
            }
        } catch (error) {
            console.error('Username Email fetching failed:', error.response?.data || error.message);
        }
        finally {
            setLoading(false);
        }
    }



    useEffect(() => {
        fetchUsernameEmail();
    }, []);


    useEffect(()=>{
        const emailVerification = async () => {
            try{
                const response = await api.get('/police/is-email-verified',
                    {
                        headers:{'Authorization':`Bearer ${token}`}
                    });
                if(response.status === 200){
                    const verification = response.data;
                    setIsVerified(verification);
                }
            }
            catch(err){
                console.error('Error parsing email verification:', err);
            }
        }
        emailVerification();
    },[])


    const Logout = async () => {
        try {
            const response = await api.post('/police/logout', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                alert("You are Logout!");
                navigate('/loginPolice');
            }
        }
        catch (error) {
            console.error('Failed to Logout:', error.response?.data || error.message);
            alert("Failed to Logout!");
        }
    }

    const LogoutAll = async () => {
        try {
            const response = await api.post('/police/logout-all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                alert("You are Logout From All Devices!");
                navigate('/loginPolice');
            }
        }
        catch (error) {
            console.error('Failed to Logout From All Devices:', error.response?.data || error.message);
            alert("Failed to Logout From All Devices!");
        }
    }

    const DeleteAccount = async () =>{
        try {
            const response = await api.delete('/police/delete-account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                alert("You are Successfully Removed this Account!");
            }
        }
        catch (error) {
            console.error('Failed to Delete this Account:', error.response?.data || error.message);
            alert("Failed to Delete this Account!");
        }
    }

    const handleChangeUsername = async () => {
        const username = formik.values.username;
        try {
            const response = await api.post('/police/changer-username', {
                username:username,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                alert("Username changed successfully!");
                window.location.reload();
            }
            else {
                alert("Invalid Input!");
            }
        }
        catch (error) {
            console.error('Username Update Failed:', error.response?.data || error.message);
            alert("Username Update Failed!");
        }

    };

    const handleChangePassword = async () => {
        const { old_password, new_password, password_confirmation } = formik.values;
        try {
            const response = await api.post('/police/password/update', {
                current_password: old_password, new_password: new_password, new_password_confirmation: password_confirmation,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                alert("Password changed successfully!");
                window.location.reload();
            }
        }
        catch (error) {
            console.error('Password Update Failed:', error.response?.data || error.message);
            alert("Password Update Failed!");
        }
    };

    const VerifyEmail = async () => {
        const { otp } = formik.values.otp;

        try {
            const response = await api.post('/police/verify-email', {
                otp,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                alert("Account Verified Successfully!");
                window.location.reload();
            } else {
                alert("Invalid OTP!");
            }
        } catch (error) {
            console.error('Verification failed:', error.response?.data || error.message);
            alert("OTP Verification Failed!");
        }
    }

    const formik = useFormik({
        initialValues: {
            username: "",
            old_password: "",
            new_password: "",
            password_confirmation: "",
            otp: "",
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .required("Username is required")
                .min(6, 'Username at least 6 characters')
                .max(50, 'Username maximum size 50 characters'),
            old_password: Yup.string().required("Old Password is required"),
            new_password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required')
                .matches(/[A-Z]/, 'Must contain uppercase')
                .matches(/[a-z]/, 'Must contain lowercase')
                .matches(/[0-9]/, 'Must contain number')
                .matches(/[@$!%*?&]/, 'Must contain special character')
                .test('not-same-as-old', 'New password must be different from old password', function (value) {
                    const { old_password } = this.parent;
                    return value !== old_password;
                }),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
                .required('Confirm Password is required'),
            otp: Yup.string().required("OTP is required")
                .min(6, 'OTP must be 6 characters')
                .max(6, 'OTP must be 6 characters')
                .matches(/[0-9]/, 'OTP must contain only numbers'),
        }),
        onSubmit: (values) => {
            const formData = { ...values };
            setSubmittedData(formData);
            console.log("Form submitted:", formData);
        }
    });

    const accountSectionViews = {
        change_username: (
            <section id="change_username">
                <div className="card shadow rounded-4 mb-5 fs-5" style={{ backgroundColor: "#d3e2fd" }}>
                    <h5 className="card-title mb-3 fw-bold p-3">Change Username</h5>
                    <div className="user-input card-body bg-white rounded-top-4 rounded-bottom-4">
                        <Form onSubmit={async (e) => {
                            e.preventDefault();
                            await handleChangeUsername(formik.values);
                        }}>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Eg-John123"
                                    {...formik.getFieldProps('username')}
                                    isInvalid={formik.touched.username && formik.errors.username}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.username}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className="d-flex justify-content-lg-end mt-4">
                                <button className="btn btn-secondary btn-lg me-3" type="reset"
                                        style={{ fontSize: "medium", width: "20%" }}
                                        onClick={() => setActiveSection(null)}>
                                    No, Cancel
                                </button>
                                <button className="btn btn-dark btn-lg" type="submit"
                                        style={{ fontSize: "medium", width: "20%" }}>
                                    Update Changes
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </section>
        ),
        change_password: (
            <section id="change_password">
                <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
                    <h5 className="card-title mb-3 fw-bold p-3">Change Password</h5>
                    <div className="user-input card-body bg-white rounded-top-4 rounded-bottom-4">
                        <Form onSubmit={async (e) => {
                            e.preventDefault();
                            await handleChangePassword(formik.values);
                        }}>
                            <Form.Group controlId="old_password">
                                <Form.Label>Old Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    {...formik.getFieldProps('old_password')}
                                    isInvalid={formik.touched.old_password && formik.errors.old_password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.old_password}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group controlId="new_password">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    {...formik.getFieldProps('new_password')}
                                    isInvalid={formik.touched.new_password && formik.errors.new_password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.new_password}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group controlId="password_confirmation">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    {...formik.getFieldProps('password_confirmation')}
                                    isInvalid={formik.touched.password_confirmation && formik.errors.password_confirmation}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.password_confirmation}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className="d-flex justify-content-end mt-4">
                                <button className="btn btn-secondary btn-lg me-3" type="reset"
                                        style={{ fontSize: "medium", width: "20%" }}
                                        onClick={() => setActiveSection(null)}>
                                    No, Cancel
                                </button>
                                <button className="btn btn-dark btn-lg" type="submit"
                                        style={{ fontSize: "medium", width: "20%" }}>
                                    Update Changes
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </section>
        ),
        verify_email: (
            <div className="modal-overlay" onClick={() => setActiveSection(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2>Verify Email</h2>
                    <p>Enter the OTP sent to azeemhaleem451@gmail.com to verify</p>
                    <Form onSubmit={async (e) => {
                        e.preventDefault();
                        await VerifyEmail(formik.values);
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
                                style={{ width: "40%" }}
                                onClick={() => setActiveSection(null)}>
                                No, Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn-confirm justify-content-end"
                                style={{ width: "40%" }}>
                                Yes, Verify
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    };



    return (
        <div className="fines-list mt-5">
            {!activeSection && (
                <>
                    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
                        <h4 className="card-title mb-1 fw-bold p-3">Settings</h4>
                        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
                            <ul className="list-group list-group-flush">
                                <SettingItem icon={<FaUser />} label="Account" bar id="account"
                                             onClick={setActiveSection} />
                                <SettingItem icon={<FaBell />} label="Notifications" toggle id="notifications"
                                             onClick={setActiveSection} />
                                <SettingItem icon={<FaQuestionCircle />} label="Help & Support" bar id="support"
                                             onClick={setActiveSection} />
                                <SettingItem icon={<FaSignOutAlt />} label="Log Out" bar id="logout"
                                             onClick={setActiveSection} />
                                <SettingItem icon={<FaSignOutAlt />} label="Log Out All Devices" bar id="logoutAll"
                                             onClick={setActiveSection} />
                            </ul>
                        </div>
                    </div>

                    <div className="card shadow rounded-3" style={{ marginBottom: "10%" }}>
                        <div className="card-body p-1">
                            <ul className="list-group list-group-flush text-white">
                                <SettingItem icon={<FaTrash />} label="Delete Account" id="deleteAccount"
                                             onClick={setActiveSection} />
                            </ul>
                        </div>
                    </div>
                </>
            )}
            {accountSection && accountSectionViews[accountSection]}

            {activeSection === "account" && !accountSection && (
                <section id="account">
                    <div className="row">
                        <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
                            <h4 className="card-title mb-3 fw-bold p-3">Account</h4>
                            <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
                                <div>
                                    <span className="info-label">Username:</span>
                                    <Link to=""
                                          className="info-value d-flex w-100 text-decoration-none text-black opacity-75"
                                          onClick={() => setAccountSection("change_username")}
                                          style={{ cursor: 'pointer' }}>
                                        <div className="d-flex justify-content-start">{officerData.username || 'No username'}</div>
                                        <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
                                    </Link>
                                </div>
                                <div>
                                    <span className="info-label">Password:</span>
                                    <Link to=""
                                          className="info-value d-flex w-100 text-decoration-none text-black opacity-75"
                                          onClick={() => setAccountSection("change_password")}>
                                        <div className="d-flex justify-content-start">********</div>
                                        <div className="d-flex justify-content-end me-4 fs-5">&gt;</div>
                                    </Link>
                                </div>
                                <div>
                                    <span className="info-label">Email:</span>
                                    {isVerified ? (
                                        <div
                                            className="info-value d-flex w-100 text-decoration-none text-black opacity-75">
                                            <div className="d-flex justify-content-start">
                                                {/*{user?.email ?*/}
                                                {/*    user.email.replace(/^(.{5})(.*)(@.*)$/, (_, start, middle, domain) =>*/}
                                                {/*        start + '*'.repeat(middle.length) + domain*/}
                                                {/*    ) : 'No email available'}*/}
                                                {officerData.email || 'No email available'}
                                            </div>
                                            <div
                                                className="d-flex justify-content-center text-success">Verified &#x2705;</div>
                                            <div className="d-flex justify-content-end me-4 fs-5"></div>
                                        </div>
                                    ) : (
                                        <Link to="" className="info-value d-flex w-100 text-decoration-none text-black opacity-75"
                                              onClick={() => setAccountSection("verify_email")}>
                                            <div className="d-flex justify-content-start">
                                                {/*{user?.email ?*/}
                                                {/*    user.email.replace(/^(.{5})(.*)(@.*)$/, (_, start, middle, domain) =>*/}
                                                {/*        start + '*'.repeat(middle.length) + domain*/}
                                                {/*    ) : 'No email available'}*/}
                                                {officerData.email || 'No email available'}
                                            </div>
                                            <div className="d-flex justify-content-center text-danger">Not
                                                Verified &#x274C;</div>
                                            <div className="d-lg-flex d-none justify-content-end me-4 fs-5">&gt;</div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {activeSection === "support" && (
                <section id="support">
                    <div className="card shadow rounded-4 mb-5" style={{ backgroundColor: "#d3e2fd" }}>
                        <h4 className="card-title mb-3 fw-bold p-3">Help & Support</h4>
                        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
                            <h5 className="ms-lg-5 ps-4 fw-bold mb-2">Help</h5>
                            <ul className="list-group list-group-flush mb-4">
                                <HelpItem icon={<FaFilePdf />} label="Download User Support document" href="#" />
                            </ul>
                            <hr />
                            <h5 className="ms-lg-5 ps-4 fw-bold my-4">Get Support from Our team</h5>
                            <ul className="list-group list-group-flush">
                                <HelpItem icon={<FaMailBulk />} label="Email" bar href="mailto:azeemhaleem451@gmail.com" />
                                <HelpItem icon={<FaWhatsapp />} label="WhatsApp" bar href="https://wa.me/94703622543" />
                                <HelpItem icon={<FaFacebook />} label="Facebook" bar href="https://web.facebook.com" />
                                <HelpItem icon={<FaInstagram />} label="Instagram" bar href="https://web.instagram.com" />
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {activeSection === "logout" && (
                <section id="logout">
                    <div className="modal-overlay" onClick={() => setActiveSection(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>LogOut</h2>
                            <div className="warning-box">
                                <p>Are you sure want to Logout from this Device?</p>
                            </div>
                            <Form onSubmit={async (e) => {
                                e.preventDefault();
                                await Logout();
                            }}>
                                <div className="modal-actions d-flex">
                                    <button
                                        type="button"
                                        className="btn-cancel justify-content-start"
                                        style={{ width: "40%" }}
                                        onClick={() => setActiveSection(null)}>
                                        No, Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-confirm justify-content-end"
                                        style={{ width: "40%" }}>
                                        Yes, Logout
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </section>
            )}

            {activeSection === "logoutAll" && (
                <section id="logoutAll">
                    <div className="modal-overlay" onClick={() => setActiveSection(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>LogOut</h2>
                            <div className="warning-box">
                                <p>Are you sure want to Logout from All Devices?</p>
                            </div>
                            <Form onSubmit={async (e) => {
                                e.preventDefault();
                                await LogoutAll();
                            }}>
                                <div className="modal-actions d-flex">
                                    <button
                                        type="button"
                                        className="btn-cancel justify-content-start"
                                        style={{ width: "40%" }}
                                        onClick={() => setActiveSection(null)}>
                                        No, Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-confirm justify-content-end"
                                        style={{ width: "40%" }}>
                                        Yes, Logout
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </section>
            )}

            {activeSection === "deleteAccount" && (
                <section id="deleteAccount">
                    <div className="modal-overlay" onClick={() => setActiveSection(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Delete Account</h2>
                            <div className="warning-box">
                                <p>Are you sure want to Delete this Account?</p>
                            </div>
                            <Form onSubmit={async (e) => {
                                e.preventDefault();
                                await DeleteAccount();
                            }}>
                                <div className="modal-actions d-flex">
                                    <button
                                        type="button"
                                        className="btn-cancel justify-content-start"
                                        style={{ width: "40%" }}
                                        onClick={() => setActiveSection(null)}>
                                        No, Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-confirm justify-content-end text-nowrap"
                                        style={{ width: "50%" }}>
                                        Yes, Delete Account
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default SuperAdminSettings