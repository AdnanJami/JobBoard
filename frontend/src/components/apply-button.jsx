import React, { useState } from "react";
import "./aply-job.css";

function AppliedButton() {
  const [applied, setApplied] = useState(false);

  return (
    <button
      className={`btn-secondary ${applied ? "applied" : ""}`}
      onClick={(e) => {
        e.stopPropagation(); // prevent parent clicks if needed
        setApplied(!applied);
      }}
    >
      {applied ? "APPLIED ✅" : "APPLY"}
    </button>
  );
}

export default AppliedButton;
