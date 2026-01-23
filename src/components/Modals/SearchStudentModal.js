import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import { BASEURL } from "../../service/baseUrl";
import axios from "axios";
import searchStyles from "./SearchStudentModal.module.css"; // use this for modal-specific styles

function SearchStudentModal({ show, onHide }) {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const ITEMS_PER_PAGE = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };
  const handleSearch = async (value) => {
    setSearchName(value);
    setCurrentPage(1);
    try {
      const res = await axios.get(`${BASEURL}/search-student?q=${value}`); // single slash
      setResults(res.data.students || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchName);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchName]);
  const handleEditStudent = (student) => {
    console.log("Edit student:", student);
    // open edit modal here
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`${BASEURL}/delete-student/${id}`);
      setResults(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  }
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className={searchStyles.title}>🔍 Search Student</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Control
            placeholder="Find by anything"
            className={`mb-3 ${searchStyles.formControl}`}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Form>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Father</th>
              <th>Mother</th>
              <th>School</th>
              <th>Class</th>
              <th>Syllabus</th>
              <th>District</th>
              <th>Payment Type</th>
              <th>Payment Status</th>
              <th>Created On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((s) => (
                <React.Fragment key={s._id}>
                  {/* MAIN ROW */}
                  <tr>
                    <td>{s.studentName}</td>
                    <td>{s.fatherName}</td>
                    <td>{s.motherName}</td>
                    <td>{s.institution}</td>
                    <td>{s.classLevel}</td>
                    <td>{s.syllabus}</td>
                    <td>{s.district}</td>
                    <td>{s.payment?.type || "-"}</td>
                    <td>{s.payment?.status || "-"}</td>
                    <td>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "-"}
                    </td>

                    {/* ACTION COLUMN */}
                    <td className={searchStyles.actionCol}>
                      <Button
                        size="sm"
                        variant="link"
                        className={`${searchStyles.actionBtn} ${searchStyles.viewMoreBtn}`}
                        onClick={() => toggleRow(s._id)}
                      >
                        {expandedRow === s._id ? "View Less ▲" : "View More ▼"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-primary"
                        className={searchStyles.actionBtn}
                        onClick={() => handleEditStudent(s)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        className={searchStyles.actionBtn}
                        onClick={() => handleDeleteStudent(s._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>

                  {/* EXPANDED ROW */}
                  {expandedRow === s._id && (
                    <tr className={searchStyles.expandedRow}>
                      <td colSpan="11">
                        <div className={searchStyles.detailsList}>

                          {/* Phone Numbers */}
                          <div className={searchStyles.detailBlock}>
                            <strong>📞 Phone Numbers:</strong>
                            {s.contacts?.length > 0 ? (
                              s.contacts.map((c, i) => (
                                <p key={i}>
                                  {c.relation}: {c.phone}
                                </p>
                              ))
                            ) : (
                              <p>No contact details</p>
                            )}
                          </div>

                          {/* Callback Details */}
                          <div className={searchStyles.detailBlock}>
                            <strong>☎️ Callback Details:</strong>
                            {s.callback?.arranged === "Yes" ? (
                              <>
                                <p>
                                  Date & Time:{" "}
                                  {s.callback.dateTime
                                    ? new Date(s.callback.dateTime).toLocaleString()
                                    : "-"}
                                </p>
                                <p>Handler: {s.callback.handler || "-"}</p>
                                <p>Caller: {s.callback.caller || "-"}</p>
                                <p>Type: {s.callback.callType || "-"}</p>
                              </>
                            ) : (
                              <p>No callback arranged</p>
                            )}
                          </div>

                          {/* Payment History */}
                          <div className={searchStyles.detailBlock}>
                            <strong>💰 Payment History:</strong>
                            {s.payment?.transactions?.length > 0 ? (
                              s.payment.transactions.map((t, i) => (
                                <p key={i}>
                                  ₹{t.amount} via {t.method} on{" "}
                                  {new Date(t.dateTime).toLocaleString()}
                                </p>
                              ))
                            ) : (
                              <p>No payment transactions</p>
                            )}
                          </div>

                          {/* Payment Summary */}
                          <div className={searchStyles.detailBlock}>
                            <strong>💳 Payment Summary:</strong>
                            <p>Total Amount: ₹{s.payment?.totalAmount || "-"}</p>
                            <p>Agreed Amount: ₹{s.payment?.agreedAmount || "-"}</p>
                            <p>Status: {s.payment?.status || "-"}</p>
                            <p>Type: {s.payment?.type || "-"}</p>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}

                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  {searchName ? "No students found" : "Start typing to search"}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Button
              size="sm"
              variant="secondary"
              className="me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>

            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              size="sm"
              variant="secondary"
              className="ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          className={searchStyles.footerBtn}
          onClick={onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchStudentModal;
