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
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

// ======= DEMO TOGGLE =======
const DEMO = ((import.meta?.env?.VITE_FMS_DEMO ?? "false") === "true") || false;

// ---------- helpers ----------
const mapFine = (f) => {
  const fine = f?.fine ?? {};
  const driver = f?.driver_user ?? f?.driverUser ?? {};
  const officer = f?.police_user ?? f?.policeUser ?? {};

  const amount = fine?.amount ?? f?.amount ?? 0;
  const isPaid = !!f?.paid_at;
  const isExpired = f?.expires_at ? new Date(f.expires_at) < new Date() : false;

  return {
    id: f?.id ?? f?.fine_id ?? null,
    driverName: driver?.name ?? driver?.username ?? "—",
    officerName: officer?.name ?? officer?.username ?? "—",
    offense: fine?.offense ?? fine?.title ?? fine?.name ?? "—",
    amount,
    issuedAt: f?.issued_at ?? null,
    isPaid,
    isExpired,
    deleteReason: f?.delete_request?.reason ?? f?.reason ?? null,
    _raw: f,
  };
};

const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const asLKR = (v) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(
    Number(v || 0)
  );

// ---------- dummy data ----------
const mockFinesFromServer = [
  {
    id: 501,
    issued_at: "2025-08-25T08:00:00Z",
    paid_at: null,
    expires_at: "2025-09-25T08:00:00Z",
    pending_delete: true,
    fine: { offense: "Speeding (over 60 km/h)", amount: 500 },
    driver_user: { name: "driver1" },
    police_user: { name: "Officer1" },
    delete_request: { reason: "Duplicate ticket due to device glitch" },
  },
  {
    id: 502,
    issued_at: "2025-08-23T18:20:00Z",
    paid_at: "2025-08-24T10:00:00Z",
    expires_at: "2025-09-23T18:20:00Z",
    pending_delete: true,
    fine: { offense: "Illegal Parking", amount: 250 },
    driver_user: { name: "driver2" },
    police_user: { name: "Officer2" },
  },
  {
    id: 503,
    issued_at: "2025-08-20T09:30:00Z",
    paid_at: null,
    expires_at: "2025-08-21T09:30:00Z",
    pending_delete: true,
    fine: { offense: "No Helmet", amount: 300 },
    driver_user: { name: "driver3" },
    police_user: { name: "Officer3" },
  },
];

