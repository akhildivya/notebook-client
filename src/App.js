import Dashboard from "./pages/Dashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from "react-router-dom";
import Viewall from "./pages/Viewall";

function App() {
  return (
    <>
      <ToastContainer  />
       <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/view-all" element={<Viewall />} />
      </Routes>
    </>
  );
}

export default App;
