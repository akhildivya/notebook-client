import React, { useEffect, useState } from "react";
import { BASEURL } from "../service/baseUrl";
import axios from "axios";
import { Button, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import interactionStyles from "./Interactions.module.css";
import { Accordion } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      const res = await axios.get(`${BASEURL}/students/payments/${studentId}`);
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
      const res = await axios.get(`${BASEURL}/students/calls/${studentId}`);
      setCallData(res.data);
      setPaymentData(null);
      setExpandedRow(studentId);
      setActiveTab("calls");
    } catch (err) {
      console.error("Calls API error", err);
    }
  };

  // 🔹 Helpers
  const getPhone = (contacts, relation) =>
    contacts?.find((c) => c.relation === relation)?.phone || "";

  const getLatestTransactionDate = (s) =>
    s.payment?.transactions?.length
      ? Math.max(
        ...s.payment.transactions.map((t) =>
          new Date(t.dateTime).getTime()
        )
      )
      : 0;

  const getLatestCallDate = (s) =>
    s.callLogs?.length
      ? Math.max(
        ...s.callLogs.map((c) => new Date(c.dateTime).getTime())
      )
      : 0;

  // 🔍 Global Search (ALL columns)
  const filteredStudents = students.filter((s) => {
    const searchText = search.toLowerCase();

    const values = [
      s.studentName,
      s.fatherName,
      s.motherName,
      s.classLevel,
      s.syllabus,
      s.institution,
      s.district,
      getPhone(s.contacts, "Self"),
      getPhone(s.contacts, "Father"),
      getPhone(s.contacts, "Mother"),
    ];

    return values.some((v) =>
      String(v || "").toLowerCase().includes(searchText)
    );
  });

  // 🔃 Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA, valB;

    switch (sortField) {
      case "parents":
        valA = `${a.fatherName || ""} ${a.motherName || ""}`;
        valB = `${b.fatherName || ""} ${b.motherName || ""}`;
        break;

      case "course":
        valA = `${a.classLevel || ""} ${a.syllabus || ""}`;
        valB = `${b.classLevel || ""} ${b.syllabus || ""}`;
        break;

      case "school":
        valA = `${a.institution || ""} ${a.district || ""}`;
        valB = `${b.institution || ""} ${b.district || ""}`;
        break;

      case "transactions":
        valA = getLatestTransactionDate(a);
        valB = getLatestTransactionDate(b);
        return sortOrder === "asc" ? valA - valB : valB - valA;

      case "calls":
        valA = getLatestCallDate(a);
        valB = getLatestCallDate(b);
        return sortOrder === "asc" ? valA - valB : valB - valA;

      default:
        valA = a[sortField] || "";
        valB = b[sortField] || "";
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 🔹 Pagination
  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = sortedStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortArrow = (field) =>
    sortField !== field ? " ⇅" : sortOrder === "asc" ? " 🔼" : " 🔽";

  const exportToPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /* ================= HEADER ================= */
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Student Interactions Report", pageWidth / 2, 40, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 40, 60);

    let finalY = 80;

    const formatDateTime = (d) =>
      d
        ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        : "-";

    /* ================= LOOP STUDENTS ================= */
    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      if (finalY > pageHeight - 200) {
        doc.addPage();
        finalY = 40;
      }

      /* ---------- STUDENT DETAILS ---------- */
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${s.studentName}`, 40, finalY);
      finalY += 14;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Father: ${s.fatherName || "-"} | Mother: ${s.motherName || "-"}`,
        40,
        finalY
      );
      finalY += 12;

      doc.text(
        `Course: ${s.classLevel || "-"} | Syllabus: ${s.syllabus || "-"}`,
        40,
        finalY
      );
      finalY += 12;

      doc.text(
        `School: ${s.institution || "-"} | District: ${s.district || "-"}`,
        40,
        finalY
      );
      finalY += 10;

      /* ---------- PAYMENTS ---------- */
      let payments = [];
      try {
        const payRes = await axios.get(
          `${BASEURL}/students/payments/${s._id}`
        );
        payments = payRes.data?.transactions || [];
      } catch { }

      if (payments.length > 0) {
        autoTable(doc, {
          startY: finalY,
          head: [["Date & Time", "Amount", "Method"]],
          body: payments.map((p) => [
            formatDateTime(p.dateTime),
            `${p.amount}`,
            p.method,
          ]),
          theme: "grid",
          styles: { fontSize: 9 },
        });

        finalY = doc.lastAutoTable.finalY + 10;
      }

      /* ---------- CALL LOGS (FIXED) ---------- */
      let callLogs = [];
      try {
        const callRes = await axios.get(
          `${BASEURL}/students/${s._id}/call-log`
        );
        callLogs = callRes.data?.callLogs || [];
      } catch { }

      autoTable(doc, {
        startY: finalY,
        head: [["Date & Time", "Caller", "Handler", "Type", "Duration", "Notes"]],
        body:
          callLogs.length > 0
            ? callLogs.map((c) => [
              formatDateTime(c.dateTime),
              c.caller,
              c.handler,
              c.callType,
              `${c.duration} min`,
              c.notes || "-",
            ])
            : [["No call logs available", "-", "-", "-", "-", "-"]],
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [60, 179, 113], textColor: 255 },
      });

      finalY = doc.lastAutoTable.finalY + 20;
    }

    doc.save(`Student_Interactions_${new Date().toISOString()}.pdf`);
  };




  return (
    <div className={interactionStyles.page}>
      <div className={`w-75 mx-auto ${interactionStyles.pageContainer}`}>
        <div className={`p-3 ${interactionStyles.container}`}>
          <div className="d-flex justify-content-between mb-3">
            <h4 className={interactionStyles.heading}>Student Interactions</h4>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/")}
              >
                ⬅ Back
              </Button>
              <Button
                variant="outline-info"
                onClick={() => navigate("/call-logs")}
              >
                📞 View Call Logs
              </Button>

              <Button
                variant="outline-primary"
                onClick={exportToPDF}
              >
                📄 Export to PDF
              </Button>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={fetchStudents}>Search</Button>
          </div>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort("studentName")}>
                  Student{renderSortArrow("studentName")}
                </th>
                <th onClick={() => handleSort("parents")}>
                  Parents{renderSortArrow("parents")}
                </th>
                <th onClick={() => handleSort("course")}>
                  Course{renderSortArrow("course")}
                </th>
                <th onClick={() => handleSort("school")}>
                  School{renderSortArrow("school")}
                </th>
                <th>
                  Actions
                  <div className="small text-muted">
                    <span onClick={() => handleSort("transactions")}>
                      💳{renderSortArrow("transactions")}
                    </span>{" "}
                    |{" "}
                    <span onClick={() => handleSort("calls")}>
                      📞{renderSortArrow("calls")}
                    </span>
                  </div>
                </th>
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
export default Interactions