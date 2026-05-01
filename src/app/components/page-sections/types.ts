export type PageSectionLink<T extends string = string> = {
  id: T;
  label: string;
  compactLabel: string;
  href: `#${T}`;
  description: string;
};
