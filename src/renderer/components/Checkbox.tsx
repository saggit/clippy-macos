import React from "react";

export type CheckboxProps = {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked = false,
  disabled = false,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="field-row">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
