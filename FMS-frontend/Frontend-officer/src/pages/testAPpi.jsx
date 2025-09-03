import React from 'react'
import { useEffect, useState } from "react";
import api from "../api/axios";

function testAPpi() {
    const [message, setMessage] = useState("");

    useEffect(() => {
      api.get("/test") // This should match a Laravel route
        .then((response) => {
          setMessage(response.data.message);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }, []);
  
    return <h1>Backend says: {message}</h1>;
}

export default testAPpi