export default function ManageChargedFines() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState({ type: null, item: null, busy: false, note: "" });
  const [toast, setToast] = useState({ show: false, variant: "success", message: "" });

  const debounceRef = useRef();

  const loadData = async (signal) => {
    setLoading(true);
    setError("");
    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 300));
        const flat = mockFinesFromServer.map(mapFine).sort((a, b) => (a.issuedAt > b.issuedAt ? -1 : 1));
        setRows(flat);
      } else {
        const res = await api.get("h-police/get-all-fines-to-delete", { signal });
        const list = Array.isArray(res.data?.finesToDelete) ? res.data.finesToDelete : [];
        const flat = list.map(mapFine).sort((a, b) => (a.issuedAt > b.issuedAt ? -1 : 1));
        setRows(flat);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load fine deletion requests.");
      setRows([]);
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    loadData(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const onSearchChange = (val) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 300);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.driverName, r.officerName, r.offense, String(r.id || "")]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [q, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const removeRow = (id) => setRows((p) => p.filter((x) => x.id !== id));

  const performDecision = async () => {
    if (!confirm?.item?.id || !confirm.type) return;
    setConfirm((c) => ({ ...c, busy: true }));
    const id = confirm.item.id;

    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 400));
        if (confirm.type === "approve") {
          setToast({ show: true, variant: "success", message: "Fine deletion approved (demo)." });
        } else {
          setToast({ show: true, variant: "warning", message: "Fine deletion declined (demo)." });
        }
      } else {
        if (confirm.type === "approve") {
          // DELETE with JSON body → axios uses { data: ... }
          await api.delete("h-police/accept-delete-fine-request", { data: { fine_id: id } });
          setToast({ show: true, variant: "success", message: "Fine deletion approved." });
        } else {
          await api.delete("h-police/decline-delete-fine-request", {
            data: { fine_id: id, decline_reason: confirm.note || undefined },
          });
          setToast({ show: true, variant: "warning", message: "Fine deletion declined." });
        }
      }
      removeRow(id);
      setConfirm({ type: null, item: null, busy: false, note: "" });
    } catch (e) {
      setToast({
        show: true,
        variant: "danger",
        message:
          e?.response?.data?.message ||
          (confirm.type === "approve" ? "Error approving deletion." : "Error declining deletion."),
      });
      setConfirm((c) => ({ ...c, busy: false }));
    }
  };

  return (
    <Container className="py-4" style={{ background: "#d3e2fd", minHeight: "100%" }}>
      {/* Header */}
      <Row className="align-items-center mb-3 mt-3">
        <Col md={8} className="mx-auto d-flex align-items-center">
          <h3 className="fw-bold mb-4">Fine Deletion Requests</h3>
          <Badge bg="secondary" className="ms-2 w-50 mb-4">{rows.length} pending</Badge>
        </Col>
      </Row>

      {/* Search */}
      <Row className="mb-3">
        <Col md={8} className="mx-auto mb-3">
          <InputGroup>
            <Form.Control
              placeholder="Search Driver, Officer, Offense, or Fine ID"
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search"
            />
            </InputGroup>
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-5">
        <Col md={8} className="mx-auto d-flex align-items-center gap-2">
          <Form.Select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ maxWidth: 140 }}
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </Form.Select>
          <div className="ms-auto small text-muted">Showing {paged.length} of {filtered.length}</div>
        </Col>
      </Row>

      {/* Table / states */}
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm">
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : error ? (
              <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <Button size="sm" className="w-25" variant="outline-light" onClick={() => loadData()}>Retry</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted py-5">No pending deletion requests.</div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle m-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 160}} >Driver</th>
                      <th style={{ width: 160}} >Officer</th>
                      <th style={{ width: 130}} >Flags</th>
                      <th style={{ width: 250}}  className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r, i) => (
                      <tr key={r.id ?? `${i}-${r.driverName}`}>
                        <td className="align-middle"><div className="text-truncate" style={{ maxWidth: 160}}>{r.driverName}</div></td>
                        <td className="align-middle"><div className="text-truncate" style={{ maxWidth: 160}}>{r.officerName}</div></td>
                        <td className="align-middle">
                          <div className="d-flex flex-wrap gap-1" style={{ fontSize: "1rem" }}>
                            {r.isPaid && <Badge bg="success">Paid</Badge>}
                            {r.isExpired && <Badge bg="danger">Expired</Badge>}
                            {!r.isPaid && !r.isExpired && <Badge bg="secondary">Active</Badge>}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2 flex-wrap">
                            <Button className="w-50" size="sm" variant="outline-primary" onClick={() => setDetail(r)}>
                              <FontAwesomeIcon icon={faEye} className="me-1" /> View
                            </Button>
                            <Button className="w-50" size="sm" variant="outline-success" onClick={() => setConfirm({ type: "approve", item: r, busy: false, note: "" })}>
                              <FontAwesomeIcon icon={faCheck} className="me-1" /> Approve
                            </Button>
                            <Button className="w-50" size="sm" variant="outline-danger" onClick={() => setConfirm({ type: "reject", item: r, busy: false, note: "" })}>
                              <FontAwesomeIcon icon={faTimes} className="me-1" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>

          {!loading && filtered.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="small text-muted">Page {page} of {totalPages}</div>
              <div className="btn-group">
                <Button variant="outline-secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          )}
        </Col>
      </Row>

      {/* Detail */}
      <Modal show={!!detail} onHide={() => setDetail(null)} centered>
        <Modal.Header closeButton><Modal.Title>Fine details</Modal.Title></Modal.Header>
        <Modal.Body>
          {detail && (
            <Row className="g-3">
              <Col md={6}><Form.Label className="fw-semibold">Fine ID</Form.Label><Form.Control value={detail.id ?? "—"} readOnly /></Col>
              <Col md={6}><Form.Label className="fw-semibold">Issued</Form.Label><Form.Control value={detail.issuedAt ? new Date(detail.issuedAt).toLocaleString() : "—"} readOnly /></Col>
              <Col md={6}><Form.Label className="fw-semibold">Driver</Form.Label><Form.Control value={detail.driverName} readOnly /></Col>
              <Col md={6}><Form.Label className="fw-semibold">Officer</Form.Label><Form.Control value={detail.officerName} readOnly /></Col>
              <Col md={6}><Form.Label className="fw-semibold">Offense</Form.Label><Form.Control value={detail.offense} readOnly /></Col>
              <Col md={6}><Form.Label className="fw-semibold">Amount</Form.Label><Form.Control value={asLKR(detail.amount)} readOnly /></Col>
              {detail.deleteReason && (
                <Col md={12}>
                  <Form.Label className="fw-semibold">Deletion Request Reason</Form.Label>
                  <Form.Control as="textarea" rows={3} value={detail.deleteReason} readOnly />
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setDetail(null)}>Close</Button></Modal.Footer>
      </Modal>

      {/* Confirm */}
      <Modal
        show={!!confirm.type}
        onHide={() => !confirm.busy && setConfirm({ type: null, item: null, busy: false, note: "" })}
        centered
      >
        <Modal.Header closeButton={!confirm.busy}>
          <Modal.Title>{confirm.type === "approve" ? "Approve deletion" : "Reject deletion"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirm.item && (
            <>
              <p className="mb-2">
                Are you sure you want to <strong>{confirm.type === "approve" ? "approve" : "reject"}</strong>{" "}
                deletion for fine <span className="font-monospace">{confirm.item.id}</span>?
              </p>
              <div className="small text-muted mb-3">
                Driver: <strong>{confirm.item.driverName}</strong> • Amount: <strong>{asLKR(confirm.item.amount)}</strong>
              </div>
              {confirm.type === "reject" && (
                <>
                  <Form.Label className="fw-semibold">Reason (required for reject)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={confirm.note}
                    onChange={(e) => setConfirm((c) => ({ ...c, note: e.target.value }))}
                    placeholder="Write a brief reason…"
                  />
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={confirm.busy} onClick={() => setConfirm({ type: null, item: null, busy: false, note: "" })}>Cancel</Button>
          <Button
            variant={confirm.type === "approve" ? "success" : "danger"}
            disabled={confirm.busy || (confirm.type === "reject" && !confirm.note.trim())}
            onClick={performDecision}
          >
            {confirm.busy ? (<><Spinner size="sm" animation="border" className="me-2" />Processing…</>) : confirm.type === "approve" ? (<><FontAwesomeIcon icon={faCheck} className="me-2" />Approve</>) : (<><FontAwesomeIcon icon={faTimes} className="me-2" />Reject</>)}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToast((t) => ({ ...t, show: false }))} show={toast.show} delay={2600} autohide bg={toast.variant}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
