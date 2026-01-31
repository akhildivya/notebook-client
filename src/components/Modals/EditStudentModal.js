import { Modal, Form, Button } from "react-bootstrap";
import { BASEURL } from "../../service/baseUrl";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

function EditStudentModal({ student, onClose, onUpdated }) {
    const [form, setForm] = useState({
        studentName: student.studentName || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        institution: student.institution || "",
        remarks: student.remarks || "",
        contacts: student.contacts || []
    });

    const textRegex = /^[A-Za-z.,\-\s]*$/;
    const phoneRegex = /^[0-9]{0,10}$/;

    const [errors, setErrors] = useState({});

    /* ---------- TEXT HANDLER ---------- */
    const handleTextChange = (field) => (e) => {
        const value = e.target.value;

        if (textRegex.test(value)) {
            setForm(prev => ({ ...prev, [field]: value }));
            setErrors(prev => ({ ...prev, [field]: "" }));
        } else {
            setErrors(prev => ({
                ...prev,
                [field]: "Only letters, dot, comma, space and hyphen are allowed"
            }));
        }
    };

    /* ---------- PHONE HANDLER (LIVE VALIDATION) ---------- */
    const handleContactChange = (i, value) => {
        const copy = [...form.contacts];
        copy[i] = { ...copy[i], phone: value };
        setForm(prev => ({ ...prev, contacts: copy }));

        if (!phoneRegex.test(value)) {
            setErrors(prev => ({
                ...prev,
                [`phone_${i}`]: "Phone must be numeric and max 10 digits"
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                [`phone_${i}`]: ""
            }));
        }
    };

    /* ---------- REMARKS HANDLER ---------- */
    const handleRemarksChange = (e) => {
        const value = e.target.value;

        if (textRegex.test(value)) {
            setForm(prev => ({ ...prev, remarks: value }));
            setErrors(prev => ({ ...prev, remarks: "" }));
        } else {
            setErrors(prev => ({
                ...prev,
                remarks: "Invalid characters used"
            }));
        }
    };

    /* ---------- SUBMIT ---------- */
    const handleSubmit = async () => {
        const hasErrors = Object.values(errors).some(e => e);
        if (hasErrors) {
            toast.warn("⚠️ Please fix validation errors",{ position: "top-center" });
            return;
        }

        try {
            const res = await axios.put(
                `${BASEURL}/update-student/${student._id}`,
                form
            );

            toast.success("Student updated successfully ✅",{ position: "top-center" });
            onUpdated(res.data.student);
        } catch (err) {
            if (err.response?.status === 409) {
                toast.warn(
                    "⚠️ This phone number already exists for another student",
                    { position: "top-center" }
                );
            } else {
                toast.error("Failed to update student",{ position: "top-center" });
            }
        }
    };

    return (
        <Modal show centered size="lg" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>✏️ Edit Student</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>

                    {/* STUDENT NAME */}
                    <Form.Group className="mb-2">
                        <Form.Label>Student Name</Form.Label>
                        <Form.Control
                            value={form.studentName}
                            onChange={handleTextChange("studentName")}
                        />
                        {errors.studentName && (
                            <small className="text-danger">{errors.studentName}</small>
                        )}
                    </Form.Group>

                    {/* FATHER */}
                    <Form.Group className="mb-2">
                        <Form.Label>Father Name</Form.Label>
                        <Form.Control
                            value={form.fatherName}
                            onChange={handleTextChange("fatherName")}
                        />
                        {errors.fatherName && (
                            <small className="text-danger">{errors.fatherName}</small>
                        )}
                    </Form.Group>

                    {/* MOTHER */}
                    <Form.Group className="mb-2">
                        <Form.Label>Mother Name</Form.Label>
                        <Form.Control
                            value={form.motherName}
                            onChange={handleTextChange("motherName")}
                        />
                        {errors.motherName && (
                            <small className="text-danger">{errors.motherName}</small>
                        )}
                    </Form.Group>

                    {/* INSTITUTION */}
                    <Form.Group className="mb-2">
                        <Form.Label>Institution</Form.Label>
                        <Form.Control
                            value={form.institution}
                            onChange={handleTextChange("institution")}
                        />
                        {errors.institution && (
                            <small className="text-danger">{errors.institution}</small>
                        )}
                    </Form.Group>

                    <hr />

                    {/* CONTACTS */}
                    <strong>📞 Contact Numbers</strong>
                    {form.contacts.map((c, i) => (
                        <div key={i} className="mb-2">
                            <div className="d-flex gap-2">
                                <Form.Control value={c.relation} disabled />
                                <Form.Control
                                    value={c.phone}
                                    onChange={e =>
                                        handleContactChange(i, e.target.value)
                                    }
                                />
                            </div>
                            {errors[`phone_${i}`] && (
                                <small className="text-danger">
                                    {errors[`phone_${i}`]}
                                </small>
                            )}
                        </div>
                    ))}

                    <hr />

                    {/* REMARKS */}
                    <Form.Group>
                        <Form.Label>Remarks</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={form.remarks}
                            onChange={handleRemarksChange}
                        />
                        {errors.remarks && (
                            <small className="text-danger">{errors.remarks}</small>
                        )}
                    </Form.Group>

                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={Object.values(errors).some(e => e)}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditStudentModal;
