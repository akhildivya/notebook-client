import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASEURL } from "../../service/baseUrl";

function AddPaymentModal({ student, onPaymentUpdated }) {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [date, setDate] = useState(null); // ❌ no default date

  const paidAmount =
    student.payment?.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalAmount = student.payment?.totalAmount || 0;
  const remainingAmount = totalAmount - paidAmount;

  const isCompleted = student.payment?.status === "Completed";

  const save = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Enter a valid amount", {
        position: "top-center",
      });
      return;
    }

    if (Number(amount) > remainingAmount) {
      toast.error(`Amount exceeds remaining ₹${remainingAmount}`, {
        position: "top-center",
      });
      return;
    }

    if (!date) {
      toast.error("Please select payment date & time", {
        position: "top-center",
      });
      return;
    }

    await axios.post(`${BASEURL}/students/${student._id}/payment`, {
      amount: Number(amount),
      method,
      dateTime: date,
    });

    toast.success("Payment added", {
      position: "top-center",
    });
    setShow(false);
    setAmount("");
    setMethod("UPI");
    setDate(null);
    onPaymentUpdated?.();
  };

  return (
    <>
      <Button size="sm" disabled={isCompleted} onClick={() => setShow(true)}>
        💰 Add Payment
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <strong>Total Amount: ₹{totalAmount}</strong><br />
            <small>Remaining: ₹{remainingAmount}</small>
          </div>

          {student.payment?.transactions?.length > 0 && (
            <>
              <h6>Previous Installments</h6>
              <ul>
                {student.payment.transactions.map((t, i) => (
                  <li key={i}>
                    ₹{t.amount} — {t.method} —{" "}
                    {t.dateTime
                      ? new Date(t.dateTime).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }).replace(",", "")
                      : "-"}
                  </li>
                ))}
              </ul>
              <hr />
            </>
          )}

          <Form>
            {/* AMOUNT */}
            <Form.Control
              className="mb-2"
              placeholder="Amount Paid"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {/* PAYMENT METHOD DROPDOWN */}
            <Form.Select
              className="mb-2"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </Form.Select>

            {/* DATE PICKER – FULL WIDTH, NO DEFAULT */}
            <div className="mb-2 w-100">
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                showTimeSelect
                timeIntervals={1}
                dateFormat="dd MMM yyyy h:mm aa"
                placeholderText="Select date & time"
                className="form-control"
              />
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isCompleted}>
            Save Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}



export default AddPaymentModal;
