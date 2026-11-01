import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ id, label, hint, ...props }) {
  const [visible, setVisible] = useState(false);
  return <div className="ds-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-field">
      <input {...props} id={id} type={visible ? "text" : "password"} aria-describedby={hint ? `${id}-hint` : undefined} />
      <button type="button" aria-label={`${visible ? "Sembunyikan" : "Tampilkan"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
    {hint && <p id={`${id}-hint`} className="ds-help">{hint}</p>}
  </div>;
}
