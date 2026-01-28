import React from "react";
import { useNavigate } from "react-router-dom";
import pagenotfound from "./Pagenotfound.module.css";

function Pagenotfound() {
  const navigate = useNavigate();

  return (
    <div className={pagenotfound.container}>
      <h1 className={pagenotfound.code}>404</h1>
      <h2 className={pagenotfound.title}>Page Not Found</h2>
      <p className={pagenotfound.text}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      <div className={pagenotfound.actions}>
        <button
          className={pagenotfound.btn}
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
        <button
          className={`${pagenotfound.btn} ${pagenotfound.secondary}`}
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Pagenotfound;
