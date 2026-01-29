import React, { useEffect, useState } from "react";
import { BASEURL } from "../service/baseUrl";
import axios from "axios";
import { Button, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import interactionStyles from "./Interactions.module.css";

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
                  <tr key={s._id}>
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
                      <div>
                        <strong>{s.classLevel}</strong>
                      </div>
                      <div className="text-muted small">
                        {s.syllabus || "-"}
                      </div>
                    </td>

                    {/* SCHOOL */}
                    <td>
                      <div>
                        <strong>{s.institution}</strong>
                      </div>
                      <div className="text-muted small">
                        {s.district}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className={interactionStyles.actionButtons}>
                        <Button size="sm" variant="outline-success">
                          💳 Payments
                        </Button>
                        <Button size="sm" variant="outline-primary">
                          📞 Calls
                        </Button>

                      </div>
                    </td>
                  </tr>
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
