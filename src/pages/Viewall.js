

import { useNavigate } from "react-router-dom";

import React, { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import viewAllcss from "./Viewall.module.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

import axios from "axios";
import { BASEURL } from "../service/baseUrl";

function Viewall() {
    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 10;
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [sortField, setSortField] = useState("studentName");
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc


    // 🔹 Fetch all students
    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSort = (field) => {
        if (sortField === field) {
            // toggle order
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${BASEURL}/view-all`); // adjust API if needed
            setStudents(res.data.students || []);
        } catch (err) {
            console.error(err);
        }
    };
    const filteredStudents = students.filter((s) => {
        // Get father and mother phones from contacts
        const fatherPhone = s.contacts?.find(c => c.relation === "Father")?.phone || "";
        const motherPhone = s.contacts?.find(c => c.relation === "Mother")?.phone || "";

        // Flatten all searchable values into an array
        const valuesToSearch = [
            s.studentName,
            s.fatherName,
            fatherPhone,
            s.motherName,
            motherPhone,
            s.classLevel,
            s.institution,
            s.district,
            s.syllabus,
            s.payment?.status,
            s.payment?.type,
            s.callback?.arranged,        // ← new
            s.callback?.dateTime?.toString(),
            s.createdAt && new Date(s.createdAt).toLocaleString(), // include date/time
        ];

        // Return true if search text matches any of these values
        return valuesToSearch.some(val =>
            val?.toString().toLowerCase().includes(search.toLowerCase())
        );
    });




    // 🔹 Pagination
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);


    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle nested fields
        if (sortField === "payment.status") {
            aValue = a.payment?.status || "";
            bValue = b.payment?.status || "";
        }
        if (sortField === "callback.arranged") {
            aValue = a.callback?.arranged || "";
            bValue = b.callback?.arranged || "";
        }

        if (sortField === "createdAt") {
            return sortOrder === "asc"
                ? new Date(a.createdAt) - new Date(b.createdAt)
                : new Date(b.createdAt) - new Date(a.createdAt);
        }

        if (typeof aValue === "string") {
            return sortOrder === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return 0;
    });

    const paginatedStudents = sortedStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className={viewAllcss.sortIcon}>⇅</span>;
        return (
            <span className={viewAllcss.sortIcon}>
                {sortOrder === "asc" ? "▲" : "▼"}
            </span>
        );
    };

const getCallbackDisplay = (callback) => {
    if (!callback?.arranged || callback.arranged !== "Yes") {
        return { label: "No", type: "none" };
    }
    if (!callback.dateTime) {
        return { label: "Yes", type: "scheduled" };
    }

    const callbackTime = new Date(callback.dateTime).getTime();
    const now = Date.now();

    if (now < callbackTime) {
        return { label: "🔔", type: "upcoming", dateTime: callbackTime };
    }
    return { label: "Date Over", type: "over" };
};

    // 🔹 Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("All Students", 14, 10);

        doc.autoTable({
            startY: 20,
            head: [["Name", "Class", "School", "District", "Payment", "Created"]],
            body: filteredStudents.map((s) => [
                s.studentName,
                s.classLevel,
                s.institution,
                s.district,
                s.payment?.status || "-",
                new Date(s.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            ]),
        });

        doc.save("students.pdf");
    };

    return (
        <>
            <div className={viewAllcss.page}>
                <div className={viewAllcss.card}>

                    {/* HEADER */}
                    <div className={viewAllcss.header}>
                        <div>
                            <h4>📋 All Students</h4>
                            <p className={viewAllcss.subtitle}>
                                Manage, search and export student records
                            </p>
                        </div>

                        <div className={viewAllcss.actions}>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigate("/")}
                            >
                                ⬅ Back
                            </Button>

                            <Button
                                variant="success"
                                size="sm"
                                onClick={exportToPDF}
                            >
                                ⬇ Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className={viewAllcss.searchWrapper}>
                        <Form.Control
                            placeholder="🔍 Search by anything..."
                            className={viewAllcss.searchBox}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* TABLE */}
                    <div className={viewAllcss.tableWrapper}>
                        <Table hover responsive className={viewAllcss.table}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort("studentName")}>
                                        Name <SortIcon field="studentName" />
                                    </th>

                                    <th>Father</th>
                                    <th>Mother</th>

                                    <th onClick={() => handleSort("classLevel")}>
                                        Class <SortIcon field="classLevel" />
                                    </th>

                                    <th onClick={() => handleSort("syllabus")}>
                                        Syllabus <SortIcon field="syllabus" />
                                    </th>

                                    <th onClick={() => handleSort("institution")}>
                                        School <SortIcon field="institution" />
                                    </th>

                                    <th onClick={() => handleSort("district")}>
                                        District <SortIcon field="district" />
                                    </th>

                                    <th onClick={() => handleSort("payment.status")}>
                                        Status <SortIcon field="payment.status" />
                                    </th>
                                    <th onClick={() => handleSort("callback.arranged")}>
                                        Callback <SortIcon field="callback.arranged" />
                                    </th>
                                    <th onClick={() => handleSort("createdAt")}>
                                        Created <SortIcon field="createdAt" />
                                    </th>
                                </tr>
                            </thead>


                            <tbody>
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((s) => {
                                        const fatherPhone = s.contacts?.find(
                                            (c) => c.relation === "Father"
                                        )?.phone;

                                        const motherPhone = s.contacts?.find(
                                            (c) => c.relation === "Mother"
                                        )?.phone;

                                        return (
                                            <tr key={s._id}>
                                                <td className={viewAllcss.name}>{s.studentName}</td>

                                                <td>
                                                    <div className={viewAllcss.person}>
                                                        <span className={viewAllcss.personName}>
                                                            {s.fatherName || "-"}
                                                        </span>
                                                        <span className={viewAllcss.personPhone}>
                                                            📞 {fatherPhone || "—"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className={viewAllcss.person}>
                                                        <span className={viewAllcss.personName}>
                                                            {s.motherName || "-"}
                                                        </span>
                                                        <span className={viewAllcss.personPhone}>
                                                            📞 {motherPhone || "—"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>{s.classLevel}</td>
                                                <td>
                                                    <span className={viewAllcss.syllabusBadge}>
                                                        {s.syllabus || "—"}
                                                    </span>
                                                </td>
                                                <td>{s.institution}</td>
                                                <td>{s.district}</td>

                                                <td>
                                                    <span
                                                        className={`${viewAllcss.status} ${viewAllcss[s.payment?.status?.replace(" ", "")]
                                                            }`}
                                                    >
                                                        {s.payment?.status || "—"}
                                                    </span>
                                                </td>
                                               <td>
    {(() => {
        const cb = getCallbackDisplay(s.callback);

        switch (cb.type) {
            case "upcoming":
                return (
                    <div>
                        <span className={viewAllcss.callbackBell}>🔔</span>
                        <br />
                        <small>
                            {new Date(s.callback.dateTime).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </small>
                    </div>
                );

            case "over":
                return <span className={viewAllcss.callbackOver}>Date Over</span>;

            case "scheduled":
                return <span className={viewAllcss.callbackYes}>Yes</span>;

            default:
                return <span className={viewAllcss.callbackNo}>No</span>;
        }
    })()}
</td>


                                                <td>
                                                    {new Date(s.createdAt)
                                                        .toLocaleString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })
                                                        .replace(",", "")
                                                        .replace(":", ".")
                                                        .toLowerCase()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className={viewAllcss.empty}>
                                            No students found
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </Table>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className={viewAllcss.pagination}>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                ◀ Prev
                            </Button>

                            <span className={viewAllcss.pageInfo}>
                                Page <strong>{currentPage}</strong> of {totalPages}
                            </span>

                            <Button
                                size="sm"
                                variant="outline-primary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Next ▶
                            </Button>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}

export default Viewall