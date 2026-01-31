import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { BASEURL } from "../../service/baseUrl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddCallLogModal({ studentId, onSaved }) {
  const [show, setShow] = useState(false);

  const [handler, setHandler] = useState("");
  const [caller, setCaller] = useState("");
  const [callType, setCallType] = useState("Outgoing");
  const [notes, setNotes] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const save = async () => {
    if (!handler || !caller || !dateTime) {
      toast.error("Fill all required fields", { position: "top-center" });
      return;
    }

    const totalSeconds =
      (Number(minutes) || 0) * 60 + (Number(seconds) || 0);

    await axios.post(`${BASEURL}/students/${studentId}/call-log`, {
      handler,
      caller,
      callType,
      notes,
      duration: totalSeconds,
      dateTime
    });

    toast.success("Call log added", { position: "top-center" });
    setShow(false);
    onSaved?.();
  };

  return (
    <>
      <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>
        Add  📞
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Call Log</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Date & Time Picker */}
            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <DatePicker
                selected={dateTime}
                onChange={(date) => setDateTime(date)}
                showTimeSelect
                timeIntervals={5}
                dateFormat="dd MMM yyyy, hh:mm aa"
                className="form-control"
              />
            </Form.Group>

            <Form.Control
              className="mb-2"
              placeholder="Handled by"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
            />

            <Form.Control
              className="mb-2"
              placeholder="Caller / Receiver"
              value={caller}
              onChange={(e) => setCaller(e.target.value)}
            />

            <Form.Select
              className="mb-2"
              value={callType}
              onChange={(e) => setCallType(e.target.value)}
            >
              <option value="Outgoing">Outgoing</option>
              <option value="Incoming">Incoming</option>
            </Form.Select>

            {/* Duration */}
            <Form.Group className="mb-2">
              <Form.Label>Call Duration</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="number"
                  placeholder="Minutes"
                  min="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
                <Form.Control
                  type="number"
                  placeholder="Seconds"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                />
              </div>
            </Form.Group>

            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}



export default AddCallLogModal;
