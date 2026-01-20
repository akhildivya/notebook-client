import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import styles from "./AddStudentModal.module.css";

function HistoryStudentModal({ show, onHide, student }) {
  // student.callHistory = array of calls
  // Example: [{ date: "2026-01-10", time: "12:00 PM", handler: "Anitha", type: "Incoming" }]

  // Date-wise summary
  const summary = {};
  student?.callHistory?.forEach((call) => {
    if (!summary[call.date]) summary[call.date] = { records: 0, amount: 0, callbacks: 0 };
    summary[call.date].records += 1;
    summary[call.date].amount += call.amountPaid || 0;
    if (!call.callbackMade) summary[call.date].callbacks += 1;
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.title}>📜 {student?.name} History</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {student?.callHistory?.length > 0 ? (
          <>
            <h6>Call Records</h6>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Handler</th>
                  <th>Type</th>
                  <th>Amount Paid</th>
                  <th>Callback Made</th>
                </tr>
              </thead>
              <tbody>
                {student.callHistory.map((call, idx) => (
                  <tr key={idx}>
                    <td>{call.date}</td>
                    <td>{call.time}</td>
                    <td>{call.handler}</td>
                    <td>{call.type}</td>
                    <td>{call.amountPaid || "-"}</td>
                    <td>{call.callbackMade ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h6>Date-wise Summary</h6>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Records Added</th>
                  <th>Total Amount Received</th>
                  <th>No Callbacks Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([date, val], idx) => (
                  <tr key={idx}>
                    <td>{date}</td>
                    <td>{val.records}</td>
                    <td>{val.amount}</td>
                    <td>{val.callbacks}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <p>No call history found.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" className={styles.footerBtn} onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HistoryStudentModal;
