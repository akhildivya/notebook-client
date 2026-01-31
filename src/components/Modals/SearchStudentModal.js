import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import { BASEURL } from "../../service/baseUrl";
import axios from "axios";
import searchStyles from "./SearchStudentModal.module.css"; // use this for modal-specific styles
import { toast } from "react-toastify";
import EditStudentModal from "./EditStudentModal";

function SearchStudentModal({ show, onHide }) {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  const [editStudent, setEditStudent] = useState(null);

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
   setEditStudent(student);
  };

  const handleDeleteStudent = (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="mb-2">Are you sure you want to delete this student?</p>
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-danger"
              onClick={async () => {
                try {
                  await axios.delete(`${BASEURL}/delete-student/${id}`);

                  setResults((prev) =>
                    prev.filter((s) => s._id !== id)
                  );

                  toast.success("Student deleted successfully 🗑️", {
                    position: "top-center",
                  });
                } catch (err) {
                  console.error(err);

                  toast.error(
                    err.response?.data?.error ||
                    "Failed to delete student",
                    { position: "top-center" }
                  );
                } finally {
                  closeToast();
                }
              }}
            >
              Yes, Delete
            </button>

            <button
              className="btn btn-sm btn-secondary"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };
  const getPhoneByRelation = (contacts = [], relation) => {
    return contacts.find(c => c.relation === relation)?.phone || "-";
  };
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
              <th>Institution</th>
              <th>Class</th>
              <th>Syllabus</th>
              <th>District</th>
              <th>Active on</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((s) => (
                <React.Fragment key={s._id}>
                  {/* MAIN ROW */}
                  <tr>
                    <td>
                      <div>
                        <div>{s.studentName}</div>

                        {getPhoneByRelation(s.contacts, "Self") !== "-" && (
                          <small className="text-muted">
                            📱 {getPhoneByRelation(s.contacts, "Self")}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{s.fatherName || "-"}</div>
                        <small className="text-muted">
                          📱 {getPhoneByRelation(s.contacts, "Father")}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div>{s.motherName || "-"}</div>
                        <small className="text-muted">
                          📱 {getPhoneByRelation(s.contacts, "Mother")}
                        </small>
                      </div>
                    </td>
                    {/* INSTITUTION */}
                    <td>{s.institution || "-"}</td>

                    {/* CLASS */}
                    <td>{s.classLevel || "-"}</td>

                    {/* SYLLABUS */}
                    <td>{s.syllabus || "-"}</td>

                    {/* DISTRICT */}
                    <td>{s.district || "-"}</td>
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
                      <td colSpan="9">
                        <div className={searchStyles.detailsList}>

                          {/* CONTACT DETAILS */}
                          <div className={searchStyles.detailBlock}>
                            <strong>📞 Contact Numbers</strong>
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

                          {/* CALLBACK / CALL LOG */}
                          <div className={searchStyles.detailBlock}>
                            <strong>☎️ Call Back</strong>
                            {s.callback?.length > 0 && s.callback[0]?.arranged === "Yes" ? (
                              <>
                                <p>
                                  Date & Time:{" "}
                                  {s.callback[0].dateTime
                                    ? new Date(s.callback[0].dateTime).toLocaleString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                    }).replace(/^(\d+)/, "$1th")
                                    : "-"}
                                </p>
                                <p>Handler: {s.callback[0].handler || "-"}</p>
                                <p>Caller: {s.callback[0].caller || "-"}</p>
                                <p>Type: {s.callback[0].callType || "-"}</p>
                              </>
                            ) : (
                              <p>No callback arranged</p>
                            )}
                          </div>

                          {/* PAYMENT HISTORY */}
                          <div className={searchStyles.detailBlock}>
                            <strong>💰 Payment History</strong>
                            {s.payment?.transactions?.length > 0 ? (
                              s.payment.transactions.map((t, i) => (
                                <p key={i}>
                                  ₹{t.amount} via {t.method} on{" "}
                                  {t.dateTime
                                    ? new Date(t.dateTime).toLocaleString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                    })
                                    : "-"}
                                </p>
                              ))
                            ) : (
                              <p>No payment transactions</p>
                            )}
                          </div>

                          {/* PAYMENT SUMMARY */}
                          <div className={searchStyles.detailBlock}>
                            <strong>💳 Payment Summary</strong>
                            <p>Total Amount: ₹{s.payment?.totalAmount || "-"}</p>
                            <p>Status: {s.payment?.status || "-"}</p>
                           
                          </div>
                          <div className={searchStyles.detailBlock}>
                            <strong>📝 Remarks</strong>
                            <p>{s.remarks?.trim() ? s.remarks : "No remarks available"}</p>
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

      {editStudent && (
  <EditStudentModal
    student={editStudent}
    onClose={() => setEditStudent(null)}
    onUpdated={(updatedStudent) => {
      setResults((prev) =>
        prev.map((s) =>
          s._id === updatedStudent._id ? updatedStudent : s
        )
      );
      setEditStudent(null);
    }}
  />
)}

    </Modal>
  );
}

export default SearchStudentModal;
