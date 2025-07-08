
import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div style={{
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 16,
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: 16
  }}>{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
