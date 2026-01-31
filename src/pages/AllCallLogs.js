import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BASEURL } from "../service/baseUrl";
import AllCallLogsStyles from "./AllCallLogs.module.css";

function AllCallLogs() {
    const navigate = useNavigate();

    const [callLogs, setCallLogs] = useState([]);
    const [search, setSearch] = useState("");

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    /* Sorting */
    const [sortField, setSortField] = useState("dateTime");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        fetchAllCallLogs();
    }, []);

    /* ================= FETCH ================= */
    const fetchAllCallLogs = async () => {
        try {
            const studentsRes = await axios.get(`${BASEURL}/view-all?limit=1000`);
            const students = studentsRes.data.students || [];
            let allLogs = [];

            for (const s of students) {
                const res = await axios.get(
                    `${BASEURL}/students/${s._id}/call-log`
                );

                const father = s.contacts?.find(c => c.relation === "Father");
                const mother = s.contacts?.find(c => c.relation === "Mother");
                const self = s.contacts?.find(c => c.relation === "Self");

                const logsWithStudent = (res.data.callLogs || []).map(log => ({
                    ...log,

                    /* Student */
                    studentName: s.studentName,
                    selfPhone: self?.phone || "",

                    /* Parents */
                    fatherName: s.fatherName,
                    fatherPhone: father?.phone || "",

                    motherName: s.motherName,
                    motherPhone: mother?.phone || "",

                    /* Academic */
                    className: s.classLevel,
                    syllabus: s.syllabus
                }));

                allLogs.push(...logsWithStudent);
            }

            setCallLogs(allLogs);
        } catch (err) {
            console.error("Error fetching call logs", err);
        }
    };

    /* ================= SEARCH ================= */
    const filteredLogs = callLogs.filter(c => {
        const q = search.toLowerCase();

        const formattedDate = c.dateTime
            ? new Date(c.dateTime)
                .toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                })
                .replace(",", "")
                .replace(/:/g, ".")
                .toLowerCase()
            : "";
        const durationStr = c.duration !== undefined && c.duration !== null
            ? String(c.duration) // ✅ convert number to string
            : "";

        return (
            c.studentName?.toLowerCase().includes(q) ||
            c.selfPhone?.includes(q) ||
            c.fatherName?.toLowerCase().includes(q) ||
            c.fatherPhone?.includes(q) ||
            c.motherName?.toLowerCase().includes(q) ||
            c.motherPhone?.includes(q) ||
            c.className?.toLowerCase().includes(q) ||
            c.syllabus?.toLowerCase().includes(q) ||
            c.caller?.toLowerCase().includes(q) ||
            c.handler?.toLowerCase().includes(q) ||
            c.callType?.toLowerCase().includes(q) ||
            c.notes?.toLowerCase().includes(q) ||
            durationStr.includes(q) ||
            formattedDate.includes(q)
        );
    });

    /* ================= SORT ================= */
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        let valA, valB;

        switch (sortField) {
            case "student":
                valA = a.studentName || "";
                valB = b.studentName || "";
                break;

            case "caller":
                valA = a.caller || "";
                valB = b.caller || "";
                break;

            case "handler":
                valA = a.handler || "";
                valB = b.handler || "";
                break;

            case "father":
                valA = a.fatherName || "";
                valB = b.fatherName || "";
                break;

            case "mother":
                valA = a.motherName || "";
                valB = b.motherName || "";
                break;

            case "class":
                valA = a.className || "";
                valB = b.className || "";
                break;

            case "syllabus":
                valA = a.syllabus || "";
                valB = b.syllabus || "";
                break;

            // ✅ NEW
            case "type":
                valA = a.callType || "";
                valB = b.callType || "";
                break;

            // ✅ NEW (numeric)
            case "duration":
                valA = Number(a.duration) || 0;
                valB = Number(b.duration) || 0;
                break;

            // ✅ NEW
            case "notes":
                valA = a.notes || "";
                valB = b.notes || "";
                break;
            case "dateTime":
            default:
                valA = new Date(a.dateTime).getTime();
                valB = new Date(b.dateTime).getTime();
        }

        if (typeof valA === "string") {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    /* ================= PAGINATION ================= */
    const totalPages = Math.ceil(sortedLogs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLogs = sortedLogs.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const handleSort = field => {
        if (sortField === field) {
            setSortOrder(p => (p === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const arrow = field =>
        sortField !== field ? " ⇅" : sortOrder === "asc" ? " 🔼" : " 🔽";

    /* ================= UI ================= */
    return (
        <div className={AllCallLogsStyles.page}>
            <div className={AllCallLogsStyles.container}>

                {/* HEADER */}
                <div className={AllCallLogsStyles.header}>
                    <h4>📞 All Call Logs</h4>
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                        ⬅ Back
                    </Button>
                </div>

                {/* SEARCH */}
                <Form.Control
                    placeholder="Find by anything..."
                    className="mb-3"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                {/* TABLE */}
                <Table bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th onClick={() => handleSort("student")}>
                                Student{arrow("student")}
                            </th>
                            <th onClick={() => handleSort("father")}>
                                Father{arrow("father")}
                            </th>
                            <th onClick={() => handleSort("mother")}>
                                Mother{arrow("mother")}
                            </th>
                            <th onClick={() => handleSort("class")}>
                                Class{arrow("class")}
                            </th>
                            <th onClick={() => handleSort("syllabus")}>
                                Syllabus{arrow("syllabus")}
                            </th>
                            <th onClick={() => handleSort("dateTime")}>
                                Date & Time{arrow("dateTime")}
                            </th>
                            <th onClick={() => handleSort("caller")}>
                                Caller{arrow("caller")}
                            </th>
                            <th onClick={() => handleSort("handler")}>
                                Handler{arrow("handler")}
                            </th>

                            <th onClick={() => handleSort("type")}>
                                Type{arrow("type")}
                            </th>

                            <th onClick={() => handleSort("duration")}>
                                Duration{arrow("duration")}
                            </th>

                            <th onClick={() => handleSort("notes")}>
                                Notes{arrow("notes")}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedLogs.map((c, i) => (
                            <tr key={i}>
                                <td>{startIndex + i + 1}</td>

                                <td>
                                    <div>{c.studentName}</div>
                                    {c.selfPhone && (
                                        <small className="text-muted">{c.selfPhone}</small>
                                    )}
                                </td>

                                <td>
                                    <div>{c.fatherName || "-"}</div>
                                    {c.fatherPhone && (
                                        <small className="text-muted">{c.fatherPhone}</small>
                                    )}
                                </td>

                                <td>
                                    <div>{c.motherName || "-"}</div>
                                    {c.motherPhone && (
                                        <small className="text-muted">{c.motherPhone}</small>
                                    )}
                                </td>

                                <td>{c.className || "-"}</td>
                                <td>{c.syllabus || "-"}</td>
                                <td>
                                    {new Date(c.dateTime)
                                        .toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })
                                        .replace(",", "")
                                        .replace(/:/g, ".")
                                        .toLowerCase()}
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

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className={AllCallLogsStyles.pagination}>
                        <Button
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Prev
                        </Button>

                        {[...Array(totalPages)].map((_, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={
                                    currentPage === i + 1 ? "primary" : "outline-primary"
                                }
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AllCallLogs;

