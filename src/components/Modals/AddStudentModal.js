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
    const [callbackArranged, setCallbackArranged] = useState(false);
    const [paidDateTime, setPaidDateTime] = useState(null);
    const [contacts, setContacts] = useState([
        { phone: "", relation: "Father" }
    ]);
const [callbackDateTime, setCallbackDateTime] = useState(null);

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
                                <Form.Control placeholder="Student Name" className={`mb-2 ${styles.formControl}`} />
                                <Form.Control placeholder="Father's Name" className={`mb-2 ${styles.formControl}`} />
                                <Form.Control placeholder="Mother's Name" className={`mb-2 ${styles.formControl}`} />
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
                                <Form.Control placeholder="Institution" className={`mb-2 ${styles.formControl}`} />
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
                                </Form.Select>

                                <Form.Select className={`mb-2 ${styles.formControl}`}>
                                    <option>CBSE</option>
                                    <option>ICSE</option>
                                    <option>HSE</option>
                                </Form.Select>

                                <Form.Control
                                    as="textarea"
                                    placeholder="Remarks like chapter wise crash course"
                                    className={`${styles.formControl} ${styles.textArea}`}
                                />
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
                                <Form.Select
                                    className={`mb-2 ${styles.formControl}`}
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                >
                                    <option value="">Payment Type</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Agreed">Agreed</option>
                                </Form.Select>

                                {paymentType === "Paid" && (
                                    <>
                                        <Form.Control placeholder="Amount Paid" className={`mb-2 ${styles.formControl}`} />
                                        <div className={`${styles.datePicker} mb-2`}>
                                            <DatePicker
                                                selected={paidDateTime}
                                                onChange={(date) => setPaidDateTime(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={15}
                                                dateFormat="dd/MM/yyyy hh:mm aa"
                                                placeholderText="Select Date & Time"
                                                className={`form-control ${styles.formControl}`}
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentType === "Agreed" && (
                                    <>
                                        <Form.Control placeholder="Agreed Amount" className={`mb-2 ${styles.formControl}`} />
                                        <Form.Control
                                            placeholder="Status"
                                            className={`mb-2 ${styles.formControl}`}
                                            value="Pending"
                                            disabled
                                        />
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
                                <Form.Check
                                    type="checkbox"
                                    label="Call Back Arranged?"
                                    checked={callbackArranged}
                                    onChange={() => setCallbackArranged(!callbackArranged)}
                                    className="mb-2"
                                />

                                {callbackArranged && (
                                    <div className={`${styles.datePicker} mb-2`}>
      <DatePicker
        selected={callbackDateTime}
        onChange={(date) => setCallbackDateTime(date)}
        showTimeSelect
        timeFormat="hh:mm aa"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy hh:mm aa"
        placeholderText="Call Back Date & Time"
        className={`form-control ${styles.formControl}`}
      />
    </div>
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
