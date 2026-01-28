import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { BASEURL } from "../../service/baseUrl";

function AddPaymentModal({ student }) {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
 const isCompleted =
    student.payment?.paidAmount >= student.payment?.totalAmount;
  const save = async () => {
    await axios.post(
      `${BASEURL}/students/${student._id}/payment`,
      {
        totalAmount: student.payment?.totalAmount,
        amount: Number(amount),
        method,
        dateTime: new Date()
      }
    );

    toast.success("Payment added");
    setShow(false);
    setAmount("");
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <Button
        size="sm"
        disabled={isCompleted}
        onClick={() => setShow(true)}
      >
        💰 Add Payment
      </Button>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        {student.payment?.transactions?.length > 0 && (
          <>
            <h6>Previous Installments</h6>
            <ul>
              {student.payment.transactions.map((t, i) => (
                <li key={i}>
                  ₹{t.amount} — {t.method} — {new Date(t.dateTime).toLocaleString()}
                </li>
              ))}
            </ul>
            <hr />
          </>
        )}
        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              placeholder="Amount Paid"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Form.Select
              className="mb-2"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </Form.Select>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save Payment</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddPaymentModal;
