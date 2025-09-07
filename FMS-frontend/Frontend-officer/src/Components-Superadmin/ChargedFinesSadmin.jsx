import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

// If you use FontAwesome, you can re-enable later.
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function ChargedFinesSadmin() {
  // Backend endpoints (unchanged)
  const PDF_ENDPOINT = "s-admin/generate-pdf";
  const GET_FINES_BY_POLICE = "get-charged-fines/traffic-police/by-police-id";
  const FIND_POLICE_BY_FINE = "get-traffic-police-id/by-charged-fine-id";
  const GET_ALL_FINES = "s-admin/get-all-fines";

  // Tabs
  const TABS = { FINES_BY_POLICE: "finesByPolice", POLICE_BY_FINE: "policeByFine" };
  const [activeTab, setActiveTab] = useState(TABS.FINES_BY_POLICE);

  // Catalog (fine_id -> fine_name)
  const [finesCatalog, setFinesCatalog] = useState([]);
  const fineNameById = useMemo(() => {
    const m = new Map();
    (finesCatalog || []).forEach((f) => {
      if (f && f.id != null) m.set(String(f.id), f.name);
    });
    return m;
  }, [finesCatalog]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(GET_ALL_FINES);
        if (mounted) setFinesCatalog(res.data?.fines || []);
      } catch {
        // ignore; we'll just show IDs
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ===== Left tab: Charged fines by Traffic Police ID
  const [policeId, setPoliceId] = useState("");
  const [fines, setFines] = useState([]);
  const [loadingPolice, setLoadingPolice] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [policeMsg, setPoliceMsg] = useState("");
  const [policeMsgType, setPoliceMsgType] = useState(""); // success | error

  const fetchChargedFines = async () => {
    const id = policeId.trim();
    if (!id) {
      setPoliceMsg("Please enter a Traffic Police ID (e.g., 1011).");
      setPoliceMsgType("error");
      return;
    }
    setLoadingPolice(true);
    setPoliceMsg("");
    setFines([]);
    try {
      const res = await api.post(GET_FINES_BY_POLICE, { traffic_police_id: id });
      const list = res.data?.chargedFines || [];
      if (!list.length) {
        setPoliceMsg("No charged fines found for this Traffic Police ID.");
        setPoliceMsgType("error");
      } else {
        setFines(list);
        setPoliceMsg(res.data.message || "Charged fines fetched successfully.");
        setPoliceMsgType("success");
      }
    } catch (e) {
      setPoliceMsg(e?.response?.data?.message || "Error fetching charged fines.");
      setPoliceMsgType("error");
    } finally {
      setLoadingPolice(false);
    }
  };

  const downloadFinesPDF = async () => {
    const id = policeId.trim();
    if (!id) {
      setPoliceMsg("Enter a Traffic Police ID first.");
      setPoliceMsgType("error");
      return;
    }
    setPdfDownloading(true);
    setPoliceMsg("");
    try {
      const resp = await api.get(PDF_ENDPOINT, {
        params: { police_id: id },
        responseType: "blob",
      });

      let filename = `charged_fines_by_${id}.pdf`;
      const dispo = resp.headers?.["content-disposition"];
      const match = dispo && dispo.match(/filename="?([^"]+)"?/i);
      if (match?.[1]) filename = match[1];

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setPoliceMsg("PDF downloaded.");
      setPoliceMsgType("success");
    } catch (e) {
      setPoliceMsg(e?.response?.data?.message || e.message || "Failed to download PDF.");
      setPoliceMsgType("error");
    } finally {
      setPdfDownloading(false);
    }
  };

  // ===== Right tab: Traffic Police by Charged Fine ID
  const [fineId, setFineId] = useState("");
  const [foundPoliceId, setFoundPoliceId] = useState("");
  const [loadingFine, setLoadingFine] = useState(false);
  const [fineMsg, setFineMsg] = useState("");
  const [fineMsgType, setFineMsgType] = useState("");

  const findTrafficPolice = async () => {
    const id = fineId.trim();
    if (!id) {
      setFineMsg("Please enter a Charged Fine ID (numeric).");
      setFineMsgType("error");
      return;
    }
    setLoadingFine(true);
    setFineMsg("");
    setFoundPoliceId("");
    try {
      const res = await api.post(FIND_POLICE_BY_FINE, { fine_id: id });
      if (res.data?.policeId) {
        setFoundPoliceId(res.data.policeId);
        setFineMsg(res.data.message || "Traffic police fetched successfully.");
        setFineMsgType("success");
      } else {
        setFineMsg("No traffic police found for this Charged Fine ID.");
        setFineMsgType("error");
      }
    } catch (e) {
      setFineMsg(e?.response?.data?.message || "Error fetching police ID.");
      setFineMsgType("error");
    } finally {
      setLoadingFine(false);
    }
  };

  // Small helper for status badges
  const Badge = ({ children, variant = "secondary" }) => (
    <span className={`badge bg-${variant}`} style={{ fontSize: "0.75rem" }}>
      {children}
    </span>
  );
  const isPaid = (f) => Boolean(f?.paid_at);
  const isExpired = (f) => f?.expires_at && new Date(f.expires_at) < new Date();
  const isDeleted = (f) => Boolean(f?.deleted_at);

  // --- UI
  return (
    <div
      className="container mb-5 mt-5 p-5"
      style={{ backgroundColor: "#d3e2fd", padding: "1rem", borderRadius: "1rem" }}
    >
      {/* Toggle */}
      <div className="d-flex justify-content-center mb-3">
        <div className="btn-group gap-2 w-75 mb-5 mt-4">
          <button
            className={`btn ${activeTab === TABS.FINES_BY_POLICE ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab(TABS.FINES_BY_POLICE)}
          >
            Find Charged Fines
          </button>
          <button
            className={`btn ${activeTab === TABS.POLICE_BY_FINE ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab(TABS.POLICE_BY_FINE)}
          >
            Find Traffic Police
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card shadow-sm mb-4 ">
        <div className="card-body m-3">
          {activeTab === TABS.FINES_BY_POLICE ? (
            <>
              <h5 className="card-title text-primary text-center mb-3">Find Charged Fines</h5>

              <label className="form-label fw-semibold mb-4">Traffic Police ID</label>
              <div className="d-flex flex-column flex-md-row align-items-stretch mb-2">
                <input
                  type="text"
                  className="form-control me-md-2 mb-2 mb-md-0"
                  placeholder="e.g., 1011"
                  value={policeId}
                  onChange={(e) => setPoliceId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchChargedFines()}
                />


                <button
                  className="btn btn-outline-info w-25"
                  onClick={downloadFinesPDF}
                  disabled={pdfDownloading || !policeId.trim()}
                >
                  {pdfDownloading ? "Downloading…" : "Download PDF"}
                </button>
              </div>
              <div className="text-muted mb-3" style={{ fontSize: ".9rem", marginTop: "-2px" }}>
                Enter the <strong>Traffic Police ID</strong> from police records (not username/email).
              </div>

              {policeMsg && (
                <div className={`alert mt-3 w-75 ${policeMsgType === "success" ? "alert-success" : "alert-danger"}`}>
                  {policeMsg}
                </div>
              )}

              {fines.length > 0 && (
                <div className="table-responsive mt-3">
                  <table className="m-0 w-100 table table-small align-middle" >
                    <thead>
                      <tr>
                        <th>Charged Fine ID</th>
                        <th className="w-25">Fine</th>
                        <th>Driver User ID</th>
                        <th className="w-25">Issued At</th>
                        <th >Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fines.map((f) => (
                        <tr key={f.id}>
                          <td>{f.id}</td>
                          <td>{fineNameById.get(String(f.fine_id)) ?? `#${f.fine_id}`}</td>
                          <td>{f.driver_user_id}</td>
                          <td>{f.issued_at ?? "—"}</td>
                          <td>
                            {isDeleted(f) && <Badge>Deleted</Badge>}{" "}
                            {isPaid(f) ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Unpaid</Badge>}{" "}
                            {isExpired(f) && <Badge variant="danger">Expired</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-muted" style={{ fontSize: ".85rem" }}>
                    <em>Tip:</em> For a report with license numbers, use <strong>Download PDF</strong>.
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h5 className="card-title text-primary text-center mb-3">Find Traffic Police</h5>

              <label className="form-label fw-semibold mb-4">Charged Fine ID</label>
              <div className="d-flex flex-column flex-md-row align-items-stretch mb-2">
                <input
                  type="number"
                  className="form-control me-md-2 mb-2 mb-md-0"
                  placeholder="e.g., 245 (numeric)"
                  value={fineId}
                  onChange={(e) => setFineId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findTrafficPolice()}
                />
                
              </div>
              <div className="text-muted mb-3" style={{ fontSize: ".9rem", marginTop: "-2px" }}>
                Enter the <strong>Charged Fine ID</strong> (auto-generated numeric ID).
              </div>

              {fineMsg && (
                <div className={`alert mt-3 ${fineMsgType === "success" ? "alert-success" : "alert-danger"}`}>
                  {fineMsg}
                </div>
              )}

              {foundPoliceId && (
                <p className="mt-2">
                  <strong>Traffic Police ID:</strong> {foundPoliceId}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
