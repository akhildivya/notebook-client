import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import historyStyles from "./HistoryStudentModal.module.css";
import { Form, Row, Col, Card } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import { BASEURL } from "../../service/baseUrl";

function HistoryStudentModal({ show, onHide }) {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);

  const fetchHistory = async () => {
    const res = await axios.get(`${BASEURL}/date-summary?date=${date}`);
    setData(res.data);
  };


  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className={historyStyles.title}>📅 Date-wise History</Modal.Title>

      </Modal.Header>

      <Modal.Body>
        <Form.Control
          type="date"
          className={`mb-3 ${historyStyles.dateInput}`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Button onClick={fetchHistory} className={`mb-3 ${historyStyles.searchBtn}`}>
          Search
        </Button>

        {data && (
          <>
            {/* Summary Cards */}
            <Row className="mb-3">
              <Col>
                <Card body className={historyStyles.summaryCard}>
                  Total Contacts
                  <div className={historyStyles.summaryValue}>{data.totalContacts}</div>
                </Card>
              </Col>
              <Col>
                <Card body className={historyStyles.summaryCard}>Total Amount: <div className={historyStyles.summaryValue}>₹{data.totalAmountReceived}</div></Card>
              </Col>
              <Col>
                <Card body className={historyStyles.summaryCard}>Callbacks: <div className={historyStyles.summaryValue} >{data.totalCallbacks}</div></Card>
              </Col>
            </Row>

            {/* Class-wise */}
            <h6 className={historyStyles.sectionTitle}>Class-wise Count</h6>
            <Table bordered className={historyStyles.table}>
              <tbody>
                {data.classWise.map((c, i) => (
                  <tr key={i}>
                    <td>{c._id || "Unknown"}</td>
                    <td>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Syllabus-wise */}
            <h6>Syllabus-wise Count</h6>
            <Table bordered>
              <tbody>
                {data.syllabusWise.map((s, i) => (
                  <tr key={i}>
                    <td>{s._id || "Unknown"}</td>
                    <td>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HistoryStudentModal;
