/**
 * "Last updated <date>", rendered visibly.
 *
 * The same ISO date is emitted as `dateModified` in the page's JSON-LD, so the
 * machine-readable freshness signal and the human-readable one are the same
 * fact. Both matter: freshness is a real ranking and citation input, and a
 * visible date tells a buyer whether they are reading something current.
 */
const LastUpdated = ({ date, className = "" }: { date: string; className?: string }) => {
  const display = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      Last updated <time dateTime={date}>{display}</time>
    </p>
  );
};

export default LastUpdated;
