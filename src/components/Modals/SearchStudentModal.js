import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import styles from "./AddStudentModal.module.css"; // reuse your modal CSS
import { BASEURL } from "../../service/baseUrl";
import axios from "axios";

function SearchStudentModal({ show, onHide, students }) {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState([]);
  /*const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchName.toLowerCase())
  );*/
 const handleSearch = async (value) => {
  setSearchName(value);

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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.title}>🔍 Search Student</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Control
            placeholder="Enter Student Name"
            className={`mb-3 ${styles.formControl}`}
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
            </tr>
          </thead>


          <tbody>
            {results.length > 0 ? (
              results.map((s) => (
                <tr key={s._id}>
                  <td>{s.studentName}</td>
                  <td>{s.fatherName}</td>
                  <td>{s.motherName}</td>
                  <td>{s.institution}</td>
                  <td>{s.classLevel}</td>
                  <td>{s.syllabus}</td>
                  <td>{s.district}</td>
                  <td>{s.payment?.type || "-"}</td>
                  <td>{s.payment?.status || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  {searchName
                    ? "No students found"
                    : "Start typing to search"}
                </td>
              </tr>
            )}
          </tbody>


        </Table>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" className={styles.footerBtn} onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchStudentModal;
