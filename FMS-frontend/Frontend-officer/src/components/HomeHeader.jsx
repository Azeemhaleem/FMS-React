import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div>
                <nav className="navbar navbar-expand-lg bg-white">
                    <div className="container-fluid">
                        <div className="d-inline-flex">
                            <a href="/home" style={{ textDecoration: "none", color: "black" }}>
                            <h4 className="web-title navbar-brand fw-semibold fs-2 justify-content-start mt-2">Fine Management
                                System</h4>
                            </a>
                            <button className="navbar-toggler justify-content-end" type="button" onClick={toggleMenu} style={{width:"15%"}}>
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        </div>

                        <div className="collapse navbar-collapse" id="navbarNav" style={{fontSize: "larger"}}>
                            <ul className="navbar-nav ms-auto">
                                <li className="nav-item d-flex">
                                    <a className="nav-link" href="#home"><p
                                        className=" d-flex align-content-center justify-content-center">Home</p></a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#contact-us"><p
                                        className=" d-flex align-content-center justify-content-center">Contact</p></a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#"><p
                                        className=" d-flex align-content-center justify-content-center">Help</p></a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#about"><p
                                        className=" d-flex align-content-center justify-content-center">About</p></a>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to='/login'><p
                                        className=" d-flex align-content-center justify-content-center">Login</p></Link>
                                </li>
                            </ul>
                        </div>

                        {isMenuOpen && (
                            <div className="sidebar-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-start" style={{backgroundColor:"rgba(0, 0, 0, 0.3)",zIndex:"1040"}} onClick={toggleMenu}>
                                <div className="sidebar h-100 position-relative" style={{width:"70%",padding:"20px",animation:"slideIn 0.3s ease-out forwards",backgroundColor: "#636368"}} onClick={(e) => e.stopPropagation()}>
                                    <button className="close-btn position-absolute border-0 pointer-event fs-1 text-white" style={{background:"none",top:"10px"}} onClick={toggleMenu}>×</button>
                                    <ul className="navbar-nav ms-auto mt-5">
                                        <li className="nav-item d-flex">
                                            <a className="nav-link" href="#home"><p
                                                className=" d-flex align-content-center justify-content-center">Home</p></a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#contact-us"><p
                                                className=" d-flex align-content-center justify-content-center">Contact</p></a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#"><p
                                                className=" d-flex align-content-center justify-content-center">Help</p></a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#about"><p
                                                className=" d-flex align-content-center justify-content-center">About</p></a>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to='/login'><p
                                                className=" d-flex align-content-center justify-content-center">Login</p></Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
    );
}

export default HomeHeader;