import React, { useState } from "react";
import { Collapse } from "react-collapse";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="collapsible-section">
      <div
        className={`collapsible-section-title ${isOpen ? "opened" : "closed"}`}
        onClick={() => setIsOpen((prev) => !prev)}>
        {title}
      </div>
      <Collapse isOpened={isOpen}>
        <div
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            marginTop: "5px",
          }}>
          {children}
        </div>
      </Collapse>
    </div>
  );
};

export default CollapsibleSection;
