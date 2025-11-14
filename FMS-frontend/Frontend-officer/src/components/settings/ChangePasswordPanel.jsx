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

export default function ChangePasswordPanel({ onBack }) {
  const token = useToken();

  const formik = useFormik({
    initialValues: { old_password: "", new_password: "", password_confirmation: "" },
    validationSchema: Yup.object({
      old_password: Yup.string().required("Old Password is required"),
      new_password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required")
        .matches(/[A-Z]/, "Must contain uppercase")
        .matches(/[a-z]/, "Must contain lowercase")
        .matches(/[0-9]/, "Must contain number")
        .matches(/[@$!%*?&]/, "Must contain special character")
        .test("not-same-as-old", "New password must be different from old", function (v) {
          const { old_password } = this.parent;
          return v !== old_password;
        }),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await api.post(
          "/police/password/update",
          {
            current_password: values.old_password,
            new_password: values.new_password,
            new_password_confirmation: values.password_confirmation,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Password changed successfully!");
        onBack();
      } catch (e) {
        alert(e?.response?.data?.message || "Password update failed.");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <section>
      <div className="card shadow rounded-4 mb-4" style={{ backgroundColor: "#d3e2fd" }}>
        <h5 className="card-title fw-bold p-3">Change Password</h5>
        <div className="card-body bg-white rounded-top-4 rounded-bottom-4">
          <Form onSubmit={formik.handleSubmit} className="mt-2">
            <Form.Group controlId="old_password">
              <Form.Label style={{fontSize:"1rem"}}>Old Password</Form.Label>
              <Form.Control
                type="password"
                {...formik.getFieldProps("old_password")}
                isInvalid={formik.touched.old_password && !!formik.errors.old_password}
              />
              <Form.Control.Feedback type="invalid" style={{fontSize:"0.7rem"}}>
                {formik.errors.old_password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="new_password">
              <Form.Label style={{fontSize:"1rem"}}>New Password</Form.Label>
              <Form.Control
                type="password"
                {...formik.getFieldProps("new_password")}
                isInvalid={formik.touched.new_password && !!formik.errors.new_password}
              />
              <Form.Control.Feedback type="invalid" style={{fontSize:"0.7rem"}}>
                {formik.errors.new_password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="password_confirmation">
              <Form.Label style={{fontSize:"1rem"}}>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                {...formik.getFieldProps("password_confirmation")}
                isInvalid={formik.touched.password_confirmation && !!formik.errors.password_confirmation}
              />
              <Form.Control.Feedback type="invalid" style={{fontSize:"0.7rem"}}>
                {formik.errors.password_confirmation}
              </Form.Control.Feedback>
            </Form.Group>

            <div className=" d-flex justify-content-end mt-5 mb-5 gap-2 ">
              <button className="btn btn-secondary btn-small" type="button" onClick={onBack}>
                Cancel
              </button>
              <button className="btn btn-dark btn-small" type="submit" disabled={formik.isSubmitting}>
                Update
              </button>
            </div>
             <button className="ms-auto btn btn-outline-secondary btn-small w-25 mt-4" onClick={onBack}>Back</button>
    
          </Form>
        </div>
      </div>

      </section>
  );
}
