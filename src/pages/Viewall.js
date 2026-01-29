

import { useNavigate } from "react-router-dom";

import React, { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import viewAllcss from "./Viewall.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddPaymentModal from "../components/Modals/AddPaymentModal";
import axios from "axios";
import { BASEURL } from "../service/baseUrl";
import PaymentStatusBadge from "../components/Modals/PaymentStatusBadge";
import AddCallLogModal from "../components/Modals/AddCallLogModal";
function Viewall() {
    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 5;
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
        if (sortField === "remarks") {
            aValue = a.remarks || "";
            bValue = b.remarks || "";
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

    const getCallbackDisplay = (callbacks) => {
        if (!Array.isArray(callbacks) || callbacks.length === 0) {
            return { label: "No", type: "none", details: null };
        }

        const arrangedCb = callbacks
            .filter(c => c.arranged === "Yes")
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0];

        if (!arrangedCb) return { label: "No", type: "none", details: null };

        let type = "none";
        const now = Date.now();
        let cbTime = arrangedCb.dateTime ? new Date(arrangedCb.dateTime).getTime() : null;

        if (!arrangedCb.dateTime) type = "scheduled";
        else if (now < cbTime) type = "upcoming";
        else type = "over";

        return {
            label: type === "upcoming" ? "🔔" : type === "over" ? "Time expired" : "Yes",
            type,
            dateTime: arrangedCb.dateTime,
            details: {
                handler: arrangedCb.handler || "-",
                caller: arrangedCb.caller || "-",
                callType: arrangedCb.callType || "-"
            }
        };
    };






const exportToPDF = () => {
  const doc = new jsPDF("l", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* ===== HEADER ===== */
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Student Records Report", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on: ${new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`,
    pageWidth / 2,
    20,
    { align: "center" }
  );

  doc.text(`Total Students: ${filteredStudents.length}`, 14, 20);

  /* ===== TABLE ===== */
  autoTable(doc, {
    startY: 26,
    theme: "striped",

    head: [[
      "Student (Phone)",
      "Parents (Name + Phone)",
      "Course",
      "Institution",
      "Callback Details",
      "Payment Details"
    ]],

    body: filteredStudents.map((s) => {
      const studentPhone = s.contacts?.find(c => c.relation === "Self")?.phone || "-";
      const fatherPhone = s.contacts?.find(c => c.relation === "Father")?.phone || "-";
      const motherPhone = s.contacts?.find(c => c.relation === "Mother")?.phone || "-";

      // Parents
      const parentsDisplay = [
        `Father: ${s.fatherName || "-"}\n ${fatherPhone}`,
        `Mother: ${s.motherName || "-"}\n ${motherPhone}`
      ].join("\n");

      // Course (class + syllabus)
      const courseDisplay = `${s.classLevel || "-"} ${s.syllabus ? "- " + s.syllabus : ""}`;

      // Institution (school + district)
      const institutionDisplay = `${s.institution || "-"}\n${s.district || "-"}`;

      // Callback (latest arranged)
      const cb = Array.isArray(s.callback)
        ? s.callback
            .filter(c => c.arranged === "Yes")
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0]
        : null;

      const callbackDisplay = cb
        ? [
            `Status: ${cb.arranged}`,
            `Time: ${cb.dateTime ? new Date(cb.dateTime).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true
            }) : "-"}`,
            `Initiator: ${cb.caller || "-"}`,
            `Handler: ${cb.handler || "-"}`,
            `Type: ${cb.callType || "-"}`
          ].join("\n")
        : "No callback";

      // Payment summary
      const pay = s.payment;

      let paymentDisplay;
      if (pay) {
        // sum actual paid amount from transactions
        const paidAmount = (pay.transactions ?? []).reduce((sum, t) => sum + (t.amount || 0), 0);
        const remainingAmount = (pay.totalAmount || 0) - paidAmount;

        paymentDisplay = [
          `Status: ${pay.status || "-"}`,
          `Total: ₹${pay.totalAmount ?? 0}`,
          `Paid: ₹${paidAmount}`,
          `Balance: ₹${remainingAmount}`
        ].join("\n");
      } else {
        paymentDisplay = "No payment";
      }

      return [
        `${s.studentName}\n ${studentPhone}`,
        parentsDisplay,
        courseDisplay,
        institutionDisplay,
        callbackDisplay,
        paymentDisplay,
      ];
    }),

    headStyles: {
      fillColor: [33, 37, 41],
      textColor: 255,
      fontSize: 10,
      halign: "center",
    },

    bodyStyles: {
      fontSize: 8,
      valign: "top",
    },

    styles: {
      overflow: "linebreak",
      cellPadding: 3,
    },

    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 55 },
      4: { cellWidth: 50 },
      5: { cellWidth: 55 },
    },

    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(
        `Page ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    },
  });

  doc.save("student-records.pdf");
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

                                    <th onClick={() => handleSort("district")}>
                                        Remarks <SortIcon field="district" />
                                    </th>
                                    <th onClick={() => handleSort("callback.arranged")}>
                                        Callback <SortIcon field="callback.arranged" />
                                    </th>
                                    <th onClick={() => handleSort("payment.status")}>
                                        Status <SortIcon field="payment.status" />
                                    </th>
                                    <th>Action</th>
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
                                                <td className={viewAllcss.name}>{s.studentName}{s.contacts?.find(c => c.relation === "Self")?.phone && (
                                                    <div className={viewAllcss.personPhone}>
                                                        📱 {s.contacts.find(c => c.relation === "Self").phone}
                                                    </div>
                                                )}</td>

                                                <td>
                                                    <div className={viewAllcss.person}>
                                                        <span className={viewAllcss.personName}>
                                                            {s.fatherName || "-"}
                                                        </span>
                                                        <span className={viewAllcss.personPhone}>
                                                            📱 {fatherPhone || "—"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className={viewAllcss.person}>
                                                        <span className={viewAllcss.personName}>
                                                            {s.motherName || "-"}
                                                        </span>
                                                        <span className={viewAllcss.personPhone}>
                                                            📱 {motherPhone || "—"}
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

                                                <td className={viewAllcss.remarksCell} title={s.remarks}>
                                                    {s.remarks || "—"}
                                                </td>
                                                <td className={viewAllcss.callbackCell}>
                                                    {(() => {
                                                        const cb = getCallbackDisplay(s.callback);

                                                        return (
                                                            <div className={viewAllcss.callbackWrapper}>
                                                                {/* LABEL */}
                                                                <span
                                                                    className={`${viewAllcss.callbackLabel} ${cb.type === "upcoming"
                                                                        ? viewAllcss.callbackBell
                                                                        : cb.type === "over"
                                                                            ? viewAllcss.callbackOver
                                                                            : cb.type === "scheduled"
                                                                                ? viewAllcss.callbackYes
                                                                                : viewAllcss.callbackNo
                                                                        }`}
                                                                >
                                                                    {cb.label}
                                                                </span>

                                                                {/* TOOLTIP */}
                                                                {cb.details && (
                                                                    <div className={`${viewAllcss.callbackTooltip} vertical`}>
                                                                        <p><strong>Handler:</strong> {cb.details.handler}</p>
                                                                        <p><strong>Caller:</strong> {cb.details.caller}</p>
                                                                        <p><strong>Type:</strong> {cb.details.callType}</p>
                                                                        <p><strong>Time:</strong> {cb.dateTime && new Date(cb.dateTime).toLocaleString("en-IN", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            second: "2-digit",
                                                                            hour12: true,
                                                                        }).replace(",", "")}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td>
                                                    <PaymentStatusBadge payment={s.payment} />
                                                </td>


                                                <td className={viewAllcss.actionCell}>
                                                    <div className={viewAllcss.actionButtons}>
                                                        <AddPaymentModal
                                                            student={s}
                                                            onPaymentUpdated={fetchStudents}
                                                        />

                                                        <AddCallLogModal
                                                            studentId={s._id}
                                                            onSaved={fetchStudents}
                                                        />
                                                    </div>
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