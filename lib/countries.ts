const CODES: Record<string, string> = {
  algeria: "DZ", angola: "AO", argentina: "AR", armenia: "AM", australia: "AU", austria: "AT",
  azerbaijan: "AZ", bahrain: "BH", bangladesh: "BD", belgium: "BE", bolivia: "BO", brazil: "BR",
  bulgaria: "BG", cameroon: "CM", canada: "CA", chile: "CL", china: "CN", colombia: "CO",
  "costa rica": "CR", "cote d'ivoire": "CI", "côte d'ivoire": "CI", "ivory coast": "CI", croatia: "HR",
  cyprus: "CY", czechia: "CZ", "czech republic": "CZ", denmark: "DK", "dominican republic": "DO",
  ecuador: "EC", egypt: "EG", estonia: "EE", finland: "FI", france: "FR", georgia: "GE",
  germany: "DE", ghana: "GH", greece: "GR", hungary: "HU", iceland: "IS", india: "IN",
  indonesia: "ID", ireland: "IE", israel: "IL", italy: "IT", japan: "JP", jordan: "JO",
  kazakhstan: "KZ", kenya: "KE", korea: "KR", "south korea": "KR", "korea, republic of": "KR",
  "republic of korea": "KR", kuwait: "KW", latvia: "LV", lebanon: "LB", lithuania: "LT",
  luxembourg: "LU", madagascar: "MG", malaysia: "MY", malta: "MT", mauritius: "MU", mexico: "MX",
  morocco: "MA", nepal: "NP", netherlands: "NL", "the netherlands": "NL", "new zealand": "NZ",
  nigeria: "NG", norway: "NO", oman: "OM", pakistan: "PK", panama: "PA", paraguay: "PY",
  peru: "PE", philippines: "PH", poland: "PL", portugal: "PT", qatar: "QA", romania: "RO",
  russia: "RU", "russian federation": "RU", rwanda: "RW", "saudi arabia": "SA", senegal: "SN",
  serbia: "RS", singapore: "SG", slovakia: "SK", slovenia: "SI", "south africa": "ZA", spain: "ES",
  "sri lanka": "LK", sweden: "SE", switzerland: "CH", taiwan: "TW", thailand: "TH", tunisia: "TN",
  turkey: "TR", türkiye: "TR", turkiye: "TR", ukraine: "UA", "united arab emirates": "AE", uae: "AE",
  "united kingdom": "GB", uk: "GB", "united states": "US", "united states of america": "US",
  usa: "US", uruguay: "UY", uzbekistan: "UZ", venezuela: "VE", vietnam: "VN", "viet nam": "VN",
};

export function countryCode(country: string): string {
  const key = country.trim().toLowerCase();
  return CODES[key] ?? (key.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase() || "··");
}
