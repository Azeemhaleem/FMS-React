import React, { useEffect, useState } from "react";
import api from "../api/axios.jsx";
import * as Yup from "yup";
import { useFormik } from "formik";

// child components (same folder)
import ScanPage from "./Dashboard-Components/ScanPage.jsx";
import SuccessPage from "./Dashboard-Components/SuccessStatus.jsx";
import ConfirmPage from "./Dashboard-Components/DriverInfomation.jsx";
import IssueFineModal from "./Dashboard-Components/IssueFine.jsx";

// Safely read token (works if stored as raw string or JSON)
const getToken = () => {
    try {
        const raw = localStorage.getItem("token");
        if (!raw) return null;
        if (raw.startsWith("{") || raw.startsWith("[")) return JSON.parse(raw);
        return raw;
    } catch {
        return localStorage.getItem("token");
    }
};

// Normalize fines from different API shapes to { id, name }
const normalizeFines = (raw) => {
    if (!raw) return [];
    let list = [];

    if (Array.isArray(raw)) list = raw;
    else if (Array.isArray(raw.fines)) list = raw.fines;
    else if (Array.isArray(raw.data)) list = raw.data;
    else if (Array.isArray(raw.items)) list = raw.items;
    else return [];

    return list
        .map((f) => {
            const id = f.id ?? f.fine_id ?? f._id ?? f.FineID;
            const name =
                f.name ??
                f.fine_name ??
                f.title ??
                f.FineName ??
                f.description ??
                (id ? `Fine #${id}` : null);
            return id && name ? { id, name } : null;
        })
        .filter(Boolean);
};

function OfficerDashboard() {
    const [scanResult, setScanResult] = useState(null);
    const [add, setAdd] = useState(false);

    const [fines, setFines] = useState([]);
    const [finesLoading, setFinesLoading] = useState(false);
    const [finesError, setFinesError] = useState("");

    const [selectedDriver, setSelectedDriver] = useState(null);
    const [issueFine, setIssueFine] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [selectedFine, setSelectedFine] = useState(null);

    const token = getToken();
    console.log("token:", token);

    // Fetch fines once
    const fetchFines = async () => {
        setFinesLoading(true);
        setFinesError("");
        try {
            // Pick the correct endpoint for your backend (uncomment the right one).
            const res = await api.get("/get-all-fines", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // const res = await api.get("/fines", {
            //   headers: { Authorization: `Bearer ${token}` },
            // });

            const normalized = normalizeFines(res.data);
            setFines(normalized);
        } catch (e) {
            console.error("Error fetching fines:", e?.response?.data || e.message);
            setFines([]);
            setFinesError(
                e?.response?.data?.message || "Failed to load fines. Please try again."
            );
        } finally {
            setFinesLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchFines();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // After successful scan + driver loaded, show Success page for 3s, then Confirm page
    useEffect(() => {
        if (scanResult && selectedDriver) {
            const timer = setTimeout(() => {
                setAdd(true);
                setScanResult(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [scanResult, selectedDriver]);

    // Verify license when scanResult changes
    useEffect(() => {
        async function fetchDriver() {
            if (!scanResult) return;
            try {
                console.log("Sending license number:", scanResult);
                const response = await api.post(
                    "/check-license-number",
                    { driver_license_number: scanResult },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.status === 200) {
                    const driver = response?.data;
                    if (driver) {
                        const {
                            license_no,
                            license_id_no,
                            full_name,
                            license_expiry_date,
                            license_issued_date,
                        } = driver;

                        setSelectedDriver({
                            license_number: license_no,
                            full_name: full_name || "N/A",
                            license_id_no: license_id_no || "N/A",
                            license_issued_date: license_issued_date || "N/A",
                            license_expiry_date: license_expiry_date || "N/A",
                        });
                    } else {
                        console.error("Driver data is missing:", response.data);
                        alert("Driver data is missing. Please check the scan.");
                        setSelectedDriver(null);
                    }
                } else {
                    alert("Invalid Scan. Please try again.");
                    setSelectedDriver(null);
                }
            } catch (error) {
                console.error("Verification error:", error.response?.data || error.message);
                alert("Error verifying driver. Please check your input or try again later.");
            }
        }
        fetchDriver();
    }, [scanResult, token]);

    // Formik
    const formik = useFormik({
        initialValues: {
            Fine: "",
            DriverQr: selectedDriver?.license_number || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            Fine: Yup.string().required("Select a Fine"),
        }),
        onSubmit: (values) => {
            const formData = {
                ...values,
                DriverQr: selectedDriver?.license_number,
            };
            setSubmittedData(formData);
            setIssueFine(true);
            console.log("Form submitted:", formData);
        },
    });

    const handleFineSelect = (event) => {
        const id = parseInt(event.target.value, 10);
        const selected = fines.find((f) => f.id === id) || null;
        setSelectedFine(selected);
        formik.setFieldTouched("Fine", true);
        formik.setFieldValue("Fine", selected?.name || "");
    };

    const handleAdd = () => setAdd(true);

    const resetAll = () => {
        setIssueFine(false);
        setAdd(false);
        setScanResult(null);
        setSelectedDriver(null);
        setSubmittedData(null);
        setSelectedFine(null);
    };

    const closeModal = () => setIssueFine(false);

    const addFine = async () => {
        console.log("Selected Driver:", selectedDriver);
        console.log("Selected Fine:", selectedFine);

        if (!selectedFine?.id || !selectedDriver?.license_number) {
            alert("Missing fine or driver information.");
            console.error(
                "Selected fine or driver information is missing:",
                selectedFine,
                selectedDriver
            );
            return;
        }

        try {
            const response = await api.post(
                "/charge-fine",
                {
                    fine_id: selectedFine.id,
                    driver_license_number: selectedDriver.license_number,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                const { fine_id, driver_license_number } = response.data;
                console.log("Fine ID:", fine_id);
                console.log("Driver License Number:", driver_license_number);

                alert("Fine issued Successfully!");
                setSubmittedData(null);
                resetAll();
            } else {
                console.error("Unexpected response status:", response.status);
                alert("Unexpected error occurred while issuing the fine.");
            }
        } catch (error) {
            console.error("Error adding fine:", error.response?.data || error.message);
            if (error.response) {
                alert(
                    `Failed to issue fine. Error: ${error.response?.data?.message || error.message}`
                );
            } else {
                alert("Failed to issue fine due to a network issue or server error.");
            }
        }
    };

    return (
        <div className="mb-5">
            {!scanResult && !selectedDriver && !add && (
                <ScanPage setScanResult={setScanResult} />
            )}

            {scanResult && selectedDriver && !add && (
                <SuccessPage />
            )}

            {selectedDriver && add && (
                <ConfirmPage
                    selectedDriver={selectedDriver}
                    fines={fines}
                    finesLoading={finesLoading}
                    finesError={finesError}
                    selectedFine={selectedFine}
                    handleFineSelect={handleFineSelect}
                    formik={formik}
                    handleAdd={handleAdd}
                    closeModal={resetAll}
                />
            )}

            {issueFine && (
                <IssueFineModal
                    selectedDriver={selectedDriver}
                    selectedFine={selectedFine}
                    onCancel={closeModal}
                    onConfirm={addFine}
                />
            )}
        </div>
    );
}

export default OfficerDashboard;
