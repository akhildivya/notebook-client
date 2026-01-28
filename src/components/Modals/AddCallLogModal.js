import React, { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { BASEURL } from "../../service/baseUrl";

function AddCallLogModal({ studentId }) {
  const [show, setShow] = useState(false);
  const [handler, setHandler] = useState("");
  const [caller, setCaller] = useState("");
  const [callType, setCallType] = useState("Outgoing");

  const save = async () => {
    await axios.post(
      `${BASEURL}/students/${studentId}/call-log`,
      {
        arranged: "Yes",
        dateTime: new Date(),
        handler,
        caller,
        callType
      }
    );

    toast.success("Call log added");
    setShow(false);
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <Button size="sm" variant="outline-primary" onClick={() => setShow(true)}>
        📞 Call Log
      </Button>

      {/* MODAL */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Call Log</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              placeholder="Call Initiator"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
            />

            <Form.Control
              className="mb-2"
              placeholder="Call Receiver"
              value={caller}
              onChange={(e) => setCaller(e.target.value)}
            />

            <Form.Select
              value={callType}
              onChange={(e) => setCallType(e.target.value)}
            >
              <option value="Outgoing">Outgoing</option>
              <option value="Incoming">Incoming</option>
            </Form.Select>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save Log</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddCallLogModal;
