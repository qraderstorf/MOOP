// Comprehensive list of US Cities & States, Bay Area / California cities, major North American metros,
// and helper to search/suggest cities as users type.

export interface CityLocation {
  city: string;
  state: string;
  stateFull: string;
  formatted: string; // e.g. "San Francisco, CA"
}

export const US_CITIES: CityLocation[] = [
  // California - Bay Area & Northern CA
  { city: 'San Francisco', state: 'CA', stateFull: 'California', formatted: 'San Francisco, CA' },
  { city: 'Oakland', state: 'CA', stateFull: 'California', formatted: 'Oakland, CA' },
  { city: 'Berkeley', state: 'CA', stateFull: 'California', formatted: 'Berkeley, CA' },
  { city: 'San Jose', state: 'CA', stateFull: 'California', formatted: 'San Jose, CA' },
  { city: 'Palo Alto', state: 'CA', stateFull: 'California', formatted: 'Palo Alto, CA' },
  { city: 'Mountain View', state: 'CA', stateFull: 'California', formatted: 'Mountain View, CA' },
  { city: 'Sunnyvale', state: 'CA', stateFull: 'California', formatted: 'Sunnyvale, CA' },
  { city: 'Santa Clara', state: 'CA', stateFull: 'California', formatted: 'Santa Clara, CA' },
  { city: 'Redwood City', state: 'CA', stateFull: 'California', formatted: 'Redwood City, CA' },
  { city: 'San Mateo', state: 'CA', stateFull: 'California', formatted: 'San Mateo, CA' },
  { city: 'Daly City', state: 'CA', stateFull: 'California', formatted: 'Daly City, CA' },
  { city: 'South San Francisco', state: 'CA', stateFull: 'California', formatted: 'South San Francisco, CA' },
  { city: 'Sausalito', state: 'CA', stateFull: 'California', formatted: 'Sausalito, CA' },
  { city: 'San Rafael', state: 'CA', stateFull: 'California', formatted: 'San Rafael, CA' },
  { city: 'Mill Valley', state: 'CA', stateFull: 'California', formatted: 'Mill Valley, CA' },
  { city: 'Tiburon', state: 'CA', stateFull: 'California', formatted: 'Tiburon, CA' },
  { city: 'Alameda', state: 'CA', stateFull: 'California', formatted: 'Alameda, CA' },
  { city: 'Fremont', state: 'CA', stateFull: 'California', formatted: 'Fremont, CA' },
  { city: 'Hayward', state: 'CA', stateFull: 'California', formatted: 'Hayward, CA' },
  { city: 'Richmond', state: 'CA', stateFull: 'California', formatted: 'Richmond, CA' },
  { city: 'Walnut Creek', state: 'CA', stateFull: 'California', formatted: 'Walnut Creek, CA' },
  { city: 'Concord', state: 'CA', stateFull: 'California', formatted: 'Concord, CA' },
  { city: 'Santa Cruz', state: 'CA', stateFull: 'California', formatted: 'Santa Cruz, CA' },
  { city: 'Monterey', state: 'CA', stateFull: 'California', formatted: 'Monterey, CA' },
  { city: 'Carmel-by-the-Sea', state: 'CA', stateFull: 'California', formatted: 'Carmel-by-the-Sea, CA' },
  { city: 'Sacramento', state: 'CA', stateFull: 'California', formatted: 'Sacramento, CA' },
  { city: 'Davis', state: 'CA', stateFull: 'California', formatted: 'Davis, CA' },
  { city: 'Santa Rosa', state: 'CA', stateFull: 'California', formatted: 'Santa Rosa, CA' },
  { city: 'Napa', state: 'CA', stateFull: 'California', formatted: 'Napa, CA' },
  { city: 'Sonoma', state: 'CA', stateFull: 'California', formatted: 'Sonoma, CA' },
  { city: 'Vallejo', state: 'CA', stateFull: 'California', formatted: 'Vallejo, CA' },
  { city: 'San Leandro', state: 'CA', stateFull: 'California', formatted: 'San Leandro, CA' },
  { city: 'Pacifica', state: 'CA', stateFull: 'California', formatted: 'Pacifica, CA' },
  { city: 'Half Moon Bay', state: 'CA', stateFull: 'California', formatted: 'Half Moon Bay, CA' },
  { city: 'Burlingame', state: 'CA', stateFull: 'California', formatted: 'Burlingame, CA' },
  { city: 'San Carlos', state: 'CA', stateFull: 'California', formatted: 'San Carlos, CA' },
  { city: 'Menlo Park', state: 'CA', stateFull: 'California', formatted: 'Menlo Park, CA' },
  { city: 'Cupertino', state: 'CA', stateFull: 'California', formatted: 'Cupertino, CA' },
  { city: 'Los Gatos', state: 'CA', stateFull: 'California', formatted: 'Los Gatos, CA' },
  { city: 'Saratoga', state: 'CA', stateFull: 'California', formatted: 'Saratoga, CA' },
  { city: 'Campbell', state: 'CA', stateFull: 'California', formatted: 'Campbell, CA' },
  { city: 'Milpitas', state: 'CA', stateFull: 'California', formatted: 'Milpitas, CA' },
  { city: 'Pleasanton', state: 'CA', stateFull: 'California', formatted: 'Pleasanton, CA' },
  { city: 'Dublin', state: 'CA', stateFull: 'California', formatted: 'Dublin, CA' },
  { city: 'Livermore', state: 'CA', stateFull: 'California', formatted: 'Livermore, CA' },
  { city: 'San Ramon', state: 'CA', stateFull: 'California', formatted: 'San Ramon, CA' },

  // California - Southern CA & Central CA
  { city: 'Los Angeles', state: 'CA', stateFull: 'California', formatted: 'Los Angeles, CA' },
  { city: 'San Diego', state: 'CA', stateFull: 'California', formatted: 'San Diego, CA' },
  { city: 'Long Beach', state: 'CA', stateFull: 'California', formatted: 'Long Beach, CA' },
  { city: 'Santa Monica', state: 'CA', stateFull: 'California', formatted: 'Santa Monica, CA' },
  { city: 'Pasadena', state: 'CA', stateFull: 'California', formatted: 'Pasadena, CA' },
  { city: 'Glendale', state: 'CA', stateFull: 'California', formatted: 'Glendale, CA' },
  { city: 'Burbank', state: 'CA', stateFull: 'California', formatted: 'Burbank, CA' },
  { city: 'Irvine', state: 'CA', stateFull: 'California', formatted: 'Irvine, CA' },
  { city: 'Anaheim', state: 'CA', stateFull: 'California', formatted: 'Anaheim, CA' },
  { city: 'Santa Ana', state: 'CA', stateFull: 'California', formatted: 'Santa Ana, CA' },
  { city: 'Huntington Beach', state: 'CA', stateFull: 'California', formatted: 'Huntington Beach, CA' },
  { city: 'Newport Beach', state: 'CA', stateFull: 'California', formatted: 'Newport Beach, CA' },
  { city: 'Laguna Beach', state: 'CA', stateFull: 'California', formatted: 'Laguna Beach, CA' },
  { city: 'Santa Barbara', state: 'CA', stateFull: 'California', formatted: 'Santa Barbara, CA' },
  { city: 'San Luis Obispo', state: 'CA', stateFull: 'California', formatted: 'San Luis Obispo, CA' },
  { city: 'Fresno', state: 'CA', stateFull: 'California', formatted: 'Fresno, CA' },
  { city: 'Bakersfield', state: 'CA', stateFull: 'California', formatted: 'Bakersfield, CA' },
  { city: 'Riverside', state: 'CA', stateFull: 'California', formatted: 'Riverside, CA' },
  { city: 'San Bernardino', state: 'CA', stateFull: 'California', formatted: 'San Bernardino, CA' },
  { city: 'Palm Springs', state: 'CA', stateFull: 'California', formatted: 'Palm Springs, CA' },

  // Pacific Northwest & West
  { city: 'Portland', state: 'OR', stateFull: 'Oregon', formatted: 'Portland, OR' },
  { city: 'Eugene', state: 'OR', stateFull: 'Oregon', formatted: 'Eugene, OR' },
  { city: 'Bend', state: 'OR', stateFull: 'Oregon', formatted: 'Bend, OR' },
  { city: 'Salem', state: 'OR', stateFull: 'Oregon', formatted: 'Salem, OR' },
  { city: 'Beaverton', state: 'OR', stateFull: 'Oregon', formatted: 'Beaverton, OR' },
  { city: 'Seattle', state: 'WA', stateFull: 'Washington', formatted: 'Seattle, WA' },
  { city: 'Bellevue', state: 'WA', stateFull: 'Washington', formatted: 'Bellevue, WA' },
  { city: 'Tacoma', state: 'WA', stateFull: 'Washington', formatted: 'Tacoma, WA' },
  { city: 'Spokane', state: 'WA', stateFull: 'Washington', formatted: 'Spokane, WA' },
  { city: 'Olympia', state: 'WA', stateFull: 'Washington', formatted: 'Olympia, WA' },
  { city: 'Bellingham', state: 'WA', stateFull: 'Washington', formatted: 'Bellingham, WA' },
  { city: 'Vancouver', state: 'WA', stateFull: 'Washington', formatted: 'Vancouver, WA' },
  { city: 'Boise', state: 'ID', stateFull: 'Idaho', formatted: 'Boise, ID' },
  { city: 'Reno', state: 'NV', stateFull: 'Nevada', formatted: 'Reno, NV' },
  { city: 'Las Vegas', state: 'NV', stateFull: 'Nevada', formatted: 'Las Vegas, NV' },
  { city: 'Henderson', state: 'NV', stateFull: 'Nevada', formatted: 'Henderson, NV' },
  { city: 'Salt Lake City', state: 'UT', stateFull: 'Utah', formatted: 'Salt Lake City, UT' },
  { city: 'Park City', state: 'UT', stateFull: 'Utah', formatted: 'Park City, UT' },
  { city: 'Provo', state: 'UT', stateFull: 'Utah', formatted: 'Provo, UT' },
  { city: 'Denver', state: 'CO', stateFull: 'Colorado', formatted: 'Denver, CO' },
  { city: 'Boulder', state: 'CO', stateFull: 'Colorado', formatted: 'Boulder, CO' },
  { city: 'Colorado Springs', state: 'CO', stateFull: 'Colorado', formatted: 'Colorado Springs, CO' },
  { city: 'Fort Collins', state: 'CO', stateFull: 'Colorado', formatted: 'Fort Collins, CO' },
  { city: 'Aspen', state: 'CO', stateFull: 'Colorado', formatted: 'Aspen, CO' },
  { city: 'Phoenix', state: 'AZ', stateFull: 'Arizona', formatted: 'Phoenix, AZ' },
  { city: 'Scottsdale', state: 'AZ', stateFull: 'Arizona', formatted: 'Scottsdale, AZ' },
  { city: 'Tucson', state: 'AZ', stateFull: 'Arizona', formatted: 'Tucson, AZ' },
  { city: 'Tempe', state: 'AZ', stateFull: 'Arizona', formatted: 'Tempe, AZ' },
  { city: 'Flagstaff', state: 'AZ', stateFull: 'Arizona', formatted: 'Flagstaff, AZ' },
  { city: 'Mesa', state: 'AZ', stateFull: 'Arizona', formatted: 'Mesa, AZ' },
  { city: 'Albuquerque', state: 'NM', stateFull: 'New Mexico', formatted: 'Albuquerque, NM' },
  { city: 'Santa Fe', state: 'NM', stateFull: 'New Mexico', formatted: 'Santa Fe, NM' },
  { city: 'Honolulu', state: 'HI', stateFull: 'Hawaii', formatted: 'Honolulu, HI' },
  { city: 'Anchorage', state: 'AK', stateFull: 'Alaska', formatted: 'Anchorage, AK' },

  // Texas & South
  { city: 'Austin', state: 'TX', stateFull: 'Texas', formatted: 'Austin, TX' },
  { city: 'Houston', state: 'TX', stateFull: 'Texas', formatted: 'Houston, TX' },
  { city: 'Dallas', state: 'TX', stateFull: 'Texas', formatted: 'Dallas, TX' },
  { city: 'Fort Worth', state: 'TX', stateFull: 'Texas', formatted: 'Fort Worth, TX' },
  { city: 'San Antonio', state: 'TX', stateFull: 'Texas', formatted: 'San Antonio, TX' },
  { city: 'El Paso', state: 'TX', stateFull: 'Texas', formatted: 'El Paso, TX' },
  { city: 'Arlington', state: 'TX', stateFull: 'Texas', formatted: 'Arlington, TX' },
  { city: 'Plano', state: 'TX', stateFull: 'Texas', formatted: 'Plano, TX' },
  { city: 'New Orleans', state: 'LA', stateFull: 'Louisiana', formatted: 'New Orleans, LA' },
  { city: 'Baton Rouge', state: 'LA', stateFull: 'Louisiana', formatted: 'Baton Rouge, LA' },
  { city: 'Miami', state: 'FL', stateFull: 'Florida', formatted: 'Miami, FL' },
  { city: 'Miami Beach', state: 'FL', stateFull: 'Florida', formatted: 'Miami Beach, FL' },
  { city: 'Orlando', state: 'FL', stateFull: 'Florida', formatted: 'Orlando, FL' },
  { city: 'Tampa', state: 'FL', stateFull: 'Florida', formatted: 'Tampa, FL' },
  { city: 'St. Petersburg', state: 'FL', stateFull: 'Florida', formatted: 'St. Petersburg, FL' },
  { city: 'Jacksonville', state: 'FL', stateFull: 'Florida', formatted: 'Jacksonville, FL' },
  { city: 'Fort Lauderdale', state: 'FL', stateFull: 'Florida', formatted: 'Fort Lauderdale, FL' },
  { city: 'Key West', state: 'FL', stateFull: 'Florida', formatted: 'Key West, FL' },
  { city: 'Atlanta', state: 'GA', stateFull: 'Georgia', formatted: 'Atlanta, GA' },
  { city: 'Savannah', state: 'GA', stateFull: 'Georgia', formatted: 'Savannah, GA' },
  { city: 'Nashville', state: 'TN', stateFull: 'Tennessee', formatted: 'Nashville, TN' },
  { city: 'Memphis', state: 'TN', stateFull: 'Tennessee', formatted: 'Memphis, TN' },
  { city: 'Knoxville', state: 'TN', stateFull: 'Tennessee', formatted: 'Knoxville, TN' },
  { city: 'Chattanooga', state: 'TN', stateFull: 'Tennessee', formatted: 'Chattanooga, TN' },
  { city: 'Charlotte', state: 'NC', stateFull: 'North Carolina', formatted: 'Charlotte, NC' },
  { city: 'Raleigh', state: 'NC', stateFull: 'North Carolina', formatted: 'Raleigh, NC' },
  { city: 'Durham', state: 'NC', stateFull: 'North Carolina', formatted: 'Durham, NC' },
  { city: 'Asheville', state: 'NC', stateFull: 'North Carolina', formatted: 'Asheville, NC' },
  { city: 'Charleston', state: 'SC', stateFull: 'South Carolina', formatted: 'Charleston, SC' },
  { city: 'Columbia', state: 'SC', stateFull: 'South Carolina', formatted: 'Columbia, SC' },
  { city: 'Greenville', state: 'SC', stateFull: 'South Carolina', formatted: 'Greenville, SC' },
  { city: 'Richmond', state: 'VA', stateFull: 'Virginia', formatted: 'Richmond, VA' },
  { city: 'Virginia Beach', state: 'VA', stateFull: 'Virginia', formatted: 'Virginia Beach, VA' },
  { city: 'Arlington', state: 'VA', stateFull: 'Virginia', formatted: 'Arlington, VA' },
  { city: 'Alexandria', state: 'VA', stateFull: 'Virginia', formatted: 'Alexandria, VA' },
  { city: 'Washington', state: 'DC', stateFull: 'District of Columbia', formatted: 'Washington, DC' },
  { city: 'Baltimore', state: 'MD', stateFull: 'Maryland', formatted: 'Baltimore, MD' },
  { city: 'Louisville', state: 'KY', stateFull: 'Kentucky', formatted: 'Louisville, KY' },
  { city: 'Lexington', state: 'KY', stateFull: 'Kentucky', formatted: 'Lexington, KY' },
  { city: 'Birmingham', state: 'AL', stateFull: 'Alabama', formatted: 'Birmingham, AL' },
  { city: 'Huntsville', state: 'AL', stateFull: 'Alabama', formatted: 'Huntsville, AL' },

  // Midwest
  { city: 'Chicago', state: 'IL', stateFull: 'Illinois', formatted: 'Chicago, IL' },
  { city: 'Evanston', state: 'IL', stateFull: 'Illinois', formatted: 'Evanston, IL' },
  { city: 'Naperville', state: 'IL', stateFull: 'Illinois', formatted: 'Naperville, IL' },
  { city: 'Minneapolis', state: 'MN', stateFull: 'Minnesota', formatted: 'Minneapolis, MN' },
  { city: 'St. Paul', state: 'MN', stateFull: 'Minnesota', formatted: 'St. Paul, MN' },
  { city: 'Milwaukee', state: 'WI', stateFull: 'Wisconsin', formatted: 'Milwaukee, WI' },
  { city: 'Madison', state: 'WI', stateFull: 'Wisconsin', formatted: 'Madison, WI' },
  { city: 'Detroit', state: 'MI', stateFull: 'Michigan', formatted: 'Detroit, MI' },
  { city: 'Ann Arbor', state: 'MI', stateFull: 'Michigan', formatted: 'Ann Arbor, MI' },
  { city: 'Grand Rapids', state: 'MI', stateFull: 'Michigan', formatted: 'Grand Rapids, MI' },
  { city: 'Indianapolis', state: 'IN', stateFull: 'Indiana', formatted: 'Indianapolis, IN' },
  { city: 'Bloomington', state: 'IN', stateFull: 'Indiana', formatted: 'Bloomington, IN' },
  { city: 'Columbus', state: 'OH', stateFull: 'Ohio', formatted: 'Columbus, OH' },
  { city: 'Cleveland', state: 'OH', stateFull: 'Ohio', formatted: 'Cleveland, OH' },
  { city: 'Cincinnati', state: 'OH', stateFull: 'Ohio', formatted: 'Cincinnati, OH' },
  { city: 'Kansas City', state: 'MO', stateFull: 'Missouri', formatted: 'Kansas City, MO' },
  { city: 'St. Louis', state: 'MO', stateFull: 'Missouri', formatted: 'St. Louis, MO' },
  { city: 'Omaha', state: 'NE', stateFull: 'Nebraska', formatted: 'Omaha, NE' },
  { city: 'Des Moines', state: 'IA', stateFull: 'Iowa', formatted: 'Des Moines, IA' },
  { city: 'Iowa City', state: 'IA', stateFull: 'Iowa', formatted: 'Iowa City, IA' },
  { city: 'Wichita', state: 'KS', stateFull: 'Kansas', formatted: 'Wichita, KS' },
  { city: 'Oklahoma City', state: 'OK', stateFull: 'Oklahoma', formatted: 'Oklahoma City, OK' },
  { city: 'Tulsa', state: 'OK', stateFull: 'Oklahoma', formatted: 'Tulsa, OK' },

  // Northeast & Mid-Atlantic
  { city: 'New York', state: 'NY', stateFull: 'New York', formatted: 'New York, NY' },
  { city: 'Brooklyn', state: 'NY', stateFull: 'New York', formatted: 'Brooklyn, NY' },
  { city: 'Queens', state: 'NY', stateFull: 'New York', formatted: 'Queens, NY' },
  { city: 'Manhattan', state: 'NY', stateFull: 'New York', formatted: 'Manhattan, NY' },
  { city: 'Buffalo', state: 'NY', stateFull: 'New York', formatted: 'Buffalo, NY' },
  { city: 'Rochester', state: 'NY', stateFull: 'New York', formatted: 'Rochester, NY' },
  { city: 'Albany', state: 'NY', stateFull: 'New York', formatted: 'Albany, NY' },
  { city: 'Syracuse', state: 'NY', stateFull: 'New York', formatted: 'Syracuse, NY' },
  { city: 'Ithaca', state: 'NY', stateFull: 'New York', formatted: 'Ithaca, NY' },
  { city: 'Boston', state: 'MA', stateFull: 'Massachusetts', formatted: 'Boston, MA' },
  { city: 'Cambridge', state: 'MA', stateFull: 'Massachusetts', formatted: 'Cambridge, MA' },
  { city: 'Somerville', state: 'MA', stateFull: 'Massachusetts', formatted: 'Somerville, MA' },
  { city: 'Worcester', state: 'MA', stateFull: 'Massachusetts', formatted: 'Worcester, MA' },
  { city: 'Salem', state: 'MA', stateFull: 'Massachusetts', formatted: 'Salem, MA' },
  { city: 'Philadelphia', state: 'PA', stateFull: 'Pennsylvania', formatted: 'Philadelphia, PA' },
  { city: 'Pittsburgh', state: 'PA', stateFull: 'Pennsylvania', formatted: 'Pittsburgh, PA' },
  { city: 'Providence', state: 'RI', stateFull: 'Rhode Island', formatted: 'Providence, RI' },
  { city: 'New Haven', state: 'CT', stateFull: 'Connecticut', formatted: 'New Haven, CT' },
  { city: 'Hartford', state: 'CT', stateFull: 'Connecticut', formatted: 'Hartford, CT' },
  { city: 'Stamford', state: 'CT', stateFull: 'Connecticut', formatted: 'Stamford, CT' },
  { city: 'Jersey City', state: 'NJ', stateFull: 'New Jersey', formatted: 'Jersey City, NJ' },
  { city: 'Hoboken', state: 'NJ', stateFull: 'New Jersey', formatted: 'Hoboken, NJ' },
  { city: 'Newark', state: 'NJ', stateFull: 'New Jersey', formatted: 'Newark, NJ' },
  { city: 'Princeton', state: 'NJ', stateFull: 'New Jersey', formatted: 'Princeton, NJ' },
  { city: 'Burlington', state: 'VT', stateFull: 'Vermont', formatted: 'Burlington, VT' },
  { city: 'Portland', state: 'ME', stateFull: 'Maine', formatted: 'Portland, ME' },
  { city: 'Portsmouth', state: 'NH', stateFull: 'New Hampshire', formatted: 'Portsmouth, NH' },
  { city: 'Wilmington', state: 'DE', stateFull: 'Delaware', formatted: 'Wilmington, DE' },
];

