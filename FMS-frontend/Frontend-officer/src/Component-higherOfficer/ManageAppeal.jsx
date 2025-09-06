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

// ---- helpers ---------------------------------------------------------------
const toStatus = (accepted) => {
  if (accepted === undefined || accepted === null) return "Pending";
  return accepted ? "Approved" : "Rejected";
};

const mapAppeal = (a) => {
  const cf = a?.charged_fine ?? {};
  const fine = cf?.fine ?? {};
  const driver = cf?.driver_user ?? {};
  const officer = cf?.issuing_police_officer ?? {};

  return {
    id: a?.id ?? a?.appeal_id ?? null,
    askedAt: a?.asked_at ?? null,
    driverName: driver?.name ?? driver?.username ?? "—",
    driverLicense: driver?.license_no ?? driver?.license ?? "—",
    officerName: officer?.name ?? officer?.username ?? "—",
    offenseCode: fine?.code ?? "—",
    offense: fine?.title ?? fine?.name ?? "—",
    reason: a?.reason ?? a?.description ?? "—",
    status: toStatus(a?.accepted),
    _raw: a,
  };
};

const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };

// ---- component -------------------------------------------------------------
const ManageAppeal = () => {
  const [allAppeals, setAllAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modals & toasts
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState({ type: null, item: null, busy: false });
  const [toast, setToast] = useState({ show: false, variant: "success", message: "" });

  const searchDebounce = useRef();

  // fetch
  const fetchAppeals = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("h-police/get-all-appeals", { signal });
      const items = Array.isArray(res.data?.appeals) ? res.data.appeals : [];
      const flat = items.map(mapAppeal).sort((a, b) => (a.askedAt > b.askedAt ? -1 : 1));
      setAllAppeals(flat);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load appeals.");
      setAllAppeals([]);
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAppeals(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  // search debounce
  const onSearchChange = (val) => {
    setQ(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setPage(1), 300);
  };

  // derived rows
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allAppeals;
    return allAppeals.filter((a) =>
      [a.driverName, a.officerName, a.offense, String(a.id || "")]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [q, allAppeals]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const from = (page - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page, pageSize]);

  const removeRow = (id) => setAllAppeals((prev) => prev.filter((x) => x.id !== id));

  const performDecision = async () => {
    if (!confirm?.item?.id || !confirm.type) return;
    setConfirm((c) => ({ ...c, busy: true }));
    const id = confirm.item.id;

    try {
      if (confirm.type === "approve") {
        await api.put("h-police/accept-appeal", { appeal_id: id });
        setToast({ show: true, variant: "success", message: "Appeal approved." });
      } else {
        await api.put("h-police/decline-appeal", { appeal_id: id });
        setToast({ show: true, variant: "warning", message: "Appeal rejected." });
      }
      removeRow(id);
      setConfirm({ type: null, item: null, busy: false });
    } catch (e) {
      setToast({
        show: true,
        variant: "danger",
        message:
          e?.response?.data?.message ||
          (confirm.type === "approve" ? "Error approving appeal." : "Error rejecting appeal."),
      });
      setConfirm((c) => ({ ...c, busy: false }));
    }
  };

  // ---- UI ------------------------------------------------------------------
  return (
    <Container className="py-4" style={{ backgroundColor: "#d3e2fd", minHeight: "100%" }}>
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col md={8} className="mx-auto d-flex align-items-center">
          <h3 className="fw-bold mb-0">Appeals</h3>
          <Badge bg="secondary" className="ms-2 w-50">
            {allAppeals.length} pending
          </Badge>
        </Col>
      </Row>

      {/* Search */}
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <InputGroup>
            <Form.Control
              placeholder="Search by Driver, Officer, Offense, or Appeal ID"
              aria-label="Search"
              onChange={(e) => onSearchChange(e.target.value)}
            />
           
          </InputGroup>
        </Col>
      </Row>

      {/* Page size + count */}
      <Row className="mb-2">
        <Col md={8} className="mx-auto d-flex align-items-center gap-2">
          <Form.Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{ maxWidth: 140 }}
            aria-label="Rows per page"
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
          <Card className="shadow-sm mt-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : error ? (
              <div className="alert alert-danger m-0 d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <Button className="w-25" size="sm" variant="outline-light" onClick={() => fetchAppeals()}>
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted py-5">No appeals found.</div>
            ) : (
              <div className="table-responsive p-0">
                <Table hover className="m-0 align-middle ">
                  <thead className="table-light">
                    <tr>
                      
                      <th style={{ width: 100 }}>Driver</th>
                      <th style={{ width: 100 }}>Officer</th>
                      <th style={{ width: 160 }}>Submitted</th>
                      <th style={{ width: 110 }}>Status</th>
                      <th style={{ width: 230 }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((a, i) => (
                      <tr key={a.id ?? `${i}-${a.driverName}`}>
                        
                        <td>
                          <div className="text-truncate" style={{ maxWidth: 150 }}>{a.driverName}</div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: 150 }}>{a.officerName}</div>
                        </td>
                        
                        
                        <td>{a.askedAt ? new Date(a.askedAt).toLocaleString() : "—"}</td>
                        <td>
                          <Badge
                            bg={a.status === "Pending" ? "secondary" : a.status === "Approved" ? "success" : "danger"}
                          >
                            {a.status}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => setDetail(a)}
                              aria-label="View"
                            >
                              <FontAwesomeIcon icon={faEye} className="me-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => setConfirm({ type: "approve", item: a, busy: false })}
                              aria-label="Approve"
                            >
                              <FontAwesomeIcon icon={faCheck} className="me-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setConfirm({ type: "reject", item: a, busy: false })}
                              aria-label="Reject"
                            >
                              <FontAwesomeIcon icon={faTimes} className="me-1" />
                              Reject
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

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="small text-muted">Page {page} of {totalPages}</div>
              <div className="btn-group" role="group" aria-label="Pagination">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Col>
      </Row>

      {/* Detail modal */}
      <Modal show={!!detail} onHide={() => setDetail(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appeal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail && (
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-semibold">Driver</Form.Label>
                <Form.Control value={detail.driverName} readOnly />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">License</Form.Label>
                <Form.Control value={detail.driverLicense} readOnly />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Officer</Form.Label>
                <Form.Control value={detail.officerName} readOnly />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Offense</Form.Label>
                <Form.Control
                  value={`${detail.offenseCode && detail.offenseCode !== "—" ? detail.offenseCode + " – " : ""}${detail.offense}`}
                  readOnly
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Appeal ID</Form.Label>
                <Form.Control value={detail.id ?? "—"} readOnly />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold">Submitted</Form.Label>
                <Form.Control value={detail.askedAt ? new Date(detail.askedAt).toLocaleString() : "—"} readOnly />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold">Reason</Form.Label>
                <Form.Control as="textarea" rows={4} value={detail.reason} readOnly />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Approve/Reject confirm */}
      <Modal
        show={!!confirm.type}
        onHide={() => !confirm.busy && setConfirm({ type: null, item: null, busy: false })}
        centered
      >
        <Modal.Header closeButton={!confirm.busy}>
          <Modal.Title>{confirm.type === "approve" ? "Approve Appeal" : "Reject Appeal"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirm.item && (
            <>
              <p className="mb-2">
                Are you sure you want to <strong>{confirm.type === "approve" ? "approve" : "reject"}</strong>{" "}
                appeal <span className="font-monospace">{confirm.item.id}</span>?
              </p>
              <div className="small text-muted">
                Driver: <strong>{confirm.item.driverName}</strong> • Officer:{" "}
                <strong>{confirm.item.officerName}</strong>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={confirm.busy}
            onClick={() => setConfirm({ type: null, item: null, busy: false })}
          >
            Cancel
          </Button>
          <Button
            variant={confirm.type === "approve" ? "success" : "danger"}
            disabled={confirm.busy}
            onClick={performDecision}
          >
            {confirm.busy ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : confirm.type === "approve" ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Approve
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Reject
              </>
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
};

export default ManageAppeal;
