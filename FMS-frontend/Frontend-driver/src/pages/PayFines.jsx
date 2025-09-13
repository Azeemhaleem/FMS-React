// NEW: a dedicated page to confirm the PaymentIntent client-side
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import api from "../api/axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const onPay = async () => {
    if (!stripe || !elements) return;
    setErr("");
    setSubmitting(true);

    // CHANGED: client-side confirmation only
    const { error } = await stripe.confirmPayment({ elements });
    setSubmitting(false);

    if (error) {
      setErr(error.message || "Payment failed. Please try again.");
      return;
    }
    // success — let webhook update DB, then go back or show receipt page
    navigate("/DriverMyFines"); // or your desired success route
  };

  return (
    <div className="card p-3">
      {err && <div className="alert alert-danger">{err}</div>}
      <PaymentElement />
      <button className="btn btn-primary mt-3" onClick={onPay} disabled={!stripe || submitting}>
        {submitting ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}

export default function PayFinesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fineIds = useMemo(() => location?.state?.fineIds ?? [], [location?.state]);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!Array.isArray(fineIds) || fineIds.length === 0) {
      navigate("/DriverPayment"); // fallback
      return;
    }

    // CHANGED: call create-only endpoint to get clientSecret
    (async () => {
      try {
        const res = await api.post(
          "/process-payment",
          { fineIds },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setClientSecret(res?.data?.clientSecret || "");
      } catch (e) {
        console.error(e);
        alert("Failed to start payment. Please try again.");
        navigate("/DriverPayment");
      }
    })();
  }, [token, fineIds, navigate]);

  if (!clientSecret) return <div className="container my-4">Loading payment…</div>;

  return (
    <div className="container my-4">
      <h4 className="fw-bold mb-3">Pay fines</h4>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </div>
  );
}
