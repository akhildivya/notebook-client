import React from 'react'
import { useState } from "react";
import ActionButtons from "../components/ActionButtons/ActionButtons";
import Header from '../components/Header/Header';
import AddStudentModal from "../components/Modals/AddStudentModal";
import SearchStudentModal from '../components/Modals/SearchStudentModal';
import HistoryStudentModal from '../components/Modals/HistoryStudentModal';
function Dashboard() {
    const [add, setAdd] = useState(false);
    const [search, setSearch] = useState(false);
    const [history, setHistory] = useState(false);
    return (
        <>
            <Header />

            <ActionButtons
                onAdd={() => setAdd(true)}
                onSearch={() => setSearch(true)}
                onHistory={() => setHistory(true)}
            />
            <AddStudentModal show={add} onHide={() => setAdd(false)} />
            <SearchStudentModal show={search} onHide={() => setSearch(false)} />
            <HistoryStudentModal show={history} onHide={() => setHistory(false)} />
        </>
    )
}

export default Dashboard
