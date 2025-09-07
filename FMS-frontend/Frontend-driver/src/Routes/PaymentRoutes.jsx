import React, { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CheckoutForm from "../stripe/CheckoutForm.jsx";
import Complete from "../stripe/Complete.jsx";
import '../stripe/PaymentRoutes.css'
import api from "../api/axios";

// Stripe publishable key
const stripePromise = loadStripe(import.meta.env.STRIPE_PUBLISHABLE_KEY);

const PaymentRoutes = () => {
  const clientSecretPromise = useMemo(() => {
    return fetch("/create.php", { method: "POST" })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const appearance = { theme: "stripe" };

  return (
    <div className="App">
      <Router>
      <CheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret: () => clientSecretPromise,
          elementsOptions: { appearance },
        }}
      >
        <Routes>
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/complete" element={<Complete />} />
        </Routes>
      </CheckoutProvider>
      </Router>
    </div>
    
  );
};

export default PaymentRoutes;
