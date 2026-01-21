import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import styles from "./AddStudentModal.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function AddStudentModal({ show, onHide }) {
    const [paymentType, setPaymentType] = useState(""); // "Paid" or "Agreed"

    const [paidDateTime, setPaidDateTime] = useState(null);
    const [contacts, setContacts] = useState([
        { phone: "", relation: "Father" }
    ]);
    const [callbackDateTime, setCallbackDateTime] = useState(null);

    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [agreedAmount, setAgreedAmount] = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [callbackHandler, setCallbackHandler] = useState("");
    const [callbackCaller, setCallbackCaller] = useState("");
    const [callbackCallType, setCallbackCallType] = useState("Outgoing");
    const [callbackArranged, setCallbackArranged] = useState("No"); // "Yes" | "No"
    const textRegex = /^[A-Za-z.,\-\s]*$/;
    const numberRegex = /^[0-9]*$/;

    const [errors, setErrors] = useState({});


    const handleTextChange = (field, setter) => (e) => {
        const value = e.target.value;

        if (textRegex.test(value)) {
            setter(value);
            setErrors((prev) => ({ ...prev, [field]: "" }));
        } else {
            setErrors((prev) => ({
                ...prev,
                [field]: "Invalid format — only letters, dot, comma, space and hyphen are allowed"
            }));
        }
    };

    const handleNumberChange = (field, setter) => (e) => {
        const value = e.target.value;

        if (numberRegex.test(value)) {
            setter(value);
            setErrors((prev) => ({ ...prev, [field]: "" }));
        } else {
            setErrors((prev) => ({
                ...prev,
                [field]: "Invalid format — only numbers are allowed"
            }));
        }
    };

    const handleContactChange = (index, field, value) => {
        const updated = [...contacts];
        updated[index][field] = value;
        setContacts(updated);
    };

    const addContact = () => {
        setContacts([...contacts, { phone: "", relation: "Father" }]);
    };

    const removeContact = (index) => {
        const updated = contacts.filter((_, i) => i !== index);
        setContacts(updated);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className={styles.title}>➕ Add Student</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Accordion defaultActiveKey=""> {/* All collapsed by default */}
                    {/* 👨‍🎓 Student Details */}
                    <Accordion.Item eventKey="0">
                        <Accordion.Header className={styles.accordionHeader}>
                            👨‍🎓 Student Details
                        </Accordion.Header>
                        <Accordion.Body className={styles.accordionBody}>
                            <Form>
                                <Form.Control placeholder="Student Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("studentName", () => { })} />
                                {errors.studentName && (
                                    <div className={styles.warning}>{errors.studentName}</div>
                                )}
                                <Form.Control placeholder="Father's Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("fatherName", () => { })} />
                                {errors.fatherName && <div className={styles.warning}>{errors.fatherName}</div>}
                                <Form.Control placeholder="Mother's Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("motherName", () => { })} />
                                {errors.motherName && <div className={styles.warning}>{errors.motherName}</div>}
                                <Form.Label className="mt-2 fw-semibold">Associated Contact Numbers</Form.Label>

                                {contacts.map((contact, index) => (
                                    <div key={index} className="d-flex gap-2 mb-2">
                                        <Form.Control
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={contact.phone}
                                            onChange={(e) =>
                                                handleContactChange(index, "phone", e.target.value)
                                            }
                                            className={styles.formControl}
                                        />

                                        <Form.Select
                                            value={contact.relation}
                                            onChange={(e) =>
                                                handleContactChange(index, "relation", e.target.value)
                                            }
                                            className={styles.formControl}
                                        >
                                            <option>Father</option>
                                            <option>Mother</option>
                                            <option>Guardian</option>
                                            <option>Other</option>
                                        </Form.Select>

                                        {contacts.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => removeContact(index)}
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={addContact}
                                    className="mb-2"
                                >
                                    + Add Another Contact
                                </Button>
                                <Form.Control placeholder="Institution" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("institution", () => { })} />
                                {errors.institution && <div className={styles.warning}>{errors.institution}</div>}
                                <Form.Select className={`mb-2 ${styles.formControl}`}>

                                    <option value="District 1">Thiruvananthapuram</option>
                                    <option value="District 2">Kollam</option>
                                    <option value="District 3">Pathanamthitta</option>
                                    <option value="District 4">Alappuzha</option>
                                    <option value="District 5">Kottayam</option>
                                    <option value="District 6">Idukki</option>
                                    <option value="District 7">Ernakulam</option>
                                    <option value="District 8">Thrissur</option>
                                    <option value="District 9">Palakkad</option>
                                    <option value="District 10">Malappuram</option>
                                    <option value="District 11">Kozikkode</option>
                                    <option value="District 12">Wayanad</option>
                                    <option value="District 13">Kannur</option>
                                    <option value="District 14">Kasaragod</option>
                                </Form.Select>

                                <Form.Select className={`mb-2 ${styles.formControl}`}>
                                    <option>Plus one</option>
                                    <option>Plus Two</option>
                                    <option>Btech</option>
                                </Form.Select>

                                <Form.Select className={`mb-2 ${styles.formControl}`}>
                                    <option>CBSE</option>
                                    <option>ICSE</option>
                                    <option>HSE</option>
                                    <option>KTU</option>
                                </Form.Select>

                                <Form.Control
                                    as="textarea"
                                    placeholder="Remarks like chapter wise crash course"
                                    className={`${styles.formControl} ${styles.textArea}`}
                                    onChange={handleTextChange("remarks", () => { })}
                                />
                                {errors.remarks && <div className={styles.warning}>{errors.remarks}</div>}
                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* 💰 Payment Details */}
                    <Accordion.Item eventKey="1">
                        <Accordion.Header className={styles.accordionHeader}>
                            💰 Payment Details
                        </Accordion.Header>

                        <Accordion.Body className={styles.accordionBody}>
                            <Form>

                                {/* PAYMENT TYPE */}
                                <Form.Select
                                    className={`mb-3 ${styles.formControl}`}
                                    value={paymentType}
                                    onChange={(e) => {
                                        setPaymentType(e.target.value);
                                        setPaymentStatus("Pending");
                                    }}
                                >
                                    <option value="">----</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Agreed">Agreed</option>
                                </Form.Select>

                                {/* ======================= PAID ======================= */}
                                {paymentType === "Paid" && (
                                    <>
                                        <Form.Control
                                            placeholder="Total Amount"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={totalAmount}

                                            onChange={handleNumberChange("totalAmount", setTotalAmount)}
                                        />
                                        {errors.totalAmount && <div className={styles.warning}>{errors.totalAmount}</div>}
                                        <Form.Control
                                            placeholder="Amount Paid"
                                            className={`mb-1 ${styles.formControl}`}
                                            value={paidAmount}
                                            onChange={(e) => {
                                                if (numberRegex.test(e.target.value)) {
                                                    setPaidAmount(e.target.value);
                                                    setErrors((prev) => ({ ...prev, paidAmount: "" }));

                                                    if (Number(e.target.value) >= Number(totalAmount)) {
                                                        setPaymentStatus("Completed");
                                                    } else {
                                                        setPaymentStatus("Pending");
                                                    }
                                                } else {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        paidAmount: "Invalid format — only numbers are allowed"
                                                    }));
                                                }
                                            }}
                                        />
                                        {errors.paidAmount && <div className={styles.warning}>{errors.paidAmount}</div>}


                                        <div className={`${styles.datePicker} mb-2`}>
                                            <DatePicker
                                                selected={paidDateTime}
                                                onChange={(date) => setPaidDateTime(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={1}
                                                dateFormat="dd/MM/yyyy hh:mm aa"
                                                placeholderText="Payment Date & Time"
                                                className={`form-control ${styles.formControl} mb-2`}
                                            />
                                        </div>

                                        <Form.Select
                                            className={`mb-2 ${styles.formControl}`}
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="">---Select---</option>
                                            <option>UPI</option>
                                            <option>Cash</option>
                                            <option>Bank Transfer</option>
                                        </Form.Select>

                                        {/* STATUS RADIO */}
                                        <Form.Label className="fw-semibold mt-2">Payment Status</Form.Label>
                                        <div className="d-flex gap-3 mb-2">
                                            <Form.Check
                                                type="radio"
                                                label="Pending"
                                                checked={paymentStatus === "Pending"}
                                                onChange={() => setPaymentStatus("Pending")}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="Completed"
                                                checked={paymentStatus === "Completed"}
                                                onChange={() => setPaymentStatus("Completed")}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ======================= AGREED ======================= */}
                                {paymentType === "Agreed" && (
                                    <>
                                        <Form.Control
                                            placeholder="Agreed Amount"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={agreedAmount}

                                            onChange={handleNumberChange("agreedAmount", setAgreedAmount)}
                                        />
                                        {errors.agreedAmount && <div className={styles.warning}>{errors.agreedAmount}</div>}
                                        <div className={`${styles.datePicker} mb-2`}>
                                            <DatePicker
                                                selected={paidDateTime}
                                                onChange={(date) => setPaidDateTime(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={1}
                                                dateFormat="dd/MM/yyyy hh:mm aa"
                                                placeholderText="Agreed Date & Time"
                                                className={`form-control ${styles.formControl} mb-2`}
                                            />
                                        </div>

                                        {/* STATUS RADIO */}
                                        <Form.Label className="fw-semibold mt-2">Payment Status</Form.Label>
                                        <div className="d-flex gap-3 mb-2">
                                            <Form.Check
                                                type="radio"
                                                label="Pending"
                                                checked={paymentStatus === "Pending"}
                                                onChange={() => setPaymentStatus("Pending")}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="Completed"
                                                checked={paymentStatus === "Completed"}
                                                onChange={() => setPaymentStatus("Completed")}
                                            />
                                        </div>
                                    </>
                                )}

                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* 📞 Call Back Arrangement */}
                    <Accordion.Item eventKey="2">
                        <Accordion.Header className={styles.accordionHeader}>
                            📞 Call Back Arrangement
                        </Accordion.Header>

                        <Accordion.Body className={styles.accordionBody}>
                            <Form>

                                {/* YES / NO RADIO */}
                                <div className="mb-3">
                                    <Form.Label className="fw-semibold">Call Back Arranged?</Form.Label>

                                    <div className="d-flex gap-4">
                                        <Form.Check
                                            type="radio"
                                            label="Yes"
                                            name="callbackArranged"
                                            value="Yes"
                                            checked={callbackArranged === "Yes"}
                                            onChange={(e) => setCallbackArranged(e.target.value)}
                                        />

                                        <Form.Check
                                            type="radio"
                                            label="No"
                                            name="callbackArranged"
                                            value="No"
                                            checked={callbackArranged === "No"}
                                            onChange={(e) => setCallbackArranged(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* SHOW ONLY IF YES */}
                                {callbackArranged === "Yes" && (
                                    <>
                                        {/* DATE & TIME */}
                                        <div className={`${styles.datePicker} mb-2`}>
                                            <DatePicker
                                                selected={callbackDateTime}
                                                onChange={(date) => setCallbackDateTime(date)}
                                                showTimeSelect
                                                timeIntervals={1}
                                                timeFormat="hh:mm aa"
                                                dateFormat="dd/MM/yyyy hh:mm aa"
                                                placeholderText="Call Back Date & Time"
                                                className={`form-control ${styles.formControl}`}
                                            />
                                        </div>

                                        {/* HANDLER */}
                                        <Form.Control
                                            placeholder="Handler Name"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={callbackHandler}
                                            onChange={handleTextChange("callbackHandler", setCallbackHandler)}
                                        />
                                        {errors.callbackHandler && <div className={styles.warning}>{errors.callbackHandler}</div>}

                                        {/* CALLER */}
                                        <Form.Control
                                            placeholder="Caller Name"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={callbackCaller}
                                            onChange={handleTextChange("callbackCaller", setCallbackCaller)}
                                        />
                                        {errors.callbackCaller && <div className={styles.warning}>{errors.callbackCaller}</div>}
                                        {/* CALL TYPE */}
                                        <Form.Select
                                            className={`mb-3 ${styles.formControl}`}
                                            value={callbackCallType}
                                            onChange={(e) => setCallbackCallType(e.target.value)}
                                        >
                                            <option>Incoming</option>
                                            <option>Outgoing</option>
                                        </Form.Select>

                                        {/* ⭐ STAR RATING */}

                                    </>
                                )}

                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>



                </Accordion>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" className={styles.footerBtn} onClick={onHide}>
                    Cancel
                </Button>
                <Button className={`${styles.footerBtn} ${styles.saveBtn}`}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddStudentModal;
