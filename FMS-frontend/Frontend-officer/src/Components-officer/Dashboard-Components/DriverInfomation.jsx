import React from "react";
import { Form } from "react-bootstrap";
import "../Officer-styles.css";

export default function ConfirmPage({
                                        selectedDriver,
                                        fines,
                                        finesLoading,
                                        finesError,
                                        selectedFine,
                                        handleFineSelect,
                                        formik,
                                        handleAdd,
                                        closeModal,
                                    }) {
    return (
        <div id="ConfirmPage" className="d-flex justify-content-center align-content-center">
            <div className="row">
                <div
                    className="card mt-4 mx-auto"
                    style={{ backgroundColor: "#f7f9fc", padding: "20px", fontSize: "medium", width: "135vh" }}
                >
                    <h4>Driver Details</h4>
                    <div>
                        <span className="info-label">Driver Name:</span>
                        <div className="info-value"> {selectedDriver.full_name}</div>
                    </div>
                    <div>
                        <span className="info-label">License Number:</span>
                        <div className="info-value"> {selectedDriver.license_id_no || "N/A"}</div>
                    </div>
                    <div>
                        <span className="info-label">License Issued Date:</span>
                        <div className="info-value">{selectedDriver.license_issued_date || "N/A"}</div>
                    </div>
                    <div>
                        <span className="info-label">License Expiry Date:</span>
                        <div className="info-value">{selectedDriver.license_expiry_date || "N/A"}</div>
                    </div>

                    <hr />
                    <br />

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (formik.isValid) handleAdd();
                            formik.handleSubmit(e);
                        }}
                    >
                        <Form.Group controlId="Fine" className="mt-1">
                            <Form.Label>Select Fine</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedFine?.id || ""}
                                onChange={handleFineSelect}
                                disabled={finesLoading || !!finesError || fines.length === 0}
                            >
                                <option value="">
                                    {finesLoading
                                        ? "Loading fines..."
                                        : finesError
                                            ? "Failed to load fines"
                                            : fines.length === 0
                                                ? "-- No fines available --"
                                                : "-- Select a Fine --"}
                                </option>

                                {fines.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </Form.Control>

                            <Form.Control.Feedback type="invalid">
                                {formik.errors.Fine}
                            </Form.Control.Feedback>

                            {finesError && (
                                <div className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
                                    {finesError}
                                </div>
                            )}
                        </Form.Group>

                        <div className="row">
                            <div className="d-flex justify-content-end mt-4">
                                <button
                                    className="btn btn-secondary btn-lg me-3"
                                    type="reset"
                                    style={{ fontSize: "medium" }}
                                    onClick={closeModal}
                                >
                                    Cancel Fine
                                </button>
                                <button className="btn btn-dark btn-lg" type="submit" style={{ fontSize: "medium" }}>
                                    Issue Fine
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}
