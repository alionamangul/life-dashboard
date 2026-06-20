"use client";

// Кнопка отправки формы с подтверждением (window.confirm).
// Используется для удаления записей.
export function ConfirmSubmit({
  children,
  message = "Удалить запись?",
  className,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
