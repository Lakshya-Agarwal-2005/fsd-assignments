import { useEffect } from "react";

export default function Toast({ message, action, onClose }) {
  // Hide automatically after 5 seconds; restart the timer when the message changes
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      {action && (
        <button
          className="toast-action"
          onClick={() => {
            action.onClick();
            onClose();
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
