// No changes are needed for this file. It is a well-written, reusable UI component.
// It is already production-ready for Vercel.

export function Card({ children, className }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={`border-b pb-4 mb-4 ${className || ""}`}>{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-2xl font-bold text-gray-800">{children}</h2>;
}

export function CardContent({ children }) {
  return <div className="space-y-4">{children}</div>;
}
