// Country → major cities dictionary. Canonical country labels are French
// (matching the existing Excel data: "Maroc", "France", ...). City detection
// gives the parser and forms city → country auto-fill.

export const COUNTRY_CITIES: Record<string, string[]> = {
  Maroc: [
    "Casablanca", "Rabat", "Tanger", "Kenitra", "Marrakech", "Fès", "Agadir",
    "Meknès", "Oujda", "Tétouan", "Mohammedia", "El Jadida", "Benguerir",
    "Berrechid", "Nouaceur", "Salé", "Témara", "Settat", "Khouribga", "Safi",
    "Laâyoune", "Dakhla", "Nador",
  ],
  France: [
    "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille", "Nantes",
    "Strasbourg", "Nice", "Rennes", "Grenoble", "Montpellier", "Rouen",
    "Aix-en-Provence", "Sophia Antipolis", "Massy", "Vélizy", "Boulogne-Billancourt",
    "Courbevoie", "Nanterre", "Saint-Denis", "Toulon", "Clermont-Ferrand",
    "Le Havre", "Metz", "Nancy", "Dijon", "Angers", "Tours", "Orléans", "Brest",
    "Ile de France", "Île-de-France",
  ],
  Belgique: [
    "Bruxelles", "Brussels", "Anvers", "Antwerp", "Gand", "Ghent", "Liège",
    "Charleroi", "Louvain", "Leuven", "Namur", "Mons",
  ],
  Allemagne: [
    "Berlin", "Munich", "München", "Hambourg", "Hamburg", "Francfort",
    "Frankfurt", "Stuttgart", "Cologne", "Köln", "Düsseldorf", "Dresde",
    "Leipzig", "Nuremberg", "Karlsruhe", "Aachen", "Wolfsburg", "Ingolstadt",
  ],
  Espagne: [
    "Madrid", "Barcelone", "Barcelona", "Valence", "Valencia", "Séville",
    "Sevilla", "Bilbao", "Saragosse", "Zaragoza", "Malaga",
  ],
  Portugal: ["Lisbonne", "Lisbon", "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro"],
  "Pays-Bas": [
    "Amsterdam", "Rotterdam", "La Haye", "The Hague", "Eindhoven", "Utrecht",
    "Delft", "Groningen",
  ],
  Suisse: ["Genève", "Geneva", "Zurich", "Zürich", "Lausanne", "Bâle", "Basel", "Berne", "Bern"],
  Luxembourg: ["Luxembourg", "Esch-sur-Alzette", "Belval"],
  "Royaume-Uni": [
    "Londres", "London", "Manchester", "Birmingham", "Cambridge", "Oxford",
    "Édimbourg", "Edinburgh", "Glasgow", "Leeds", "Bristol",
  ],
  Irlande: ["Dublin", "Cork", "Galway", "Limerick"],
  Italie: ["Milan", "Milano", "Rome", "Roma", "Turin", "Torino", "Bologne", "Bologna", "Naples", "Napoli"],
  Canada: [
    "Montréal", "Montreal", "Toronto", "Québec", "Quebec", "Ottawa",
    "Vancouver", "Calgary", "Edmonton",
  ],
  "États-Unis": [
    "New York", "San Francisco", "Boston", "Chicago", "Seattle", "Austin",
    "Los Angeles", "Houston", "Dallas", "Atlanta", "Detroit", "Miami",
  ],
  "Émirats Arabes Unis": ["Dubaï", "Dubai", "Abu Dhabi", "Sharjah"],
  Qatar: ["Doha"],
  "Arabie Saoudite": ["Riyad", "Riyadh", "Djeddah", "Jeddah", "Dammam", "NEOM"],
  Turquie: ["Istanbul", "Ankara", "Izmir", "Bursa"],
  Tunisie: ["Tunis", "Sfax", "Sousse", "Monastir"],
  Algérie: ["Alger", "Oran", "Constantine"],
  Sénégal: ["Dakar", "Thiès"],
  "Côte d'Ivoire": ["Abidjan", "Yamoussoukro"],
  Égypte: ["Le Caire", "Cairo", "Alexandrie", "Alexandria", "Gizeh"],
  Brésil: ["São Paulo", "Sao Paulo", "Rio de Janeiro", "Brasilia", "Curitiba", "Belo Horizonte"],
  Inde: ["Bangalore", "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "New Delhi", "Noida", "Gurgaon"],
  Chine: ["Shanghai", "Pékin", "Beijing", "Shenzhen", "Canton", "Guangzhou"],
  Singapour: ["Singapour", "Singapore"],
  Japon: ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Yokohama"],
};

// English/alt country names → canonical French label (for parsing pasted text
// like "Casablanca , Morocco" or "Location : Germany").
export const COUNTRY_ALIASES: Record<string, string> = {
  morocco: "Maroc",
  maroc: "Maroc",
  france: "France",
  belgium: "Belgique",
  belgique: "Belgique",
  germany: "Allemagne",
  allemagne: "Allemagne",
  deutschland: "Allemagne",
  spain: "Espagne",
  espagne: "Espagne",
  españa: "Espagne",
  portugal: "Portugal",
  netherlands: "Pays-Bas",
  "pays-bas": "Pays-Bas",
  holland: "Pays-Bas",
  switzerland: "Suisse",
  suisse: "Suisse",
  luxembourg: "Luxembourg",
  "united kingdom": "Royaume-Uni",
  uk: "Royaume-Uni",
  england: "Royaume-Uni",
  "royaume-uni": "Royaume-Uni",
  ireland: "Irlande",
  irlande: "Irlande",
  italy: "Italie",
  italie: "Italie",
  canada: "Canada",
  "united states": "États-Unis",
  usa: "États-Unis",
  "etats-unis": "États-Unis",
  "états-unis": "États-Unis",
  uae: "Émirats Arabes Unis",
  "united arab emirates": "Émirats Arabes Unis",
  emirates: "Émirats Arabes Unis",
  qatar: "Qatar",
  "saudi arabia": "Arabie Saoudite",
  "arabie saoudite": "Arabie Saoudite",
  turkey: "Turquie",
  turquie: "Turquie",
  tunisia: "Tunisie",
  tunisie: "Tunisie",
  algeria: "Algérie",
  "algérie": "Algérie",
  senegal: "Sénégal",
  "sénégal": "Sénégal",
  "ivory coast": "Côte d'Ivoire",
  "côte d'ivoire": "Côte d'Ivoire",
  egypt: "Égypte",
  "égypte": "Égypte",
  brazil: "Brésil",
  bresil: "Brésil",
  "brésil": "Brésil",
  brasil: "Brésil",
  india: "Inde",
  inde: "Inde",
  china: "Chine",
  chine: "Chine",
  singapore: "Singapour",
  singapour: "Singapour",
  japan: "Japon",
  japon: "Japon",
};

export const ALL_COUNTRIES = Object.keys(COUNTRY_CITIES).sort();

export const ALL_CITIES = Array.from(
  new Set(Object.values(COUNTRY_CITIES).flat())
).sort();

function stripAccents(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const CITY_TO_COUNTRY = new Map<string, string>();
for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
  for (const city of cities) {
    // First registration wins so unambiguous names aren't overwritten.
    const key = stripAccents(city);
    if (!CITY_TO_COUNTRY.has(key)) CITY_TO_COUNTRY.set(key, country);
  }
}

export function findCountryForCity(city: string): string | undefined {
  if (!city) return undefined;
  return CITY_TO_COUNTRY.get(stripAccents(city.trim()));
}

export function normalizeCountry(raw: string): string | undefined {
  if (!raw) return undefined;
  return COUNTRY_ALIASES[stripAccents(raw.trim())];
}

// Scan free text for a known city / country / work mode. Cities are matched
// with word boundaries against the accent-stripped text; the first (earliest)
// match wins, so the city mentioned first — usually in the header — is chosen.
export function detectGeo(text: string): {
  city?: string;
  country?: string;
  workMode?: string;
} {
  const haystack = stripAccents(text);
  const result: { city?: string; country?: string; workMode?: string } = {};

  let bestIndex = Infinity;
  for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
    for (const city of cities) {
      // Skip very short names — too many false positives.
      if (city.length < 4) continue;
      const needle = stripAccents(city);
      const re = new RegExp(`(?<![\\p{L}])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "u");
      const m = re.exec(haystack);
      if (m && m.index < bestIndex) {
        bestIndex = m.index;
        result.city = city;
        result.country = country;
      }
    }
  }

  if (!result.country) {
    let bestCountryIndex = Infinity;
    for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
      const re = new RegExp(`(?<![\\p{L}])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "u");
      const m = re.exec(haystack);
      if (m && m.index < bestCountryIndex) {
        bestCountryIndex = m.index;
        result.country = canonical;
      }
    }
  }

  if (/remote|television|télétravail|teletravail|full[- ]remote/i.test(haystack)) {
    result.workMode = "Remote";
  } else if (/hybrid|hybride/i.test(haystack)) {
    result.workMode = "Hybride";
  } else if (/on[- ]site|sur site|présentiel|presentiel/i.test(haystack)) {
    result.workMode = "On-site";
  }

  return result;
}
