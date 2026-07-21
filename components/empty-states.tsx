'use client'

export function EmptyCart() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/40"
    >
      {/* Shopping bag */}
      <path
        d="M35 45h50l-5 50H40L35 45z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M45 45V35a15 15 0 0130 0v10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sparkles */}
      <circle cx="25" cy="35" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="95" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="90" cy="50" r="2" fill="currentColor" opacity="0.3" />
      <path
        d="M20 55l2-4 2 4M98 65l1.5-3 1.5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

export function NoResults() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/40"
    >
      {/* Magnifying glass */}
      <circle
        cx="52"
        cy="52"
        r="22"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M68 68l18 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Question mark */}
      <path
        d="M46 46c0-4 3-7 7-7s7 3 7 7c0 3-2 4-4 5s-3 2-3 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="53" cy="62" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function EmptyWishlist() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/40"
    >
      {/* Heart outline */}
      <path
        d="M60 95S25 75 25 50a17.5 17.5 0 0135 0 17.5 17.5 0 0135 0c0 25-35 45-35 45z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkles */}
      <circle cx="20" cy="40" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="100" cy="35" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="95" cy="60" r="2" fill="currentColor" opacity="0.3" />
      <path
        d="M15 60l2-4 2 4M105 50l1.5-3 1.5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

export function EmptyOrders() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/40"
    >
      {/* Package box */}
      <path
        d="M30 45l30-15 30 15v35l-30 15-30-15V45z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Middle line */}
      <path
        d="M60 30v65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Top flaps */}
      <path
        d="M30 45l30 15 30-15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Tape */}
      <rect
        x="55"
        y="55"
        width="10"
        height="20"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}
