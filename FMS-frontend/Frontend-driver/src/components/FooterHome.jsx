import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane, faSquarePhone} from "@fortawesome/free-solid-svg-icons";
import {faFacebook, faInstagram, faLinkedin, faTwitter} from "@fortawesome/free-brands-svg-icons";


function FooterHome() {
    return (
        <footer className="text-white position-absolute w-100" style={{backgroundColor: "#000032"}}>
            <div className="header mt-4 mb-5">
                <div className="row">
                    <div className="col-lg-4 mb-5 mb-lg-0">
                        <div className="site ms-3">
                            <h1 className="sub-title mb-5">FinTech</h1>
                            <div className="d-flex align-items-center mb-2">
                                <FontAwesomeIcon icon={faPaperPlane} className="me-2" style={{maxWidth: "10%"}}/>
                                <p className="mb-0">Fintech@hotmail.com</p>
                            </div>

                            <div className="d-flex align-items-center mb-4">
                                <FontAwesomeIcon icon={faSquarePhone} className="me-2"
                                                 style={{maxWidth: "10%"}}/>
                                <p className="mb-0">+94772622543</p>
                            </div>

                            <div className="social-icons d-flex w-75 gap-4" style={{maxWidth: "40%"}}>
                                <a href="https://facebook.com"><FontAwesomeIcon icon={faFacebook}/></a>
                                <a href="https://x.com"><FontAwesomeIcon icon={faTwitter}/></a>
                                <a href="https://instagram.com"><FontAwesomeIcon icon={faInstagram}/></a>
                                <a href="https://linkedin.com"><FontAwesomeIcon icon={faLinkedin}/></a>
                            </div>
                        </div>
                    </div>

                    <div className="ms-4 ms-lg-0 col-lg-3 col-4">
                        <h3>Programs</h3>
                        <p>Corporate</p>
                        <p>One to One</p>
                        <p>Consulting</p>
                    </div>

                    <div className=" col-lg-3 col-4">
                        <h3>Service</h3>
                        <p>Display</p>
                        <p>Texting</p>
                        <p>Emailing</p>
                    </div>

                    <div className="col-2">
                        <h3>Contact</h3>
                        <p>Home</p>
                        <p>About</p>
                        <p>Contact</p>
                    </div>
                </div>
            </div>

            <div className="row d-flex justify-content-center">
                <div className="col-lg-3">
                    <p className="d-flex justify-content-center" style={{lineHeight: "10%"}}>Powered by Fintech</p>
                    <p className="d-flex justify-content-center">&copy; 2024-Fine Management System</p>
                </div>
            </div>
        </footer>
    )
}

export default FooterHome;