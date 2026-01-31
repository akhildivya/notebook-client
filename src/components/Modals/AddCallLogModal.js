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
  const [dateTime, setDateTime] = useState(null);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  // validation state
  const [handlerError, setHandlerError] = useState("");
  const [callerError, setCallerError] = useState("");
  const [notesError, setNotesError] = useState("");

  const validateText = (value) => {
    const regex = /^[A-Za-z\s.,]*$/;
    return regex.test(value);
  };

  const handleHandlerChange = (e) => {
    const value = e.target.value;
    if (validateText(value)) {
      setHandler(value);
      setHandlerError("");
    } else {
      setHandlerError(
        "Only letters, spaces, comma, and dot are allowed."
      );
    }
  };

  const handleCallerChange = (e) => {
    const value = e.target.value;
    if (validateText(value)) {
      setCaller(value);
      setCallerError("");
    } else {
      setCallerError(
        "Only letters, spaces, comma, and dot are allowed."
      );
    }
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    if (validateText(value)) {
      setNotes(value);
      setNotesError("");
    } else {
      setNotesError(
        "Only letters, spaces, comma, and dot are allowed."
      );
    }
  };
const resetForm = () => {
  setHandler("");
  setCaller("");
  setCallType("Outgoing");
  setNotes("");
  setDateTime(null);
  setMinutes("");
  setSeconds("");
  setHandlerError("");
  setCallerError("");
  setNotesError("");
};
  const save = async () => {
    // additional checks
    if (!handler || !caller || !dateTime) {
      toast.error("Fill all required fields", { position: "top-center" });
      return;
    }

    if (handlerError || callerError || notesError) {
      toast.error("Fix validation errors before submitting", {
        position: "top-center",
      });
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
      dateTime,
    });

    toast.success("Call log added", { position: "top-center" });
     resetForm();
    setShow(false);
    onSaved?.();
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline-primary"
        onClick={() => setShow(true)}
      >
        Add 📞
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

            {/* Call Initiator */}
            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Call Initiator"
                value={handler}
                onChange={handleHandlerChange}
              />
              {handlerError && (
                <div className="text-danger small">{handlerError}</div>
              )}
            </Form.Group>

            {/* Call Receiver */}
            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Call Receiver"
                value={caller}
                onChange={handleCallerChange}
              />
              {callerError && (
                <div className="text-danger small">{callerError}</div>
              )}
            </Form.Group>

            {/* Call Type */}
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

            {/* Notes */}
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Notes ........"
                value={notes}
                onChange={handleNotesChange}
              />
              {notesError && (
                <div className="text-danger small">{notesError}</div>
              )}
            </Form.Group>
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
