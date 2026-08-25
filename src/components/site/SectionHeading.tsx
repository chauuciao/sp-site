/**
 * The two-line editorial heading used by "Recent Writings", "Journeys." and
 * "Keep in touch." — soft grey line above, black line below.
 */
export function SectionHeading({
  soft,
  strong,
}: {
  soft: string;
  strong: string;
}) {
  return (
    <div className="text-display tracking-[-0.17px]">
      <p className="text-heading-soft opacity-75">{soft}</p>
      <p className="text-black">{strong}</p>
    </div>
  );
}
