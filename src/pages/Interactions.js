import React, { useEffect, useState } from "react";
import { BASEURL } from "../service/baseUrl";
import axios from "axios";
import { Button, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import interactionStyles from "./Interactions.module.css";
import { Accordion } from "react-bootstrap";

function Interactions() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 🔹 Sorting
  const [sortField, setSortField] = useState("studentName");
  const [sortOrder, setSortOrder] = useState("asc");


  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [callData, setCallData] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${BASEURL}/students/interactions?search=${search}`
      );
      setStudents(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openPayments = async (studentId) => {
    try {
      const res = await axios.get(
        `${BASEURL}/students/payments/${studentId}`
      );
      setPaymentData(res.data);
      setCallData(null);
      setExpandedRow(studentId);
      setActiveTab("payments");
    } catch (err) {
      console.error("Payments API error", err);
    }
  };


  const openCalls = async (studentId) => {
    try {
      const res = await axios.get(
        `${BASEURL}/students/calls/${studentId}`
      );
      setCallData(res.data);
      setPaymentData(null);
      setExpandedRow(studentId);
      setActiveTab("calls");
    } catch (err) {
      console.error("Calls API error", err);
    }
  };


  // 🔹 Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 🔹 Apply sorting
  const sortedStudents = [...students].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 🔹 Pagination logic
  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = sortedStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // 🔹 Helper to get phone by relation
  const getPhone = (contacts, relation) => {
    if (!Array.isArray(contacts)) return null;
    return contacts.find((c) => c.relation === relation)?.phone || null;
  };
  const renderSortArrow = (field) => {
    if (sortField !== field) return " ⇅";
    return sortOrder === "asc" ? " 🔼" : " 🔽";
  };

  return (
    <div className={interactionStyles.page}>
      <div className={`w-75 mx-auto ${interactionStyles.pageContainer}`}>
        <div className={`p-3 ${interactionStyles.container}`}>
          {/* 🔙 Back */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className={interactionStyles.heading}>Student Interactions</h4>
            <Button variant="outline-secondary" onClick={() => navigate("/")}>
              ⬅ Back to Home
            </Button>
          </div>

          {/* 🔍 Search */}
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="Search student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={fetchStudents}>Search</Button>
          </div>

          {/* 📋 Table */}
          <Table bordered hover responsive className={interactionStyles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("studentName")}>
                  Student{renderSortArrow("studentName")}
                </th>
                <th>Parents</th>
                <th>Course</th>
                <th>School</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <React.Fragment key={s._id}>
                    {/* ================= MAIN ROW ================= */}
                    <tr>
                      {/* STUDENT */}
                      <td>
                        <strong>{s.studentName}</strong>
                        {getPhone(s.contacts, "Self") && (
                          <div className="text-muted small">
                            📞 {getPhone(s.contacts, "Self")}
                          </div>
                        )}
                      </td>

                      {/* PARENTS */}
                      <td>
                        <div>
                          <strong>Father:</strong> {s.fatherName || "-"}
                          {getPhone(s.contacts, "Father") && (
                            <div className="text-muted small">
                              📞 {getPhone(s.contacts, "Father")}
                            </div>
                          )}
                        </div>

                        <div className="mt-1">
                          <strong>Mother:</strong> {s.motherName || "-"}
                          {getPhone(s.contacts, "Mother") && (
                            <div className="text-muted small">
                              📞 {getPhone(s.contacts, "Mother")}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* COURSE */}
                      <td>
                        <strong>{s.classLevel}</strong>
                        <div className="text-muted small">{s.syllabus || "-"}</div>
                      </td>

                      {/* SCHOOL */}
                      <td>
                        <strong>{s.institution}</strong>
                        <div className="text-muted small">{s.district}</div>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className={interactionStyles.actionButtons}>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => openPayments(s._id)}
                          >
                            💳 Transactions
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => openCalls(s._id)}
                          >
                            📞 Call History
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* ================= EXPANDED ACCORDION ROW ================= */}
                    {expandedRow === s._id && (
                      <tr>
                        <td colSpan="5">
                          <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                {activeTab === "payments"
                                  ? "Payment History"
                                  : "Call Logs"}
                              </Accordion.Header>

                              <Accordion.Body>
                                {/* ===== PAYMENTS ===== */}
                                {activeTab === "payments" && paymentData && (
                                  <>
                                    <p>
                                      <strong>Total:</strong> ₹{paymentData.totalAmount}{" "}
                                      | <strong>Paid:</strong> ₹
                                      {paymentData.paidAmount} |{" "}
                                      <strong>Status:</strong> {paymentData.status}
                                    </p>

                                    <Table size="sm" bordered>
                                      <thead>
                                        <tr>
                                          <th>Date</th>
                                          <th>Amount</th>
                                          <th>Method</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paymentData.transactions.map((t, i) => (
                                          <tr key={i}>
                                            <td>
                                              {new Date(
                                                t.dateTime
                                              ).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: true,
                                              })}
                                            </td>
                                            <td>₹{t.amount}</td>
                                            <td>{t.method}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </>
                                )}

                                {/* ===== CALL LOGS ===== */}
                                {activeTab === "calls" && callData && (
                                  <Table size="sm" bordered>
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Caller</th>
                                        <th>Handler</th>
                                        <th>Type</th>
                                        <th>Duration</th>
                                        <th>Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {callData.callLogs.map((c, i) => (
                                        <tr key={i}>
                                          <td>
                                            {new Date(
                                              c.dateTime
                                            ).toLocaleString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              second: "2-digit",
                                              hour12: true,
                                            })}
                                          </td>
                                          <td>{c.caller}</td>
                                          <td>{c.handler}</td>
                                          <td>{c.callType}</td>
                                          <td>{c.duration} sec</td>
                                          <td>{c.notes || "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                )}
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>


          {/* 🔢 Pagination */}
          {totalPages > 1 && (
            <div className={interactionStyles.pagination}>
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentPage === i + 1 ? "primary" : "outline-primary"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                size="sm"
                variant="outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interactions;
