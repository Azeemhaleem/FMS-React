import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faEye, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";

// ===== DEMO TOGGLE =====
// Use .env (Vite): VITE_FMS_DEMO=true/false, or hardcode to true for local demo.
const DEMO = ((import.meta?.env?.VITE_FMS_DEMO ?? "false") === "true") || false;

/** -------------------- Helpers -------------------- **/
const pickName = (o) => o?.name || o?.username || (o?.email ? o.email.split("@")[0] : `PU${o?.id}`);
const statusBadge = (s) =>
  s === true ? <Badge bg="success">Active</Badge> : s === false ? <Badge bg="danger">Inactive</Badge> : <Badge bg="secondary">—</Badge>;

/** Normalize a server officer (PoliceUser) into a minimal view model */
const mapOfficer = (o) => ({
  id: o?.id ?? null,
  name: pickName(o),
  // Some APIs might embed status here; we still fetch via status endpoint as source of truth
  in_service: o?.in_service ?? o?.trafficPolice?.in_service ?? undefined,
  service_region: o?.service_region ?? o?.trafficPolice?.service_region ?? undefined,
});

/** -------------------- DEMO data -------------------- **/
const MOCK_OFFICERS = [
  { id: 101, name: "Officer A", in_service: true, service_region: "Colombo Central" },
  { id: 102, name: "Officer B", in_service: false, service_region: null },
  { id: 103, name: "Officer C", in_service: true, service_region: "Kandy City" },
  { id: 104, name: "Officer D", in_service: true, service_region: "Galle Fort" },
  { id: 105, name: "Officer E", in_service: false, service_region: null },
  { id: 106, name: "Officer F", in_service: true, service_region: "Jaffna Town" },
];

