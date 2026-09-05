import type { Product } from "@shared/commerce/types";

export function getMoq(product: Product) {
  const tag = product.tags.find(value => /MOQ/i.test(value));
  return tag?.replace(/^MOQ\s*/i, "") ?? "Made to order";
}

export function getMoqNumber(product: Product) {
  const parsed = Number.parseInt(getMoq(product).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function getOrigin(vendor: string) {
  const origins: Record<string, string> = {
    "Forest Canopy Co.": "Pacific Northwest",
    "Ceylon Naturals": "Sri Lanka",
    "AgriRoots Global": "India",
    "Island Harvest Collective": "Kerala",
    "Kongu Green Collective": "Tamil Nadu, India",
    "Madurai Earth Organics": "Tamil Nadu, India",
    "Western Ghats Harvest": "Tamil Nadu, India",
    "Southern Seed House": "Tamil Nadu, India",
    "Kongu Grain Collective": "Tamil Nadu, India",
    "Southern Pulse Collective": "Tamil Nadu, India",
    "Kongu Oil Press": "Tamil Nadu, India",
    "Coastal Palm Organics": "Tamil Nadu, India",
    "Sivaganga Cane Collective": "Tamil Nadu, India",
    "Southern Botanica": "Tamil Nadu, India",
    "Delta Fresh Organics": "Tamil Nadu, India",
    "Southern Grove Organics": "Tamil Nadu, India",
    "Delta Grain Collective": "Tamil Nadu, India",
  };
  return origins[vendor] ?? "Verified origin";
}
