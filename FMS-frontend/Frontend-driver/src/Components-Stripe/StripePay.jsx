import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api/axios.jsx";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
    ExpressCheckoutElement
} from "@stripe/react-stripe-js";
import { CreditCard, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";


let stripePromise;
try {
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripePublishableKey) {
        throw new Error("Stripe publishable key is missing");
    }
    stripePromise = loadStripe(stripePublishableKey);
} catch (error) {
    console.error("Failed to load Stripe:", error);
}

export default function StripePay() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");


    const fineIds = useMemo(() => {
        let ids = location.state?.fineIds;
        if (!ids) {
            const q = new URLSearchParams(location.search).get("f");
            if (q) ids = q.split(",").map(n => {
                const num = Number(n);
                return isNaN(num) ? null : num;
            }).filter(id => id !== null);
        }
        return ids;
    }, [location.state, location.search]);

    const [clientSecret, setClientSecret] = useState(null);
    const [amount, setAmount] = useState(null);
    const [currency, setCurrency] = useState("usd");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {

        if (!token) {
            setError("Authentication required. Please log in.");
            setLoading(false);
            return;
        }

        if (!Array.isArray(fineIds) || fineIds.length === 0) {
            setError("No fines selected for payment");
            setLoading(false);
            return;
        }

        const createPaymentIntent = async () => {
            try {
                setError("");
                setLoading(true);

                const response = await api.post(
                    "/process-payment",
                    { fineIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const responseData = response.data || response;

                if (responseData.error) {
                    throw new Error(responseData.error);
                }

                if (!responseData.clientSecret) {
                    throw new Error("Invalid response from server");
                }

                setClientSecret(responseData.clientSecret);
                setAmount(responseData.amount);
                setCurrency(responseData.currency || "usd");
            } catch (err) {

                let errorMessage = err.response?.data?.message ||
                    err.message ||
                    "Failed to initialize payment";

                if (errorMessage.includes('automatic_payment_methods') &&
                    errorMessage.includes('confirmation_method')) {
                    errorMessage = "Payment system configuration error. Please contact support or try again later.";
                }

                if (err.response?.status === 400 && err.response?.data?.error) {
                    const stripeError = err.response.data.error;
                    if (stripeError.includes('automatic_payment_methods') &&
                        stripeError.includes('confirmation_method')) {
                        errorMessage = "Payment system configuration error. Please try again later.";
                    }
                }

                setError(errorMessage);

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                }

                if (errorMessage.includes('automatic_payment_methods') &&
                    errorMessage.includes('confirmation_method') &&
                    retryCount < 2) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 1000);
                }
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [token, fineIds, retryCount]);

    const stripeOptions = useMemo(() => {
        if (!clientSecret) return null;

        return {
            clientSecret,
            appearance: {
                theme: "stripe",
                variables: {
                    colorPrimary: "#0d6efd",
                    colorBackground: "#ffffff",
                    colorText: "#212529",
                    colorDanger: "#dc3545",
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    spacingUnit: "4px",
                    borderRadius: "6px"
                }
            }
        };
    }, [clientSecret]);

    const handleBackToPayments = () => {
        navigate("/DriverPayment", {
            state: {
                paymentInitiated: true,
                paymentStatus: error ? "failed" : "cancelled"
            }
        });
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Initializing payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
                <div className="card shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                            <AlertCircle className="text-danger me-2" size={24} />
                            <h5 className="card-title mb-0">Payment Error</h5>
                        </div>
                        <p className="card-text text-muted mb-4">{error}</p>
                        <button
                            onClick={handleBackToPayments}
                            className="btn btn-secondary w-100 d-flex align-items-center justify-content-center"
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Back to Payments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <AlertCircle className="text-danger mb-3" size={32} />
                    <p className="text-muted">Unable to initialize payment</p>
                    <button
                        onClick={handleBackToPayments}
                        className="btn btn-secondary mt-3 d-flex align-items-center justify-content-center mx-auto"
                    >
                        <ArrowLeft size={16} className="me-2" />
                        Back to Payments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8 col-xl-6">
                        <div className="card shadow-lg border-0">

                            <div className="card-header bg-primary text-white p-4 rounded-top d-flex flex-column">
                                <div className="d-flex align-items-center justify-content-center mb-3 mx-auto w-50">
                                    <CreditCard size={28} className="w-25 ms-1"/>
                                    <h4 className="mb-0">Complete Payment</h4>
                                </div>
                                {amount && (
                                    <div className="mt-3 p-3 bg-white bg-opacity-25 rounded">
                                        <small className="opacity-75 d-block">Total Amount</small>
                                        <h3 className="mb-0 fw-bold">
                                            {(amount / 100).toFixed(2)} {currency.toUpperCase()}
                                        </h3>
                                    </div>
                                )}
                            </div>


                            <div className="card-body p-4">
                                <Elements stripe={stripePromise} options={stripeOptions}>
                                    <CheckoutForm
                                        onSuccess={() => navigate("/payment/complete", {
                                            state: { amount, currency }
                                        })}
                                        onCancel={handleBackToPayments}
                                    />
                                </Elements>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <button
                                onClick={handleBackToPayments}
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center mx-auto"
                            >
                                <ArrowLeft size={16} className="" style={{width:"15%"}}/>
                                Back to Payment Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutForm({ onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);
    const [paymentElementReady, setPaymentElementReady] = useState(false);
    const [stripeError, setStripeError] = useState(null);

    const handleExpressCheckout = async (event) => {
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMessage("");

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/complete`
                },
                redirect: "if_required"
            });

            if (error) {
                setMessage(error.message || "Payment failed");
            } else {
                onSuccess();
            }
        } catch (err) {
            setMessage("An unexpected error occurred during payment");
            console.error("Express checkout error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setMessage("Payment system has not loaded yet. Please try again.");
            return;
        }

        setIsProcessing(true);
        setMessage("");

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/complete`
                },
                redirect: "if_required"
            });

            if (error) {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                onSuccess();
            }
        } catch (err) {
            setMessage("An unexpected error occurred during payment");
            console.error("Payment error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Fallback if elements don't load within a reasonable time
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!expressCheckoutReady || !paymentElementReady) {
                console.warn("Stripe elements taking too long to load");
                // Force ready state to prevent infinite loading
                setExpressCheckoutReady(true);
                setPaymentElementReady(true);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {/* Express Checkout - Only show if no errors */}
            {!stripeError && (
                <div className="mb-4">
                    <h5 className="mb-3">Quick Payment</h5>
                    <div className="border rounded p-3 bg-light position-relative" style={{ minHeight: "50px" }}>
                        <ExpressCheckoutElement
                            onConfirm={handleExpressCheckout}
                            onReady={() => {
                                console.log("Express checkout ready");
                                setExpressCheckoutReady(true);
                            }}
                            onCancel={onCancel}
                            onError={(error) => {
                                console.error("ExpressCheckoutElement error:", error);
                                setStripeError(error);
                                setExpressCheckoutReady(true); // Set ready to hide loading
                            }}
                            options={{
                                // Use valid button types according to Stripe documentation
                                buttonType: {
                                    googlePay: "buy",
                                    applePay: "buy"
                                }
                            }}
                        />
                        {!expressCheckoutReady && (
                            <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="text-muted">Loading express payment options...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Show error message if ExpressCheckout failed */}
            {stripeError && (
                <div className="alert alert-warning mb-4">
                    <AlertCircle size={20} className="me-2" />
                    Express payment options are temporarily unavailable. Please use card payment below.
                </div>
            )}

            {/* Divider */}
            <div className="position-relative mb-4">
                <hr className="my-4" />
                <span className="position-absolute top-0 start-50 translate-middle-x bg-white px-3 text-muted small">
                    Or pay with card
                </span>
            </div>

            {/* Card Payment Form */}
            <form onSubmit={handleSubmit}>
                <div className="mb-4 mt-1">
                    <h5 className="mb-3">Card Details</h5>
                    <div className="border rounded p-3 bg-white position-relative" style={{ minHeight: "100px" }}>
                        <PaymentElement
                            id="payment-element"
                            onReady={() => {
                                console.log("Payment element ready");
                                setPaymentElementReady(true);
                            }}
                            options={{
                                layout: "tabs"
                            }}
                        />
                        {!paymentElementReady && (
                            <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="text-muted">Loading payment form...</span>
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                        <div className="d-flex w-50 mx-auto">
                            <AlertCircle size={20} className="flex-shrink-0 w-25" />
                            <div className="">{message}</div>
                        </div>
                    </div>
                )}

                <div className="d-grid gap-2">
                    <button
                        type="submit"
                        disabled={!stripe || !elements || isProcessing || !paymentElementReady}
                        className="btn btn-primary btn-lg py-3 d-flex align-items-center justify-content-center"
                    >
                        {isProcessing ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Processing...</span>
                                </div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={24} className="" style={{width:"12%"}}/>
                                Pay Now
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="btn btn-outline-secondary"
                    >
                        Cancel Payment
                    </button>
                </div>
            </form>

            {/* Security Notice */}
            <div className="text-center mt-4 pt-3 border-top">
                <small className="text-muted">
                    <CheckCircle size={16} className="me-1 align-text-bottom" />
                    Your payment information is secure and encrypted
                </small>
            </div>
        </div>
    );
}