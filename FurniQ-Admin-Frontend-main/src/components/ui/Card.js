// src/components/ui/Card.js
export function Card({ children, className }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-semibold text-lg">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-xl font-bold">{children}</h3>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
