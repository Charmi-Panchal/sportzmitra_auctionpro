import { useEffect, useRef, useState, useCallback } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionMenu({ items = [], buttonLabel = "Actions" }) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = Math.min(items.length * 42 + 16, 360);

    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    if (top + menuHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - menuHeight - 8);
    }

    if (left < 12) left = 12;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }

    setPosition({ top, left });
  }, [items.length]);

  const toggleMenu = useCallback(() => {
    if (!open) {
      calculatePosition();
    }
    setOpen((prev) => !prev);
  }, [open, calculatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClose = () => setOpen(false);

    const handleMouseDown = (event) => {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      handleClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggleMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-[#8DC63F] hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ top: position.top, left: position.left }}
          className="fixed z-[9999] w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          <div className="max-h-[360px] overflow-y-auto space-y-0.5">
            {items.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-slate-100"
                  />
                );
              }

              const Icon = item.icon;
              const styleClasses = item.danger
                ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

              return (
                <button
                  key={`${item.label}-${index}`}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider transition ${styleClasses} ${
                    item.disabled ? "cursor-not-allowed opacity-40" : ""
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}