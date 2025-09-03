import React from 'react';
import ImageSlider, { Slide } from "react-auto-image-slider";
import img1 from '../assets/motor_traffic.png';
import img2 from '../assets/police.jpg';
import img3 from '../assets/driver rules.jpg';


const Slider = () => {
    return (
        <div className="image-slider d-flex overflow-hidden position-relative shadow" style={{maxHeight:"75vh",margin:"20px auto",width:"92%"}}>
            <ImageSlider effectDelay={1000} autoPlayDelay={1000} className="h-100">
                <Slide>
                    <div className="" style={{backgroundColor:"#CB9EA3",width:"100%",height:"100%"}}>
                        <div className="Slidebar-Content">
                            <h2>Motor Department News</h2>
                            <div className="Sildebar-links row">
                                <div className="col-lg-4 mb-3">
                                    <img src={img1} alt="Motor Department News" id="department_img"/>
                                </div>
                                <div className="col-lg-6">
                                    <p>The Motor Department has introduced a new computerized Traffic Fine Management
                                        System aimed at improving the efficiency of traffic fine issuance and
                                        collection. This system is designed to streamline the process of managing
                                        traffic violations, ensuring faster and more accurate processing.
                                        Under the new system, traffic fines are recorded and processed electronically,
                                        reducing paperwork and minimizing human error. Traffic officers will now input
                                        violation details directly into the system, which automatically generates fine
                                        notices. Drivers can also check their fines online using a dedicated portal,
                                        where they can view their violations and settle payments securely.
                                        Officials from the Motor Department highlighted that this computerized system
                                        will speed up fine collection and offer greater transparency to the public. The
                                        digital platform enables authorities to maintain a comprehensive database of
                                        traffic violations, which can be used to analyze trends and improve road safety
                                        initiatives.
                                        This initiative is part of the Motor Department's ongoing efforts to modernize
                                        services and provide convenient, reliable solutions for both law enforcement
                                        officers and the public. With the new system in place, the department
                                        anticipates faster resolution times for traffic fines and reduced delays in
                                        processing.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </Slide>

                <Slide>
                    <div style={{backgroundColor: "#F4F4FB", width: "100%", height: "100%"}}>
                        <div className="Slidebar-Content">
                            <h2>Police Updates</h2>
                            <div className="Sildebar-links row">
                                <div className="col-lg-6 mb-3">
                                    <img src={img2} alt="Police Updates" id="police_img"/>
                                </div>
                                <div className="col-lg-6">
                                    <p>In a major step towards modernizing its operations, the Police Department has
                                        rolled
                                        out a new Computerized Fine Management System designed to improve the handling
                                        of
                                        traffic violations. This system will enable officers to electronically record
                                        and
                                        manage traffic fines more efficiently, eliminating the need for manual
                                        paperwork.
                                        The system allows traffic officers to input violation details on-site, with the
                                        data
                                        immediately updated in a centralized database. Once a fine is recorded,
                                        offenders
                                        can access the system online to check their outstanding fines and make payments
                                        through a secure payment gateway. This digital solution is expected to
                                        significantly
                                        reduce processing times and enhance the accuracy of the fine issuance process.
                                        A spokesperson for the Police Department stated that the system’s introduction
                                        will lead to greater transparency and accountability, as all traffic violations
                                        will now be stored in a secure and accessible format. Moreover, the system
                                        provides detailed reporting tools that allow the police to track high-violation
                                        areas, helping them allocate resources more effectively to reduce traffic
                                        incidents.
                                        This initiative aligns with the Police Department’s broader goal of utilizing
                                        technology to improve public services and ensure that law enforcement is more
                                        responsive and efficient. Public feedback will be encouraged as the system is
                                        implemented, ensuring continuous improvements and ease of use for both officers
                                        and the general public.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </Slide>

                <Slide>
                    <div style={{backgroundColor: "#FBDCA2", width: "100%", height: "100%"}}>
                        <div className="Slidebar-Content">
                            <h2>Driver rules and regulations</h2>
                            <div className="Sildebar-links row">
                                <div className="col-lg-6 mb-3">
                                    <img src={img3} alt="Driver rules and regulations" id="rules_img"/>
                                </div>
                                <div className="col-lg-6">
                                    <p>As part of its ongoing efforts to enhance road safety and streamline traffic law
                                        enforcement, the Police Department has introduced updated driver rules and
                                        regulations in conjunction with the launch of a new Computerized Fine Management
                                        System. The updated regulations aim to promote safer driving practices and
                                        ensure
                                        more effective enforcement of traffic laws.
                                        The computerized system will allow drivers to view updated rules and regulations
                                        through an online portal, offering easy access to all necessary information.
                                        This
                                        includes speed limits, new road signs, and other traffic laws. Drivers who
                                        violate
                                        these rules will have their fines recorded electronically, making the process
                                        more
                                        efficient and transparent.
                                        Additionally, the system provides an online platform where drivers can instantly
                                        check their traffic violations and settle fines without needing to visit the
                                        police
                                        station. The updated rules emphasize stricter penalties for repeat offenders,
                                        with
                                        higher fines and possible license suspension for those who accumulate multiple
                                        violations within a short period.
                                        Officials from the Police Department stressed the importance of familiarizing
                                        oneself with the new regulations, as ignorance of the law will not be considered
                                        a valid defense for violations. The department is also planning a public
                                        awareness campaign to educate drivers about the new rules and the benefits of
                                        the computerized fine system.
                                        With these changes, the Police Department hopes to encourage more responsible
                                        driving behavior, reduce traffic accidents, and improve overall road safety.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Slide>
            </ImageSlider>
        </div>
    );
};

export default Slider;
