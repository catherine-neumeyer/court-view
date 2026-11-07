// "Court 1" becomes "1", used in the URL
export const courtSlug = (court: string) => court.replace("Court ", "");

// "Cedar Park" becomes "cedar-park", used in the URL
export const teamSlug = (team: string) =>
  team.toLowerCase().replace(/\s+/g, "-");