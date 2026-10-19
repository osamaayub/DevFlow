// The single loading UI for the app: every route loading.tsx re-exports it.
// Pages read request-time data (search params, the session), so they stream in behind
// this fallback while the navbar and sidebars from the prerendered shell stay on screen.
const Loader = () => (
  <div className="flex w-full flex-col gap-6" aria-busy="true" aria-label="Loading">
    <div className="background-light800_dark300 h-10 w-2/5 animate-pulse rounded-lg" />
    <div className="background-light800_dark300 h-14 w-full animate-pulse rounded-lg" />
    {Array.from({ length: 4 }, (_, index) => (
      <div
        key={index}
        className="background-light800_dark300 h-36 w-full animate-pulse rounded-[10px]"
      />
    ))}
  </div>
)

export default Loader