/** -------------------- Component -------------------- **/
export default function ManageTrafficOfficers() {
  const [officers, setOfficers] = useState([]); // mapped list
  const [statusById, setStatusById] = useState({}); // { [id]: { in_service, service_region } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState({ type: null, item: null, busy: false, region: "" });
  const [toast, setToast] = useState({ show: false, variant: "success", message: "" });
  const debounceRef = useRef();

  /** Fetch officers, then (when not in demo) fetch status per officer */
  const load = async (signal) => {
    setLoading(true);
    setError("");
    try {
      if (DEMO) {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 250));
        const mapped = MOCK_OFFICERS.map(mapOfficer);
        setOfficers(mapped);
        // Seed status map from mock
        const seed = {};
        for (const o of mapped) seed[o.id] = { in_service: o.in_service, service_region: o.service_region ?? null };
        setStatusById(seed);
      } else {
        const res = await api.get("get-assigned-traffic-officers", { signal });
        const list = Array.isArray(res.data?.trafficOfficers) ? res.data.trafficOfficers : [];
        const mapped = list.map(mapOfficer);
        setOfficers(mapped);

        // Fetch each officer's service status (required because base endpoint does not include it)
        const pairs = await Promise.allSettled(
          mapped.map((o) =>
            api
              .post("get-traffic-officer-service-status", { police_user_id: o.id }, { signal })
              .then((r) => [o.id, { in_service: !!r.data?.status, service_region: o.service_region ?? null }])
          )
        );
        const status = {};
        for (const p of pairs) {
          if (p.status === "fulfilled" && Array.isArray(p.value)) {
            const [id, obj] = p.value;
            status[id] = obj;
          }
        }
        setStatusById((prev) => ({ ...prev, ...status }));
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load officers.");
      // fallback: show empty (or you could seed demo here)
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  /** Derived rows with search & status filter */
  const withStatus = useMemo(
    () =>
      officers.map((o) => ({
        ...o,
        in_service: statusById[o.id]?.in_service ?? o.in_service,
        service_region: statusById[o.id]?.service_region ?? o.service_region,
      })),
    [officers, statusById]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return withStatus.filter((o) => {
      const matchesSearch = !s || [o.name, String(o.id)].join(" ").toLowerCase().includes(s);
      const st = o.in_service === true ? "active" : o.in_service === false ? "inactive" : "all";
      const matchesStatus = filterStatus === "all" || st === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [withStatus, q, filterStatus]);

  /** Actions */
  const doToggle = async () => {
    if (!confirm?.item?.id || !confirm.type) return;
    setConfirm((c) => ({ ...c, busy: true }));
    const id = confirm.item.id;

    try {
      if (DEMO) {
        // Simulate backend
        await new Promise((r) => setTimeout(r, 350));
        const goingActive = confirm.type === "activate";
        setStatusById((prev) => ({ ...prev, [id]: { in_service: goingActive, service_region: goingActive ? confirm.region || "Unspecified" : null } }));
        setToast({ show: true, variant: goingActive ? "success" : "warning", message: goingActive ? "Officer activated (demo)." : "Officer deactivated (demo)." });
      } else {
        if (confirm.type === "activate") {
          await api.put("activate-traffic-officer", { police_user_id: id, service_region: confirm.region || "Unspecified" });
          setToast({ show: true, variant: "success", message: "Officer activated." });
          setStatusById((prev) => ({ ...prev, [id]: { in_service: true, service_region: confirm.region || "Unspecified" } }));
        } else {
          await api.put("deactivate-traffic-officer", { police_user_id: id });
          setToast({ show: true, variant: "warning", message: "Officer deactivated." });
          setStatusById((prev) => ({ ...prev, [id]: { in_service: false, service_region: null } }));
        }
      }
      setConfirm({ type: null, item: null, busy: false, region: "" });
    } catch (e) {
      setToast({
        show: true,
        variant: "danger",
        message:
          e?.response?.data?.message ||
          (confirm.type === "activate" ? "Failed to activate officer." : "Failed to deactivate officer."),
      });
      setConfirm((c) => ({ ...c, busy: false }));
    }
  };

  /** UI */
  return (
    <Container className="py-4" style={{ backgroundColor: "#d3e2fd", minHeight: "100%" }}>
      {/* Header */}
      <Row className="align-items-center mb-5">
        <Col md={10} className="mx-auto d-flex align-items-center gap-3">
          <h3 className="fw-bold mb-0">Traffic Officers</h3>
          <Badge bg="secondary" className="w-50">{filtered.length} shown</Badge>
          {DEMO && <Badge bg="info">DEMO</Badge>}
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-5">
        <Col md={10} className="mx-auto d-flex gap-2 align-items-center">
          <InputGroup>
           <Form.Control
              placeholder="Search by name or ID"
              onChange={(e) => {
                const val = e.target.value;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => setQ(val), 250);
              }}
            />
          </InputGroup>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ maxWidth: 150, fontSize:"0.9rem" }}
            aria-label="Status filter"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </Col>
      </Row>

      
      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center" style={{ maxWidth: 250,marginLeft:"10%" }}>
          {error} <Button  size="sm" className="w-25" variant="outline-light" onClick={() => load()}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted py-5">No officers match your filters.</div>
      ) : (
        <Row className="g-3 mx-auto" style={{ maxWidth: 1200 }}>
          {filtered.map((o) => {
            const st = statusById[o.id]?.in_service ?? o.in_service; // true/false/undefined
            const region = statusById[o.id]?.service_region ?? o.service_region ?? "—";
            const canActivate = st === false || st === undefined;
            const canDeactivate = st === true;

            return (
              <Col key={o.id} xs={12} sm={6} md={6} lg={4} xl={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faUser} />
                      <Card.Title className="mb-0 fs-5 text-truncate" title={o.name}>
                        {o.name}
                      </Card.Title>
                    </div>
                    <div className="text-muted">ID: <span className="font-monospace">PU{o.id}</span></div>
                    <div className="mt-2">
                      Status: {statusBadge(st)}{region && st ? <span className="ms-2 small text-muted">• {region}</span> : null}
                    </div>

                    <div className="mt-auto d-flex flex-wrap gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setDetail({ ...o, in_service: st, service_region: region })}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant={canActivate ? "success" : "outline-success"}
                        disabled={!canActivate}
                        onClick={() =>
                          setConfirm({ type: "activate", item: o, busy: false, region: "" })
                        }
                      >
                        <FontAwesomeIcon icon={faToggleOn} className="me-1" />
                        Activate
                      </Button>

                      <Button
                        size="sm"
                        variant={canDeactivate ? "danger" : "outline-danger"}
                        disabled={!canDeactivate}
                        onClick={() => setConfirm({ type: "deactivate", item: o, busy: false, region: "" })}
                      >
                        <FontAwesomeIcon icon={faToggleOff} className="me-1" />
                        Deactivate
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Detail modal */}
      <Modal show={!!detail} onHide={() => setDetail(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Officer details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail && (
            <>
              <div className="mb-2"><strong>Name:</strong> {detail.name}</div>
              <div className="mb-2"><strong>User ID:</strong> <span className="font-monospace">PU{detail.id}</span></div>
              <div className="mb-2">
                <strong>Status:</strong> {statusBadge(detail.in_service)}{" "}
                {detail.in_service && detail.service_region ? <span className="text-muted small ms-1">({detail.service_region})</span> : null}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm / Activate-Deactivate */}
      <Modal
        show={!!confirm.type}
        onHide={() => !confirm.busy && setConfirm({ type: null, item: null, busy: false, region: "" })}
        centered
      >
        <Modal.Header closeButton={!confirm.busy}>
          <Modal.Title>
            {confirm.type === "activate" ? "Activate officer" : "Deactivate officer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirm.item && (
            <>
              <p className="mb-2">
                Are you sure you want to{" "}
                <strong>{confirm.type === "activate" ? "activate" : "deactivate"}</strong>{" "}
                <span className="font-monospace">PU{confirm.item.id}</span> ({confirm.item.name})?
              </p>

              {confirm.type === "activate" && (
                <>
                  <Form.Label className="fw-semibold">Service region (required)</Form.Label>
                  <Form.Control
                    placeholder="e.g., Colombo Central"
                    value={confirm.region}
                    onChange={(e) => setConfirm((c) => ({ ...c, region: e.target.value }))}
                  />
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={confirm.busy}
            onClick={() => setConfirm({ type: null, item: null, busy: false, region: "" })}
          >
            Cancel
          </Button>
          <Button
            variant={confirm.type === "activate" ? "success" : "danger"}
            disabled={
              confirm.busy || (confirm.type === "activate" && !confirm.region.trim())
            }
            onClick={doToggle}
          >
            {confirm.busy ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing…
              </>
            ) : confirm.type === "activate" ? (
              "Activate"
            ) : (
              "Deactivate"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toasts */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          delay={2600}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
