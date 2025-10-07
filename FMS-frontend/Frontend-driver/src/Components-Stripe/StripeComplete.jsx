import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import api from "../api/axios.jsx";

const initializeStripe = () => {
    try {
        const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY;

        if (!stripePublishableKey) {
            console.error("Stripe publishable key is missing");
            return null;
        }

        if (typeof stripePublishableKey !== 'string' || !stripePublishableKey.startsWith('pk_')) {
            console.error("Invalid Stripe publishable key format");
            return null;
        }

        return loadStripe(stripePublishableKey);
    } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        return null;
    }
};

const stripePromise = initializeStripe();

export default function StripeComplete() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("checking");
    const [message, setMessage] = useState("Verifying your payment...");
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const clientSecret = searchParams.get("payment_intent_client_secret");
                const paymentIntentId = searchParams.get("payment_intent");

                if (!clientSecret && !paymentIntentId) {
                    setStatus("error");
                    setMessage("Payment verification failed - missing payment information");
                    setLoading(false);
                    return;
                }

                const stripe = await stripePromise;
                if (!stripe) {
                    setStatus("error");
                    setMessage("Payment system unavailable");
                    setLoading(false);
                    return;
                }

                let paymentIntent;

                if (clientSecret) {
                    const { paymentIntent: retrievedIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

                    if (error) {
                        setStatus("error");
                        setMessage(error.message || "Failed to verify payment");
                        setLoading(false);
                        return;
                    }

                    paymentIntent = retrievedIntent;
                }

                else if (paymentIntentId) {
                    try {
                        const token = localStorage.getItem("token");
                        const response = await api.get(`/intent/${paymentIntentId}`, { // Changed from /payment-intent/ to /intent/
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        paymentIntent = response.data;
                    } catch (err) {
                        console.error("Failed to retrieve payment intent:", err);
                        setStatus("error");
                        setMessage("Could not retrieve payment details");
                        setLoading(false);
                        return;
                    }
                }

                if (!paymentIntent) {
                    setStatus("error");
                    setMessage("Payment information not found");
                    setLoading(false);
                    return;
                }

                setPaymentIntentId(paymentIntent.id);

                switch (paymentIntent.status) {
                    case "succeeded":
                        setStatus("success");
                        setMessage("Payment completed successfully!");
                        await updatePaymentStatus(paymentIntent.id, "succeeded");
                        break;
                    case "processing":
                        setStatus("processing");
                        setMessage("Your payment is being processed...");
                        setTimeout(() => verifyPayment(), 3000);
                        return; // Don't set loading to false yet
                    case "requires_payment_method":
                        setStatus("error");
                        setMessage("Payment failed. Please try a different payment method.");
                        break;
                    case "requires_action":
                        setStatus("processing");
                        setMessage("Additional action required to complete your payment.");
                        break;
                    case "canceled":
                        setStatus("error");
                        setMessage("Payment was canceled.");
                        break;
                    default:
                        setStatus("processing");
                        setMessage(`Payment status: ${paymentIntent.status}`);
                }
            } catch (err) {
                setStatus("error");
                setMessage("An unexpected error occurred while verifying payment");
                console.error("Payment verification error:", err);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    const updatePaymentStatus = async (paymentIntentId, status) => {
        try {
            const token = localStorage.getItem("token");
            await api.post("/status", { // Changed from /api/payment-status to /status
                paymentIntentId,
                status
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (err) {
            console.error("Failed to update payment status:", err);
        }
    };

    const getStatusIcon = () => {
        const iconSize = 64;
        switch (status) {
            case "success":
                return <CheckCircle size={iconSize} className="text-success" />;
            case "error":
                return <XCircle size={iconSize} className="text-danger" />;
            case "processing":
                return <Clock size={iconSize} className="text-warning" />;
            default:
                return <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>;
        }
    };

    const getCardClass = () => {
        switch (status) {
            case "success":
                return "border-success";
            case "error":
                return "border-danger";
            case "processing":
                return "border-warning";
            default:
                return "border-primary";
        }
    };

    const getButtonClass = () => {
        switch (status) {
            case "success":
                return "btn-success";
            case "error":
                return "btn-danger";
            default:
                return "btn-primary";
        }
    };

    const getButtonText = () => {
        switch (status) {
            case "success":
                return "Return to Payments";
            case "error":
                return "Try Again";
            case "processing":
                return "Continue Waiting";
            default:
                return "Back to Payments";
        }
    };

    const handleButtonClick = () => {
        if (status === "error") {
            navigate(-1);
        } else {
            navigate("/DriverPayment");
        }
    };

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className={`card shadow-lg border-3 ${getCardClass()}overflow-hidden`} style={{maxWidth: 560, margin: "0 auto"}}>
                            <div className="card-body p-5">
                                {/* Status Icon */}
                                <div className="text-center mb-4">
                                    {getStatusIcon()}
                                </div>


                                <div className="text-center mb-4">
                                    <h2 className="fw-bold mb-3">
                                        {status === "success" && "Payment Successful!"}
                                        {status === "error" && "Payment Failed"}
                                        {status === "processing" && "Processing Payment"}
                                        {status === "checking" && "Verifying Payment"}
                                    </h2>
                                    <p className="text-muted lead">{message}</p>
                                </div>


                                {paymentIntentId && (
                                    <div className="bg-light rounded p-3 mb-4">
                                        <small className="text-muted d-block mb-1">Transaction ID</small>
                                        <code className="small text-dark">{paymentIntentId}</code>
                                    </div>
                                )}


                                {status === "success" && (
                                    <div className="alert alert-success d-flex flex-wrap align-items-start mb-4 wrap-text" role="alert">
                                  <CheckCircle size={20} className="me-2 mt-1 flex-shrink-0" />
                                  <div className="flex-grow-1">
                                            <h6 className="alert-heading mb-1">Payment Confirmed</h6>
                                            <small className="mb-0">
                                                Your payment has been processed successfully. You should receive a confirmation email shortly.
                                            </small>
                                        </div>
                                    </div>
                                )}


                                {status === "processing" && (
                                    <div className="alert alert-warning d-flex flex-wrap align-items-start mb-4 wrap-text" role="alert">
                                        <Clock size={20} className="me-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <h6 className="alert-heading mb-1">Payment Processing</h6>
                                            <small className="mb-0">
                                                Your payment is being processed. This may take a few moments. Please don't close this page.
                                            </small>
                                        </div>
                                    </div>
                                )}


                                {status === "error" && (
                                    <div className="alert alert-danger d-flex flex-wrap align-items-start mb-4 wrap-text" role="alert">
                                        <XCircle size={20} className="me-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <h6 className="alert-heading mb-1">Payment Failed</h6>
                                            <small className="mb-0">
                                                Don't worry, you haven't been charged. Please try again with a different payment method.
                                            </small>
                                        </div>
                                    </div>
                                )}


                                <div className="d-grid gap-2">
                                    <button
                                        onClick={handleButtonClick}
                                        disabled={loading || status === "processing"}
                                        className={`btn ${getButtonClass()} btn-lg d-flex align-items-center justify-content-center`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowLeft size={16} className="me-2" />
                                                {getButtonText()}
                                            </>
                                        )}
                                    </button>

                                    {status !== "processing" && (
                                        <button
                                            onClick={() => navigate("/DriverPayment")} // Changed from /DriverPayment
                                            className="btn btn-outline-secondary"
                                        >
                                            Back to Payment Dashboard
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <small className="text-muted">
                                Need help? Contact support if you have any questions about your payment.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}