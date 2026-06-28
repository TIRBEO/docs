export type NavItem = {
  slug: string;
  label: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function getArticleSlugFromHash(): string | null {
  const hash = window.location.hash.replace("#", "");
  const match = hash.match(/^article\/(.+)$/);
  return match ? match[1] : null;
}

export function isHomeHash(): boolean {
  const hash = window.location.hash.replace("#", "");
  return !hash || hash === "home";
}
