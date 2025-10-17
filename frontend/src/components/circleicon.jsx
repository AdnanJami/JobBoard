// CircleToggle.jsx
import React, { useState } from "react";
import { FaRegCircle, FaCircle } from "react-icons/fa";

function CircleToggle({ onChange }) {
  const [selected, setSelected] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation(); // prevent triggering parent click
    const newState = !selected;
    setSelected(newState);
    if (onChange) onChange(newState); // notify parent
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: "pointer",
        fontSize: "1.8rem",
        color: selected ? "#22c55e" : "#9ca3af",
        transition: "transform 0.2s ease, color 0.2s ease",
        transform: selected ? "scale(1.1)" : "scale(1)",
      }}
    >
      {selected ? <FaCircle /> : <FaRegCircle />}
    </div>
  );
}

export default CircleToggle;
