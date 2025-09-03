import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./styles/driver-style.css";
import api from "../api/axios";

function ChargedFinesSadmin() {
  const PDF_ENDPOINT = "s-admin/generate-pdf";

  const [loadingPolice, setLoadingPolice] = useState(false);
  const [loadingFine, setLoadingFine] = useState(false);

  const [policeId, setPoliceId] = useState("");
  const [fines, setFines] = useState([]);
  const [policeMsg, setPoliceMsg] = useState("");
  const [policeMsgType, setPoliceMsgType] = useState(""); // 'success' | 'error'

  const [fineId, setFineId] = useState("");
  const [foundPoliceId, setFoundPoliceId] = useState("");
  const [fineMsg, setFineMsg] = useState("");
  const [fineMsgType, setFineMsgType] = useState(""); // 'success' | 'error'

  // NEW: PDF downloading state
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const fetchChargedFines = async () => {
    setLoadingPolice(true);
    setFines([]);
    setPoliceMsg("");
    try {
      const response = await api.post(
          "get-charged-fines/traffic-police/by-police-id",
          {
            traffic_police_id: policeId,
          }
      );

      if (response?.data?.chargedFines?.length > 0) {
        setFines(response.data.chargedFines);
        setPoliceMsg(response.data.message || "Fines fetched successfully.");
        setPoliceMsgType("success");
      } else {
        setPoliceMsg("No fines found for this Police ID.");
        setPoliceMsgType("error");
      }
    } catch (error) {
      setPoliceMsg(error.response?.data?.message || "Error fetching fines");
      setPoliceMsgType("error");
      setFines([]);
    } finally {
      setLoadingPolice(false);
    }
  };

  const findTrafficPolice = async () => {
    setLoadingFine(true);
    setFoundPoliceId("");
    setFineMsg("");
    try {
      const response = await api.post(
          "get-traffic-police-id/by-charged-fine-id",
          {
            fine_id: fineId,
          }
      );

      if (response?.data?.policeId) {
        setFoundPoliceId(response.data.policeId);
        setFineMsg(response.data.message || "Police ID found.");
        setFineMsgType("success");
      } else {
        setFineMsg("No police found for this Fine ID.");
        setFineMsgType("error");
      }
    } catch (error) {
      setFineMsg(error.response?.data?.message || "Error fetching police ID");
      setFineMsgType("error");
      setFoundPoliceId("");
    } finally {
      setLoadingFine(false);
    }
  };


  const downloadFinesPDF = async () => {
    if (!policeId) {
      setPoliceMsg("Enter a Police ID first.");
      setPoliceMsgType("error");
      return;
    }
    setPdfDownloading(true);
    setPoliceMsg("");

    try {
      const resp = await api.get(PDF_ENDPOINT, {
        params: { police_id: policeId },   // <-- GET with query param
        responseType: "blob",              // <-- required for PDF
      });

      // filename from Content-Disposition if available
      let filename = `charged_fines_by_${policeId}.pdf`;
      const dispo = resp.headers?.["content-disposition"];
      if (dispo) {
        const match = dispo.match(/filename="?([^"]+)"?/i);
        if (match?.[1]) filename = match[1];
      }

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setPoliceMsg("PDF downloaded.");
      setPoliceMsgType("success");
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed to download PDF";
      setPoliceMsg(msg);
      setPoliceMsgType("error");
    } finally {
      setPdfDownloading(false);
    }
  };


  return (
      <div
          className="search-section d-flex container mb-5 justify-content-center align-items-center "
          style={{
            backgroundColor: "#d3e2fd",
            padding: "1rem",
            marginLeft: window.innerWidth < 576 ? "3rem" : "2rem",
          }}
      >
        <div className="container-fluid py-4 px-1 px-md-5">
          <div className="row" style={{ paddingLeft: "20px" }}>
            {/* Find Charged Fines */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary mb-4 mt-2 text-center">
                    Find Charged Fines
                  </h5>

                  <div className="d-flex flex-column flex-md-row align-items-stretch mb-4">
                    <input
                        type="text"
                        className="w-100 p-2 mb-2 border rounded"
                        value={policeId}
                        placeholder="Traffic Police ID"
                        onChange={(e) => setPoliceId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchChargedFines()}
                    />

                    {/* Search (desktop) */}
                    <button
                        className="btn btn d-none d-md-block"
                        type="button"
                        onClick={fetchChargedFines}
                        disabled={loadingPolice}
                        style={{ width: "10%", color: "#0dcaf0", marginLeft: "3px" }}
                        title="Search"
                    >
                      {loadingPolice ? "..." : <FontAwesomeIcon icon={faSearch} />}
                    </button>

                    {/* Download PDF (desktop) */}
                    <button
                        className="btn btn d-none d-md-block"
                        type="button"
                        onClick={downloadFinesPDF}
                        disabled={pdfDownloading || !policeId}
                        style={{ width: "18%", color: "#0dcaf0", marginLeft: "3px" }}
                        title="Download PDF"
                    >
                      {pdfDownloading ? "Downloading…" : "PDF"}
                    </button>
                  </div>

                  {/* Download PDF (mobile full width) */}
                  <div className="d-md-none d-grid gap-2 mb-3">
                    <button
                        className="btn btn-outline-info"
                        type="button"
                        onClick={downloadFinesPDF}
                        disabled={pdfDownloading || !policeId}
                    >
                      {pdfDownloading ? "Downloading…" : "PDF"}
                    </button>
                  </div>

                  <div className="responsive-container">
                    {policeMsg && (
                        <div
                            className={`alert ${
                                policeMsgType === "success" ? "alert-success" : "alert-danger"
                            }`}
                            role="alert"
                        >
                          {policeMsg}
                        </div>
                    )}

                    {fines.length > 0 && (
                        <ul className="list-group mt-3">
                          {fines.map((fine) => (
                              <li
                                  key={fine.id}
                                  className="list-group-item d-flex justify-content-between"
                              >
                          <span>
                            <strong>Fine ID:</strong> {fine.id}
                          </span>
                                <span>
                            <strong>Driver ID:</strong> {fine.driver_user_id}
                          </span>
                              </li>
                          ))}
                        </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Find Traffic Police */}
            <div className="col-12 col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary mb-4 mt-2 text-center">
                    Find Traffic Police
                  </h5>

                  <div className="d-flex flex-column flex-md-row align-items-stretch mb-4">
                    <input
                        type="text"
                        className="w-100 p-2 mb-2 border rounded"
                        value={fineId}
                        placeholder="Charged Fine ID"
                        onChange={(e) => setFineId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && findTrafficPolice()}
                    />
                    <button
                        className="btn btn d-none d-md-block"
                        type="button"
                        onClick={findTrafficPolice}
                        disabled={loadingFine}
                        style={{ width: "10%", color: "#0dcaf0", marginLeft: "3px" }}
                        title="Search"
                    >
                      {loadingFine ? "..." : <FontAwesomeIcon icon={faSearch} />}
                    </button>
                  </div>

                  <div className="responsive-container">
                    {fineMsg && (
                        <div
                            className={`alert ${
                                fineMsgType === "success" ? "alert-success" : "alert-danger"
                            }`}
                            role="alert"
                        >
                          {fineMsg}
                        </div>
                    )}

                    {foundPoliceId && (
                        <p>
                          <strong>Police ID:</strong> {foundPoliceId}
                        </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* end right col */}
          </div>
        </div>
      </div>
  );
}

export default ChargedFinesSadmin;