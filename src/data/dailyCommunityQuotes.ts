export interface DailyCommunityQuote {
  id: string;
  type: 'slogan' | 'pun' | 'fact';
  title: string;
  detail: string;
  shortTagline: string; // Compact version suitable for logo subtitle or small pills
  authorOrSource?: string;
}

// Interleaved list: Slogan -> Pun -> Fact -> Slogan -> Pun -> Fact...
// Ensures that on any given day, exactly one item is featured, alternating naturally daily.
export const DAILY_COMMUNITY_QUOTES: DailyCommunityQuote[] = [
  // Day 1: Slogan
  {
    id: 'slogan-1',
    type: 'slogan',
    title: 'Less MOOP on the street, more spring in your feet.',
    detail: 'Turn your daily stroll into a neighborhood glow-up—scoop up Matter Out Of Place and leave your block shining.',
    shortTagline: 'Less MOOP, More Spring in Your Step',
    authorOrSource: 'MOOP Community',
  },
  // Day 2: Pun
  {
    id: 'pun-1',
    type: 'pun',
    title: 'Litter-ally the best thing you can do for your block today.',
    detail: 'Grab that reacher—it is time to talk trash and take positive action!',
    shortTagline: 'Litter-ally The Best Walk',
    authorOrSource: 'Street Puns',
  },
  // Day 3: Fact
  {
    id: 'fact-1',
    type: 'fact',
    title: 'MOOP stands for “Matter Out Of Place”.',
    detail: 'Popularized by Leave No Trace and the outdoor community, it recognizes that trash is simply everyday matter located where it doesn’t belong in nature and shared public spaces.',
    shortTagline: 'Matter Out Of Place',
    authorOrSource: 'Etymology & LNT History',
  },

  // Day 4: Slogan
  {
    id: 'slogan-2',
    type: 'slogan',
    title: 'Leave no trace. Anywhere.',
    detail: 'From mountain trails to city sidewalks, treating urban streets with the same reverence as national parks.',
    shortTagline: 'Leave No Trace. Anywhere.',
    authorOrSource: 'Core Motto',
  },
  // Day 5: Pun
  {
    id: 'pun-2',
    type: 'pun',
    title: 'Trash talk that actually helps the neighborhood.',
    detail: 'Spreading the gossip on how clean your block looks after this morning’s route.',
    shortTagline: 'Wholesome Trash Talk',
    authorOrSource: 'Clean Team Banter',
  },
  // Day 6: Fact
  {
    id: 'fact-2',
    type: 'fact',
    title: 'Over 80% of ocean plastic begins its journey as street litter.',
    detail: 'Urban gutters feed directly into storm drains, which flow untreated into bays and coastal waterways. Street cleaning is frontline ocean conservation.',
    shortTagline: '80% of Ocean Plastic Starts on Streets',
    authorOrSource: 'UN Environment Programme',
  },

  // Day 7: Slogan
  {
    id: 'slogan-3',
    type: 'slogan',
    title: 'Clean sidewalks make kind neighbors.',
    detail: 'A clean block is contagious. When one neighbor takes pride, the whole avenue feels brighter, friendlier, and safer.',
    shortTagline: 'Clean Sidewalks, Kind Neighbors',
    authorOrSource: 'Neighborhood Ethos',
  },
  // Day 8: Pun
  {
    id: 'pun-3',
    type: 'pun',
    title: 'Give a reacher a chance.',
    detail: 'All we are saying is give street cleanups a grab. Mechanical reachers make litter picking addictive fun.',
    shortTagline: 'Give Reachers a Chance',
    authorOrSource: 'Litter Grabber Guild',
  },
  // Day 9: Fact
  {
    id: 'fact-3',
    type: 'fact',
    title: 'Cigarette butts take up to 10–12 years to break down.',
    detail: 'Filters are made from cellulose acetate plastic fibers, not paper. They are the single most frequently littered item on urban sidewalks worldwide.',
    shortTagline: 'Butts Take 10+ Years to Degrade',
    authorOrSource: 'Ocean Conservancy',
  },

  // Day 10: Slogan
  {
    id: 'slogan-4',
    type: 'slogan',
    title: 'Every wrapper scooped is a block renewed.',
    detail: 'You do not need a city fleet to make a difference—just a grabber, a bag, and fifteen mindful minutes.',
    shortTagline: 'Every Wrapper Scooped Counts',
    authorOrSource: 'Street Stewards',
  },
  // Day 11: Pun
  {
    id: 'pun-4',
    type: 'pun',
    title: 'Our love for clean streets is bin-credible!',
    detail: 'We wheelie love seeing spotless gutters and properly sorted recycling.',
    shortTagline: 'Bin-credible Clean Walks',
    authorOrSource: 'Eco Humor',
  },
  // Day 12: Fact
  {
    id: 'fact-4',
    type: 'fact',
    title: 'Picking up 3 pieces of litter daily stops over 1,000 items a year.',
    detail: 'The “Take 3 for the Sea” principle proves that small individual micro-habits compound into massive environmental barriers over a single year.',
    shortTagline: '3 Items Daily = 1,000+ Kept Out of Storm Drains',
    authorOrSource: 'Environmental Impact Data',
  },

  // Day 13: Slogan
  {
    id: 'slogan-5',
    type: 'slogan',
    title: 'Keep the Bay clean, one block at a time.',
    detail: 'Every piece of street litter prevented from entering city storm drains is a victory for our bay and ocean wildlife.',
    shortTagline: 'Keep the Bay Clean',
    authorOrSource: 'Bay Area Conservation',
  },
  // Day 14: Pun
  {
    id: 'pun-5',
    type: 'pun',
    title: 'Don’t refuse to reuse: refuse more refuse.',
    detail: 'A tongue-twister that keeps thousands of disposable cups and wrappers off the curb.',
    shortTagline: 'Refuse The Refuse',
    authorOrSource: 'Zero Waste Wordplay',
  },
  // Day 15: Fact
  {
    id: 'fact-5',
    type: 'fact',
    title: 'Clean blocks experience less illegal dumping by up to 75%.',
    detail: 'Studies in urban psychology show that clean, well-cared-for blocks deter littering, while neglected corners rapidly attract compounding trash.',
    shortTagline: 'Clean Blocks Deter New Litter by 75%',
    authorOrSource: 'Keep America Beautiful Studies',
  },

  // Day 16: Slogan
  {
    id: 'slogan-6',
    type: 'slogan',
    title: 'Pack it in, pick it up, pass it on.',
    detail: 'The simplest habit: always carry out what you bring, pick up one stray item you spot, and inspire the next walker.',
    shortTagline: 'Pack In, Pick Up, Pass On',
    authorOrSource: 'Urban Stewardship',
  },
  // Day 17: Pun
  {
    id: 'pun-6',
    type: 'pun',
    title: 'No MOOP, no problem.',
    detail: 'When the block is so clean you have to walk three extra streets just to find a single bottle cap.',
    shortTagline: 'No MOOP, No Problem',
    authorOrSource: 'Block Cleaners',
  },
  // Day 18: Fact
  {
    id: 'fact-6',
    type: 'fact',
    title: 'San Francisco street sweepers cover over 150,000 curb miles yearly.',
    detail: 'While municipal sweepers cover arterial streets, narrow sidewalks and residential curbs rely heavily on community stewards for corner-to-corner perfection.',
    shortTagline: 'SF Sweeps 150k Miles Annually',
    authorOrSource: 'SF Public Works',
  },

  // Day 19: Slogan
  {
    id: 'slogan-7',
    type: 'slogan',
    title: 'Your daily walk, our neighborhood’s clean canvas.',
    detail: 'Combine your daily cardio with micro-cleanups. 2,000 steps and 20 pieces of MOOP make an immediate impact.',
    shortTagline: 'Walk Daily, Shine Always',
    authorOrSource: 'Walk & Clean Club',
  },
  // Day 20: Pun
  {
    id: 'pun-7',
    type: 'pun',
    title: 'We’re not trashy, we’re classy.',
    detail: 'Walking with swagger, a bucket, and a heart full of neighborhood love.',
    shortTagline: 'Classy, Never Trashy',
    authorOrSource: 'Curb Enthusiasts',
  },
  // Day 21: Fact
  {
    id: 'fact-7',
    type: 'fact',
    title: 'Aluminum cans can be recycled and back on a shelf in 60 days.',
    detail: 'Recycling an aluminum beverage can saves 95% of the energy needed to make a new one from bauxite ore. Every can picked up on a walk is pure energy saved.',
    shortTagline: 'Aluminum Recycles in Just 60 Days',
    authorOrSource: 'The Aluminum Association',
  },

  // Day 22: Slogan
  {
    id: 'slogan-8',
    type: 'slogan',
    title: 'Small grabs, monumental blocks.',
    detail: 'Never underestimate the cumulative power of a community that refuses to walk past a stray cup.',
    shortTagline: 'Small Grabs, Big Blocks',
    authorOrSource: 'Block Captains',
  },
  // Day 23: Pun
  {
    id: 'pun-8',
    type: 'pun',
    title: 'We’ve got street cred because our street’s cleared.',
    detail: 'True neighborhood status: everyone waves when they see your reacher in hand.',
    shortTagline: 'Street Cred via Clean Streets',
    authorOrSource: 'Corner Legends',
  },
  // Day 24: Fact
  {
    id: 'fact-8',
    type: 'fact',
    title: 'Urban trees grow healthier when tree basins are kept free of MOOP.',
    detail: 'Street tree wells choked with plastic wrappers and cigarette chemicals suffer from soil compaction and toxic runoff, hindering root oxygen exchange.',
    shortTagline: 'Clean Tree Basins Protect Urban Canopy',
    authorOrSource: 'Urban Forestry Research',
  },

  // Day 25: Slogan
  {
    id: 'slogan-9',
    type: 'slogan',
    title: 'Pride in our pavement, respect in our footsteps.',
    detail: 'San Francisco’s hills and alleys belong to all of us. Let’s treat every curb with dignity.',
    shortTagline: 'Pride in Our Pavement',
    authorOrSource: 'SF Clean Team',
  },
  // Day 26: Pun
  {
    id: 'pun-9',
    type: 'pun',
    title: 'You can’t bottle our enthusiasm—we already recycled it.',
    detail: 'Aluminum cans, glass jars, and plastic caps: sorted, recycled, and returned to life.',
    shortTagline: 'Recycled Enthusiasm',
    authorOrSource: 'Green Walkers',
  },
  // Day 27: Fact
  {
    id: 'fact-9',
    type: 'fact',
    title: 'Walking with a litter reacher burns 25% more calories than standard walking.',
    detail: 'The periodic bending, pausing, arm extension, and balance adjustments turn an ordinary neighborhood walk into functional low-impact cross-training.',
    shortTagline: 'Reacher Walks Burn +25% More Calories',
    authorOrSource: 'Fitness & Physical Activity Metrics',
  },

  // Day 28: Slogan
  {
    id: 'slogan-10',
    type: 'slogan',
    title: 'Be the neighbor Mr. Rogers knew you could be.',
    detail: 'Caring for your shared street is the highest form of everyday civic kindness.',
    shortTagline: 'Good Neighbor Energy',
    authorOrSource: 'Civic Pride',
  },
  // Day 29: Pun
  {
    id: 'pun-10',
    type: 'pun',
    title: 'Pleased to sweep you!',
    detail: 'Greeting fellow neighbors as you sweep through the avenue with purpose.',
    shortTagline: 'Pleased to Sweep You',
    authorOrSource: 'Broom Brigade',
  },
  // Day 30: Fact
  {
    id: 'fact-10',
    type: 'fact',
    title: 'A clean street increases pedestrian foot traffic to local neighborhood shops.',
    detail: 'Pedestrians linger longer and visit local merchant corridors when sidewalks feel pristine, fragrant, and welcoming.',
    shortTagline: 'Clean Streets Boost Local Small Businesses',
    authorOrSource: 'Main Street America Studies',
  },
];

/**
 * Returns the deterministic single quote of the day based on the calendar date.
 * Exactly ONE item per day (alternating between a slogan, a pun, or a fact).
 */
export function getDailyQuote(date = new Date()): DailyCommunityQuote {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % DAILY_COMMUNITY_QUOTES.length;
  return DAILY_COMMUNITY_QUOTES[index];
}
