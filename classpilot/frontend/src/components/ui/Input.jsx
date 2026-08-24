import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className={className}>
      {label && <label className="label-text">{label}</label>}
      <input ref={ref} className="input-field" {...props} />
      {error && <p className="mt-1 text-xs font-medium text-blossom-600">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
