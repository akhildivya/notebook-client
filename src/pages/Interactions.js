import React, { useEffect, useState } from 'react'
import { BASEURL } from '../service/baseUrl'
import axios from 'axios';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import AddCallLogModal from '../components/Modals/AddCallLogModal';
import AddPaymentModal from '../components/Modals/AddPaymentModal';
import PaymentStatusBadge from '../components/Modals/PaymentStatusBadge';

function Interactions() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    const res = await axios.get(
      `${BASEURL}/students/interactions?search=${search}`
    );
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-3">
      <h4>Student Interactions</h4>

      <div className="d-flex gap-2 mb-3">
        <Form.Control
          placeholder="Search student"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={fetchStudents}>Search</Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Father</th>
            <th>Mother</th>
            <th>Class</th>
            <th>Syllabus</th>
            <th>School</th>
            <th>District</th>
            <th>Status</th>
            <th>Actions</th> {/* 👈 NEW */}
          </tr>
        </thead>

        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.studentName}</td>
              <td>{s.fatherName}</td>
              <td>{s.motherName}</td>
              <td>{s.classLevel}</td>
              <td>{s.syllabus}</td>
              <td>{s.institution}</td>
              <td>{s.district}</td>
              <td>
               <PaymentStatusBadge payment={s.payment} />
              </td>

              <td className="d-flex gap-2">
                <AddPaymentModal student={s} />
                <AddCallLogModal studentId={s._id} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default Interactions