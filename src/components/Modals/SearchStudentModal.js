import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import styles from "./AddStudentModal.module.css"; // reuse your modal CSS

function SearchStudentModal({ show, onHide, students }) {
  const [searchName, setSearchName] = useState("");

  /*const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchName.toLowerCase())
  );*/

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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              
                <tr >
                  <td>Name</td>
                  <td>father</td>
                  <td>mother</td>
                  <td>school</td>
                  <td>class</td>
                  <td>syllabus</td>
                  <td>status</td>
                </tr>
             
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
