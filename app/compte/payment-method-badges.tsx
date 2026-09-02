import Image from 'next/image'

// Simple CSS/SVG recreations of the accepted payment network marks —
// purely illustrative (nominative use, "we accept these"), not the
// official brand assets. CAWL's badge uses their real logo (provided by
// the client), the others don't since we don't have those brands' files.
export function PaymentMethodBadges() {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <span className="flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-black text-white text-sm font-medium">
        <AppleMark className="w-3.5 h-3.5 mr-1" />
        Pay
      </span>

      <span className="flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-gradient-to-r from-[#003399] via-white to-[#cc0000] text-[11px] font-bold tracking-wide text-kawa-800">
        CB
      </span>

      <span className="flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-white">
        <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
          <circle cx="13" cy="10" r="9" fill="#EB001B" />
          <circle cx="19" cy="10" r="9" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      </span>

      <span className="flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-white text-sm font-medium text-kawa-600">
        <GoogleMark className="w-3.5 h-3.5 mr-1" />
        Pay
      </span>

      <span className="flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-[#1a1f71] text-white text-base font-bold italic tracking-wide">
        VISA
      </span>

      <span className="relative flex items-center justify-center h-10 w-20 rounded-lg border border-kawa-200 bg-white p-2">
        <Image
          src="/payment-icons/cawl.png"
          alt="CAWL"
          fill
          sizes="80px"
          className="object-contain p-2"
        />
      </span>
    </div>
  )
}

function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.6 59 129.3 107.2 127.8 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-84.1 102.6-121.8-65.2-30.7-61.7-90-61.7-92zM256.8 88.7c27-32.1 24.5-61.3 23.7-71.8-23.8 1.4-51.3 16.4-67 34.9-17.3 19.8-27.5 44.3-25.3 71.4 25.4 2 48.4-10.9 68.6-34.5z" />
    </svg>
  )
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9h11.9c-.5 2.8-2.1 5.1-4.4 6.7v5.6h7.1c4.1-3.8 6.5-9.4 6.5-16.7z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41 15.3 46 24 46z"
      />
      <path fill="#FBBC05" d="M11.6 27.9c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 16.9 2 20.3 2 23.8s.8 6.9 2.3 9.8z" />
      <path
        fill="#EA4335"
        d="M24 11.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 5.2 30 3 24 3 15.3 3 7.9 8 4.3 15.1l7.3 5.7c1.8-5.3 6.6-9.1 12.4-9.1z"
      />
    </svg>
  )
}
