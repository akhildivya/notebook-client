import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import styles from "./AddStudentModal.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { BASEURL } from "../../service/baseUrl";
import { toast } from "react-toastify";
import Dropdown from "react-bootstrap/Dropdown";

function AddStudentModal({ show, onHide }) {

    const districts = [
        "Thiruvananthapuram",
        "Kollam",
        "Pathanamthitta",
        "Alappuzha",
        "Kottayam",
        "Idukki",
        "Ernakulam",
        "Thrissur",
        "Palakkad",
        "Malappuram",
        "Kozikkode",
        "Wayanad",
        "Kannur",
        "Kasaragod"
    ];

    const classLevels = ["Plus One", "Plus Two", "BTech"];
    const syllabusOptions = ["CBSE", "ICSE", "HSE", "KTU"];
    const relationOptions = ["Father", "Mother", "Guardian", "Self"];

    const resetForm = () => {
        setStudentName("");
        setFatherName("");
        setMotherName("");
        setInstitution("");
        setDistrict("");
        setClassLevel("");
        setSyllabus("");
        setRemarks("");

        setContacts([{ phone: "", relation: "----- " }]);


        setTotalAmount("");
        setPaidAmount("");

        setPaidDateTime(null);
        setPaymentMethod(" ");
        setPaymentStatus("Pending");

        setCallbackArranged("No");
        setCallbackDateTime(null);
        setCallbackHandler("");
        setCallbackCaller("");
        setCallbackCallType("");

        setErrors({});
    };

    // "Paid" or "Agreed"

    const [paidDateTime, setPaidDateTime] = useState(null);




    const [contacts, setContacts] = useState([
        { phone: "", relation: "" }
    ]);
    const [callbackDateTime, setCallbackDateTime] = useState(null);

    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [paidAmount, setPaidAmount] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [callbackHandler, setCallbackHandler] = useState("");
    const [callbackCaller, setCallbackCaller] = useState("");
    const [callbackCallType, setCallbackCallType] = useState("");
    const [callbackArranged, setCallbackArranged] = useState("No"); // "Yes" | "No"
    const [studentName, setStudentName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [motherName, setMotherName] = useState("");
    const [institution, setInstitution] = useState("");
    const [district, setDistrict] = useState("");
    const [classLevel, setClassLevel] = useState("");
    const [syllabus, setSyllabus] = useState("");
    const [remarks, setRemarks] = useState("");

    const textRegex = /^[A-Za-z.,\-\s]*$/;
    const numberRegex = /^[0-9]*$/;
    const phoneRegex = /^[0-9]{0,10}$/;

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

    const hasDuplicatePhones = (contacts) => {
        const phones = contacts
            .map(c => c.phone)
            .filter(p => p && p.length === 10);

        return new Set(phones).size !== phones.length;
    };

    const handleContactChange = (index, field, value) => {
        const updated = [...contacts];
        if (field === "phone") {
            // allow only digits and max 10 length
            if (!phoneRegex.test(value)) return;

            updated[index].phone = value;

            // validation error
            if (value.length !== 10 && value.length !== 0) {
                setErrors((prev) => ({
                    ...prev,
                    [`phone_${index}`]: "Phone number must be exactly 10 digits"
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    [`phone_${index}`]: ""
                }));
            }
        } else {
            updated[index][field] = value;
        }

        setContacts(updated);
    };

    const addContact = () => {
        setContacts([...contacts, { phone: "", relation: "Father", error: "" }]);
    };

    const removeContact = (index) => {
        const updated = contacts.filter((_, i) => i !== index);
        setContacts(updated);
    };


   const handleSaveStudent = async () => {
  try {
    const cleanedContacts = contacts.filter(
      (c) => c.phone && c.phone.trim() !== ""
    );

    // 🔴 SAME STUDENT DUPLICATE CHECK
    if (hasDuplicatePhones(cleanedContacts)) {
      toast.error(
        "Same phone number cannot be used for Father/Mother/Guardian",
        { position: "top-center" }
      );
      return;
    }

    // 🔹 Phone length validation
    for (let c of cleanedContacts) {
      if (c.phone.length !== 10) {
        toast.error("Phone number must be exactly 10 digits", {
          position: "top-center"
        });
        return;
      }
    }

    const payload = {
      studentName,
      fatherName,
      motherName,
      contacts: cleanedContacts,
      institution,
      district,
      classLevel,
      syllabus,
      remarks,
      payment: {
        totalAmount: Number(totalAmount),
        transactions:
          Number(paidAmount) > 0
            ? [{
                amount: Number(paidAmount),
                dateTime: paidDateTime,
                method: paymentMethod
              }]
            : []
      },
      callback:
        callbackArranged === "Yes"
          ? [{
              arranged: "Yes",
              dateTime: callbackDateTime,
              handler: callbackHandler,
              caller: callbackCaller,
              callType: callbackCallType
            }]
          : [{ arranged: "No" }]
    };

    await axios.post(`${BASEURL}/create-student`, payload);

    toast.success("Student added successfully ✅", {
      position: "top-center"
    });

    resetForm();
    onHide();

  } catch (err) {
    if (
      err.response?.data?.error?.toLowerCase().includes("same phone")
    ) {
      toast.error(err.response.data.error, {
        position: "top-center"
      });
      return;
    }

    if (
      err.response?.data?.error?.toLowerCase().includes("registered")
    ) {
      toast.error("📵 This phone number is already registered", {
        position: "top-center"
      });
      return;
    }

    toast.error("Failed to save student ❌", {
      position: "top-center"
    });
  }
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
                                <Form.Control placeholder="Student Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("studentName", setStudentName)} />
                                {errors.studentName && (
                                    <div className={styles.warning}>{errors.studentName}</div>
                                )}
                                <Form.Control placeholder="Father's Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("fatherName", setFatherName)} />
                                {errors.fatherName && <div className={styles.warning}>{errors.fatherName}</div>}
                                <Form.Control placeholder="Mother's Name" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("motherName", setMotherName)} />
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
                                            maxLength={15}
                                            className={styles.formControl}
                                        />
                                        {contact.error && (
                                            <div className={styles.warning}>{contact.error}</div>
                                        )}

                                        <Dropdown className="w-100">
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                className={`${styles.formControl} w-100 text-start`}
                                            >
                                                {contact.relation || "-- Select Relation --"}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                {relationOptions.map((rel) => (
                                                    <Dropdown.Item
                                                        key={rel}
                                                        onClick={() =>
                                                            handleContactChange(index, "relation", rel)
                                                        }
                                                    >
                                                        {rel}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>

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
                                <Form.Control placeholder="Institution" className={`mb-2 ${styles.formControl}`} onChange={handleTextChange("institution", setInstitution)} />
                                {errors.institution && <div className={styles.warning}>{errors.institution}</div>}
                                <Dropdown className="mb-2 w-100">
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        className={`${styles.formControl} w-100 text-start`}
                                    >
                                        {district || "-- Select District --"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100">
                                        {districts.map((dist) => (
                                            <Dropdown.Item
                                                key={dist}
                                                onClick={() => setDistrict(dist)}
                                            >
                                                {dist}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown className="mb-2 w-100">
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        className={`${styles.formControl} w-100 text-start`}
                                    >
                                        {classLevel || "-- Select Class --"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100">
                                        {classLevels.map((cls) => (
                                            <Dropdown.Item
                                                key={cls}
                                                onClick={() => setClassLevel(cls)}
                                            >
                                                {cls}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown className="mb-2 w-100">
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        className={`${styles.formControl} w-100 text-start`}
                                    >
                                        {syllabus || "-- Select Syllabus --"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100">
                                        {syllabusOptions.map((item) => (
                                            <Dropdown.Item
                                                key={item}
                                                onClick={() => setSyllabus(item)}
                                            >
                                                {item}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Form.Control
                                    as="textarea"
                                    placeholder="Remarks like chapter wise crash course"
                                    className={`${styles.formControl} ${styles.textArea}`}
                                    onChange={handleTextChange("remarks", setRemarks)}
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
                                {/* TOTAL AMOUNT */}
                                <Form.Control
                                    placeholder="Total Amount"
                                    className={`mb-2 ${styles.formControl}`}
                                    value={totalAmount}
                                    onChange={handleNumberChange("totalAmount", setTotalAmount)}
                                />

                                {/* PAID AMOUNT */}
                                <Form.Control
                                    placeholder="Paid Amount"
                                    className={`mb-2 ${styles.formControl}`}
                                    value={paidAmount}
                                    onChange={handleNumberChange("paidAmount", setPaidAmount)}
                                />

                                {/* SHOW ONLY IF PAID AMOUNT > 0 */}
                                {Number(paidAmount) > 0 && (
                                    <>
                                        {/* DATE & TIME */}
                                        <div className={`${styles.datePicker} mb-2`}>
                                            <DatePicker
                                                selected={paidDateTime}
                                                onChange={(date) => setPaidDateTime(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                dateFormat="dd/MM/yyyy hh:mm aa"
                                                placeholderText="Payment Date & Time"
                                                className={`form-control ${styles.formControl}`}
                                            />
                                        </div>

                                        {/* PAYMENT METHOD */}
                                        <Dropdown className="mb-2 w-100">
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                className={`${styles.formControl} w-100 text-start`}
                                            >
                                                {paymentMethod || "Select Payment Method"}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                {["UPI", "Cash", "Bank Transfer"].map((method) => (
                                                    <Dropdown.Item
                                                        key={method}
                                                        onClick={() => setPaymentMethod(method)}
                                                    >
                                                        {method}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
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
                                            placeholder="Call Initiator"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={callbackHandler}
                                            onChange={handleTextChange("callbackHandler", setCallbackHandler)}
                                        />
                                        {errors.callbackHandler && <div className={styles.warning}>{errors.callbackHandler}</div>}

                                        {/* CALLER */}
                                        <Form.Control
                                            placeholder="Call Receiver"
                                            className={`mb-2 ${styles.formControl}`}
                                            value={callbackCaller}
                                            onChange={handleTextChange("callbackCaller", setCallbackCaller)}
                                        />
                                        {errors.callbackCaller && <div className={styles.warning}>{errors.callbackCaller}</div>}
                                        {/* CALL TYPE */}
                                        <Dropdown className="mb-3 w-100">
                                            <Dropdown.Toggle
                                                variant="outline-secondary"
                                                className={`${styles.formControl} w-100 text-start`}
                                            >
                                                {callbackCallType || "Select Call Type"}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                <Dropdown.Item
                                                    active={callbackCallType === "Incoming"}
                                                    onClick={() => setCallbackCallType("Incoming")}
                                                >
                                                    Incoming
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    active={callbackCallType === "Outgoing"}
                                                    onClick={() => setCallbackCallType("Outgoing")}
                                                >
                                                    Outgoing
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>




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
                <Button className={`${styles.footerBtn} ${styles.saveBtn}`} onClick={handleSaveStudent}
                >Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddStudentModal;


