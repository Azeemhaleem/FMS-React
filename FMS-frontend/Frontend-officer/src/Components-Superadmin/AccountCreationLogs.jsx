import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./styles/driver-style.css"; // keep your global look

function AccountCreationLogs() {
  // ---- tabs ---------------------------------------------------------------
  const TABS = { ALL: "all", CREATED_BY: "created-by", CREATED_FOR: "created-for" };
  const [activeTab, setActiveTab] = useState(TABS.ALL);

  // ---- filters & data -----------------------------------------------------
  const [createdById, setCreatedById] = useState("");
  const [createdForId, setCreatedForId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error | ""

  const resetState = () => {
    setLogs([]);
    setMsg("");
    setMsgType("");
  };

  // ---- helpers ------------------------------------------------------------
  const fmt = (v) =>
    v ? new Date(v).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

  const badge = (text, tone = "primary") => (
    <span className={`badge bg-${tone}`} style={{ fontSize: "0.7rem" }}>
      {text}
    </span>
  );

  const hint = useMemo(() => {
    switch (activeTab) {
      case TABS.CREATED_BY:
        return "Enter the Police ID of the creator (e.g., 1011).";
      case TABS.CREATED_FOR:
        return "Enter the Police ID of the officer who received the account (e.g., 1012).";
      default:
        return "Showing the most recent account creation events.";
    }
  }, [activeTab]);

  // ---- fetcher ------------------------------------------------------------
  const fetchLogs = async () => {
    setLoading(true);
    setMsg("");
    setMsgType("");

    let endpoint = "";
    if (activeTab === TABS.ALL) {
      endpoint = "/get-logs/account-creation/all";
    } else if (activeTab === TABS.CREATED_BY && createdById.trim()) {
      endpoint = `/get-logs/account-creation/created-by/${createdById.trim()}`;
    } else if (activeTab === TABS.CREATED_FOR && createdForId.trim()) {
      endpoint = `/get-logs/account-creation/created-for/${createdForId.trim()}`;
    } else {
      setLoading(false);
      setMsg("Please enter a Police ID to search.");
      setMsgType("error");
      return;
    }

    try {
      const res = await api.get(endpoint);
      const payload = Array.isArray(res.data?.logs) ? res.data.logs : [];
      setLogs(payload);
      setMsg(payload.length ? "Logs fetched successfully." : "No logs found.");
      setMsgType(payload.length ? "success" : "error");
    } catch (err) {
      const m =
        err?.response?.data?.message ||
        err?.response?.data?.messege || // some controllers use this key
        "Failed to fetch logs.";
      setMsg(m);
      setMsgType("error");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // initial load for "All"
  useEffect(() => {
    resetState();
    if (activeTab === TABS.ALL) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---- render a log item safely (API shapes differ by route) --------------
  const LogCard = ({ item }) => {
    // ALL: { created_by: {police_id, police_name}, created_for: {..}, created_at }
    // CREATED_BY: { created_for: {..}, created_at }
    // CREATED_FOR: { created_by: {..}, created_at }
    const creator = item.created_by || null;
    const receiver = item.created_for || null;

    return (
      <div className="shadow-sm rounded-3 p-3 mb-3 mt-3" style={{ backgroundColor: "#233142" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div style={{ color: "#ECF0F1" }}>
            <strong >Created By:</strong>{" "}
            {creator ? (
              <>
                {creator.police_name || "Police Officer"} {creator.police_id}
              </>
            ) : (
              "—"
            )}
          </div>
          {badge("Account Created", "success")}
        </div>

        <div style={{ color: "#ECF0F1" }}>
          <strong>Created For:</strong>{" "}
          {receiver ? (
            <>
              {receiver.police_name || "Police Officer"} {receiver.police_id}
            </>
          ) : (
            "—"
          )}
        </div>

        <div className="mt-2" style={{ color: "#AAB7C4" }}>
          <strong>Date:</strong> {fmt(item.created_at)}
        </div>
      </div>
    );
  };

  // ---- UI -----------------------------------------------------------------
  return (
    <div
      className="container mb-5 w-75"
      style={{
        backgroundColor: "#d3e2fd",
        padding: "1rem",
        borderRadius: "1rem",
      }}
    >
      {/* Tabs */}
      <div className="d-flex flex-wrap justify-content-center gap-2 gap-md-3 my-4 px-5">
        <button
          className={`btn ${activeTab === TABS.ALL ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab(TABS.ALL)}
        >
          All Logs
        </button>
        <button
          className={`btn ${activeTab === TABS.CREATED_BY ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab(TABS.CREATED_BY)}
        >
          Created By
        </button>
        <button
          className={`btn ${activeTab === TABS.CREATED_FOR ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab(TABS.CREATED_FOR)}
        >
          Created For
        </button>
      </div>

      {/* Filter bar */}
      {activeTab !== TABS.ALL && (
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-7">
                <label className="form-label fw-semibold">
                  {activeTab === TABS.CREATED_BY ? "Creator Police ID" : "Receiver Police ID"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={activeTab === TABS.CREATED_BY ? "e.g., 1011" : "e.g., 1012"}
                  value={activeTab === TABS.CREATED_BY ? createdById : createdForId}
                  onChange={(e) =>
                    activeTab === TABS.CREATED_BY
                      ? setCreatedById(e.target.value)
                      : setCreatedForId(e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                />
                <div className="form-text">{hint}</div>
              </div>

              <div className="col-12 col-md-5 d-grid d-md-flex gap-2 justify-content-md-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setCreatedById("");
                    setCreatedForId("");
                    setLogs([]);
                    setMsg("");
                    setMsgType("");
                  }}
                >
                  Clear
                </button>
                <button className="btn btn-primary" onClick={fetchLogs} disabled={loading}>
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info / status */}
      {msg && (
        <div
          className={` small py-2 alert ${msgType === "success" ? "alert-success" : "alert-danger"} mb-3`}
          role="alert"
        >
          {msg}
        </div>
      )}

      {/* Results */}
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10 col-xxl-8">
          {loading ? (
            <div className="text-center py-4">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-muted">No logs to display.</div>
          ) : (
            logs.map((log, idx) => <LogCard key={`${log.created_at}-${idx}`} item={log} />)
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-muted mt-3" style={{ fontSize: ".85rem" }}>
        Logs reflect successful admin account creations. Timestamps are shown in your local time.
      </div>
    </div>
  );
}

export default AccountCreationLogs;
