import './Home.css'
import homeimage from '../assets/1709117986126.png';
import {useState,useEffect} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faPaperPlane, faSquarePhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Slider from './Slider.jsx'
import { useFormik } from "formik";
import * as Yup from "yup";
import {Form} from "react-bootstrap";
import {Link} from "react-router-dom";
import FooterHome from "../components/FooterHome.jsx";
import HomeHeader from "../components/HomeHeader.jsx"

function Home(){
    const [command, setCommand] = useState([]);
    const [submitteddata,setSubmitteddata] = useState(null);
    const [sendCommand, setSendCommand] = useState(false);
    const [add,setAdd] = useState(false);

    const formik = useFormik({
        initialValues: {
            Name:"",
            NIC:"",
            LicenseNo:"",
            Email:"",
            Message:""
        },
        validationSchema: Yup.object({
            Name: Yup.string().required("Name is required"),

            NIC: Yup.string().required("NIC is required"),

            LicenseNo: Yup.string().required("License Number is required"),

            Email: Yup.string().required("Email is required"),

            Message: Yup.string().required("You Must Write a Message"),

        }),
        onSubmit: (values) => {
            const formData = {
                ...values
            };

            setSubmitteddata(formData);
            setSendCommand(true);

            console.log("Command send:", formData);

            setTimeout(() => {
                closeModal();
                formik.resetForm();
            }, 2000);
        }
    });

    const handleAdd = () => {
        setAdd(true);
    };

    const closeModal = () => {
        setAdd(false);
        setSendCommand(false);
        setSubmitteddata(null);  // <-- And this one too
    };

    const addCommand = (submittedData) => {
        const { Name, NIC,LicenseNo,Email,Message } = submittedData;

        const newCommand = {
            Name,
            NIC,
            LicenseNo,
            Email,
            Message
        };

        setCommand([...command, newCommand]);
        console.log("new command added:", newCommand);
        setSubmitteddata(null);
        closeModal();
    };

    return (
        <div className="home-screen w-100 h-100 m-0 p-0 text-black bg-white" style={{fontFamily:"Inter, sans-serif"}}>
            <HomeHeader/>
            <section className="home d-lg-flex d-block py-5" id="home" style={{backgroundColor: "#A0C0FA"}}>
                <div className="titlebar w-lg-50 ms-lg-5 ms-4 px-4 py-1 justify-content-lg-center align-content-lg-center">
                    <div className="">
                        <h2 className="mb-3 fw-semibold" style={{whiteSpace: "nowrap"}}>FineEase- Simplifying Penalty
                            Processing</h2>
                        <p className="" style={{fontSize: "larger"}}>FineEase streamlines penalty processing with an
                            intuitive interface, enabling law enforcement to
                            issue, track, and manage fines efficiently. It simplifies workflows, reduces administrative
                            tasks, and ensures faster, more accurate handling of violations.</p>
                        <div className="d-flex justify-content-start ms-lg-5 ms-2">
                            <button className="btn w-25 me-3 rounded py-2"
                                    style={{backgroundColor: "#24243E", maxWidth: "110px"}}><Link to="/register"
                                                                                                  className="text-decoration-none text-white">SignUp</Link>
                            </button>
                            <button className="btn w-25 rounded py-2"
                                    style={{backgroundColor: "#24243E", maxWidth: "110px"}}><Link to="/login"
                                                                                                  className="text-decoration-none text-white">LogIn</Link>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="image float-lg-end d-flex justify-content-lg-end">
                    <img src={homeimage} alt="" style={{width: '300px', marginRight: "20%"}}/>
                </div>
            </section>
            <section className="about" id="about">
                <div className={"about-page"}>
                    <h2>About-Us</h2>
                    <Slider/>
                </div>
            </section>
            <section id="contact-us">
                <div className="contact">
                    <h2>Contact-Us</h2>
                    <div>
                        <div className="mes-page col-lg-4 pb-4" style={{width:"35%", position:"relative", left:"15%"}}>
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                if (formik.isValid) handleAdd();
                                formik.handleSubmit(e);
                            }}>

                                <Form.Group controlId="Name">
                                    <Form.Control
                                        type="text"
                                        placeholder="Name"
                                        {...formik.getFieldProps('Name')}
                                        isInvalid={formik.touched.Name && formik.errors.Name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.Name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="NIC">
                                    <Form.Control
                                        type="text"
                                        placeholder="NIC"
                                        {...formik.getFieldProps("NIC")}
                                        isInvalid={formik.touched.NIC && formik.errors.NIC}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.NIC}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="LicenseNo">
                                    <Form.Control
                                        type="text"
                                        placeholder="Driver License Number"
                                        {...formik.getFieldProps("LicenseNo")}
                                        isInvalid={formik.touched.LicenseNo && formik.errors.LicenseNo}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.LicenseNo}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="Email">
                                    <Form.Control
                                        type="email"
                                        placeholder="Email Address"
                                        {...formik.getFieldProps('Email')}
                                        isInvalid={formik.touched.Mobile_No && formik.errors.Email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.Email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="Message">
                                    <Form.Control
                                        type="text"
                                        as="textarea"
                                        placeholder="Message"
                                        rows="4" style={{backgroundColor: "#DBE5F1",height:"auto",boxShadow:"none",textAlign:"left"}}
                                        {...formik.getFieldProps("Message")}
                                        isInvalid={formik.touched.Message && formik.errors.Message}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.Message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group>
                                    <div className="d-flex justify-content-end mt-3 mes-pass" style={{width:"70%"}}>
                                        <button
                                            className="btn btn-dark btn-lg"
                                            type="submit"
                                            style={{fontSize: "medium", backgroundColor: "#24243E",width:"60%"}}
                                            onClick={addCommand}>
                                            Submit
                                        </button>
                                    </div>
                                </Form.Group>
                            </Form>
                            {sendCommand && <p style={{color: 'green', textAlign: 'center'}}>Command Sent Successfully!</p>}
                        </div>
                    </div>
                </div>
            </section>
            <FooterHome/>
        </div>
    )
}

export default Home;