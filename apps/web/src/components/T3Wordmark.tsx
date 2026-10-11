import type { SVGProps } from "react";

export function T3Wordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" aria-label="BZ">
      <path
        d="M4 4h23c16 0 24 8 24 16 0 6-3 10-8 13 7 3 11 7 11 13 0 10-9 16-25 16H4zm13 12v12h10c7 0 11-2 11-6s-4-6-11-6zm0 23v13h12c8 0 12-2 12-7s-4-6-12-6zM59 4h38v12L74 48h24v14H57V50l24-32H59z"
        fill="currentColor"
      />
    </svg>
  );
}
