import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSquarePhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer className="text-white w-100 pt-4 pb-2" style={{ backgroundColor: "#000032" }}>
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Left Section */}
          <div className="col-12 col-md-4 mb-5" >
            <h1 className="sub-title mb-3">FinTech</h1>

            <div className="d-flex">
              <FontAwesomeIcon icon={faPaperPlane} />
              <p>Fintech@hotmail.com</p>
            </div>

            <div className="d-flex">
              <FontAwesomeIcon icon={faSquarePhone}/>
              <p>+94772622543</p>
            </div>

            <div className="d-flex justify-content-center justify-content-md-start gap-3" style={{margin:"3%"}}>
              <a href="https://facebook.com"><FontAwesomeIcon icon={faFacebook} /></a>
              <a href="https://x.com"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="https://instagram.com"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="https://linkedin.com"><FontAwesomeIcon icon={faLinkedin} /></a>
            </div>
          </div>


            
          {/* Programs */}
          <div className="col-6 col-md-2 mb-4 ml-3 text-center mt-2">
            <h5>Programs</h5>
            <p>Corporate</p>
            <p>One to One</p>
            <p>Consulting</p>
          </div>

          {/* Service */}
          <div className="col-6 col-md-3 mb-4 text-center mt-2">
            <h5>Service</h5>
            <p>Display</p>
            <p>Texting</p>
            <p>Emailing</p>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-3 mb-4 text-center mt-2">
            <h5>Contact</h5>
            <p>Home</p>
            <p>About</p>
            <p>Contact</p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="text-center mt-4">
          <p className="mb-1">Powered by Fintech</p>
          <p className="mb-0">&copy; 2024 - Fine Management System</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