/**
 * Searches city list by query string (case-insensitive)
 * Matches city name, state abbreviation, or full state name.
 * Ranks exact matches and prefix matches highest.
 */
export function searchCities(query: string, maxResults: number = 8): CityLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Parse comma if user types "Austin, TX" or "Austin TX"
  const cleanQ = q.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = cleanQ.split(' ');

  const exactMatches: CityLocation[] = [];
  const cityPrefixMatches: CityLocation[] = [];
  const wordMatches: CityLocation[] = [];
  const stateOrContainsMatches: CityLocation[] = [];

  const seen = new Set<string>();

  for (const item of US_CITIES) {
    const cityNameLower = item.city.toLowerCase();
    const formattedLower = item.formatted.toLowerCase();
    const stateLower = item.state.toLowerCase();
    const stateFullLower = item.stateFull.toLowerCase();

    // Check if matches query
    if (
      cityNameLower === q ||
      formattedLower === q ||
      formattedLower === cleanQ
    ) {
      if (!seen.has(item.formatted)) {
        seen.add(item.formatted);
        exactMatches.push(item);
      }
    } else if (cityNameLower.startsWith(q) || formattedLower.startsWith(cleanQ)) {
      if (!seen.has(item.formatted)) {
        seen.add(item.formatted);
        cityPrefixMatches.push(item);
      }
    } else if (
      cityNameLower.includes(q) ||
      formattedLower.includes(cleanQ) ||
      (parts.length > 1 && parts.every((p) => formattedLower.includes(p)))
    ) {
      if (!seen.has(item.formatted)) {
        seen.add(item.formatted);
        wordMatches.push(item);
      }
    } else if (
      (q.length >= 2 && stateLower === q) ||
      stateFullLower.startsWith(q)
    ) {
      if (!seen.has(item.formatted)) {
        seen.add(item.formatted);
        stateOrContainsMatches.push(item);
      }
    }
  }

  const combined = [
    ...exactMatches,
    ...cityPrefixMatches,
    ...wordMatches,
    ...stateOrContainsMatches,
  ];

  return combined.slice(0, maxResults);
}
