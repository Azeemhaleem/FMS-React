import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const SlideToContinue = ({ handleAdd, formValues }) => {
    const x = useMotionValue(0);
    const buttonRef = useRef(null);
    const trackWidth = 250;

    const opacity = useTransform(x, [0, trackWidth - 60], [0.5, 1]);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = x.on("change", (latestX) => {
            if (latestX > trackWidth - 60) {
                if (!formValues?.DriverQr || formValues.DriverQr.trim() === "") {
                    setError("Please scan your license QR code before continuing.");
                    animate(x, 0);
                    return;
                }

                setError("");
                handleAdd();
                animate(x, 0);
            }
        });

        return () => unsubscribe();
    }, [x, formValues, handleAdd]);

    return (
        <>
            <div
                ref={buttonRef}
                className="position-relative bg-light btn-submit"
                style={{
                    width: trackWidth,
                    height: 50,
                    overflow: "hidden",
                    border: "2px solid #3C3C72",
                    padding: "4px"
                }}
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: trackWidth - 60 }}
                    className="bg-gradient"
                    style={{
                        x,
                        width: 60,
                        height: 40,
                        borderRadius: "10%",
                        backgroundColor: "#24243E",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold"
                    }}
                    whileTap={{ scale: 1.1 }}
                >
                    ▶▶
                </motion.div>

                <motion.div className="fw-bold"
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#24243E",
                                fontSize: "large",
                                pointerEvents: "none",
                                opacity
                            }}
                >
                    Slide to Continue
                </motion.div>
            </div>

            {error && (
                <div className="px-lg-5 ms-lg-5" style={{ color: "red", marginTop: "5px", fontWeight: "bold"}}>
                    {error}
                </div>
            )}
        </>
    );
};

export default SlideToContinue;
