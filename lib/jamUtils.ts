
export type JamPartial = {
    event_name: string | null;
    venue_name: string | null;
    city: string | null;
};

export function isNotable(jam: JamPartial): boolean {
    const name = jam.event_name?.toLowerCase() || "";
    const venue = jam.venue_name?.toLowerCase() || "";
    const city = jam.city || "";

    return (
        name.includes("berkeley bluegrass barn") ||
        name.includes("graton grass") ||
        (name.includes("blondie") && city === "San Francisco") ||
        (venue.includes("blondie") && city === "San Francisco")
    );
}
