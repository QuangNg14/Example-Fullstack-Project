import React, { useState } from "react";
import { message, Input, Button } from "antd";

const NaturalLanguageInput = ({ onAddItem }) => {
  const [input, setInput] = useState("");

  const handleAddItem = () => {
    onAddItem(input);
    setInput("");
  };

  return (
    <div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add items via natural language"
        style={{ width: 300, marginRight: 10 }}
      />
      <Button type="primary" onClick={handleAddItem}>
        Add Item
      </Button>
    </div>
  );
};

export default NaturalLanguageInput;
