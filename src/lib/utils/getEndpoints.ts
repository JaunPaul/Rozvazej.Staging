const MAKE_PARTIAL_POST =
  "https://hook.eu1.make.com/w932htznmlriavodas5n4sawv6pvdsk5";
const MAKE_FINAL = "https://hook.eu1.make.com/1n6ashfkhregky65x1epbfh3n4ke0114";
const MAKE__DEV = "https://hook.us2.make.com/u6dmtx7d1482psx2lal5q3cz5lfsxapb";

export function getEndpoint(w: "partial" | "final" | "dev"): string {
  if (w === "partial") return MAKE_PARTIAL_POST;
  if (w === "final") return MAKE_FINAL;
  if (w === "dev") return MAKE__DEV;
  return MAKE__DEV;
}
