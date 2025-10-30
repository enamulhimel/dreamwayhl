import type { ButtonHTMLAttributes } from "react"

interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "prev" | "next"
}

export default function PaginationButton({ direction, ...props }: PaginationButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
      {...props}
    >
      {direction === "prev" ? "Previous" : "Next"}
    </button>
  )
}

