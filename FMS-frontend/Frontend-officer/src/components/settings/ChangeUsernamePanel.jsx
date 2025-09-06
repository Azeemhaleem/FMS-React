import React, { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../api/axios.jsx";

function useToken() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("token");
      if (raw && !raw.startsWith("{") && !raw.startsWith("[")) return raw;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
}

export default function ChangeUsernamePanel({ onBack }) {
  const token = useToken();

  const formik = useFormik({
    initialValues: { username: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required").min(6).max(50),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await api.post(
          "/police/changer-username",
          { username: values.username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Username changed successfully!");
        onBack();
      } catch (e) {
        alert(e?.response?.data?.message || "Username update failed.");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <section>
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h5 className="card-title fw-bold p-3">Change Username</h5>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <Form onSubmit={formik.handleSubmit} className="mt-3">
            <Form.Group controlId="username">
              <Form.Label style={{fontSize:"1rem"}}>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Eg-John123"
                {...formik.getFieldProps("username")}
                isInvalid={formik.touched.username && !!formik.errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end mt-5 mb-5 gap-2" >
              <button className="btn btn-secondary btn-small " type="button" onClick={onBack}>
                Cancel
              </button>
              <button className="btn btn-dark btn-small" type="submit" disabled={formik.isSubmitting}>
                Update
              </button>
            </div>
          </Form>

          <button className="btn btn-outline-secondary btn-sm w-25 mt-5 mb-3" onClick={onBack}>
                Back
          </button>
        </div>
      </div>

      
    </section>
  );
}
