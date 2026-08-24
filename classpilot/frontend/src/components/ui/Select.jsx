import { forwardRef } from "react";

const Select = forwardRef(({ label, error, children, className = "", ...props }, ref) => {
  return (
    <div className={className}>
      {label && <label className="label-text">{label}</label>}
      <select ref={ref} className="input-field appearance-none" {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-blossom-600">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
