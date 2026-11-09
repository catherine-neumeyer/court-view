const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// "Men's Court" becomes "men-s-court", used in the URL
export const courtSlug = slugify;

// "Trinity College Dublin Men" becomes "trinity-college-dublin-men"
export const teamSlug = slugify;