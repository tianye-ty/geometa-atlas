import type { Category, CountryProfile } from './types'

export const CATEGORY_META: Record<Category, { label: string; short: string }> = {
  all: { label: 'All clues', short: 'ALL' },
  bollards: { label: 'Bollards', short: 'BOL' },
  roadMarkings: { label: 'Road markings', short: 'RD' },
  plates: { label: 'License plates', short: 'PLT' },
  utilityPoles: { label: 'Utility poles', short: 'POL' },
  signs: { label: 'Signs & language', short: 'SGN' },
  googleCar: { label: 'Google car', short: 'CAR' },
}

const plonk = (slug: string) => ({ name: 'Plonk It Guide', url: `https://www.plonkit.net/${slug}` })
const geoTips = { name: 'GeoTips', url: 'https://geotips.net/' }

export const PROFILES: Record<string, CountryProfile> = {
  Philippines: {
    name: 'Philippines', localName: 'Philippines', flag: '🇵🇭', region: 'Southeast Asia', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: {
      driving: { label: 'Driving side', value: 'Right-hand traffic' },
      script: { label: 'Language', value: 'English and Filipino; Latin script' },
      climate: { label: 'Climate', value: 'Tropical vegetation' },
      roadSurface: { label: 'Road surface', value: 'Concrete slab roads are common' },
      plates: { label: 'Plate appearance', value: 'Usually light plates with dark text' },
    },
    clues: [
      { id: 'ph-road', category: 'roadMarkings', title: "Start with right-hand traffic", description: "Confirm with moving vehicles; useful when comparing with Malaysia.", reliability: 'Identification', source: plonk('philippines') },
      { id: 'ph-poles', category: 'utilityPoles', title: "Square concrete utility poles", description: "Concrete poles and dense wiring are supporting clues; similar poles exist elsewhere.", reliability: 'Supporting clue', source: { name: 'GeoCoach Philippines', url: 'https://www.geocoach.me/theory/philippines/identify' } },
      { id: 'ph-signs', category: 'signs', title: "English and Filipino text", description: "Read shops and public notices, and combine language with traffic direction.", reliability: 'Identification', source: plonk('philippines') },
      { id: 'ph-car', category: 'googleCar', title: "Regional capture vehicles", description: "Check the source guide for local car clues; coverage changes over time.", reliability: 'Regional clue', source: plonk('philippines') },
    ],
  },
  Malaysia: {
    name: 'Malaysia', localName: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: {
      driving: { label: 'Driving side', value: 'Left-hand traffic' },
      script: { label: 'Language', value: 'Malay and English; Latin script' },
      climate: { label: 'Climate', value: 'Tropical vegetation' },
      roadSurface: { label: 'Road surface', value: 'Asphalt roads are common' },
      plates: { label: 'Plate appearance', value: 'Dark plates with light text are common' },
    },
    clues: [
      { id: 'my-road', category: 'roadMarkings', title: "Left-hand traffic", description: "A strong first distinction from the Philippines.", reliability: 'Identification', source: plonk('malaysia') },
      { id: 'my-poles', category: 'utilityPoles', title: "Dark pole labels", description: "Useful especially on the peninsula; absence is not an exclusion clue.", reliability: 'Regional clue', source: plonk('malaysia') },
      { id: 'my-signs', category: 'signs', title: "Malay road names", description: "Look for Jalan in road names. English and other languages also occur.", reliability: 'Identification', source: plonk('malaysia') },
      { id: 'my-plates', category: 'plates', title: "Dark license plates", description: "Light text on a dark background is common. Confirm with language and traffic.", reliability: 'Supporting clue', source: plonk('malaysia') },
    ],
  },
  France: {
    name: 'France', localName: 'France', flag: '🇫🇷', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'French; Latin script' }, plates: { label: 'Plate appearance', value: 'White plates, often with a blue side band' } },
    clues: [
      { id: 'fr-poles', category: 'utilityPoles', title: "Concrete poles with openings", description: "Study the pole shape alongside road furniture and text.", reliability: 'Supporting clue', source: plonk('france') },
      { id: 'fr-bollards', category: 'bollards', title: "French bollards", description: "Compare white posts and dark reflector panels; designs vary by road.", reliability: 'Identification', source: plonk('france') },
      { id: 'fr-signs', category: 'signs', title: "French text and road numbers", description: "Place names and D or N route numbers can reinforce a guess.", reliability: 'Identification', source: plonk('france') },
    ],
  },
  Germany: {
    name: 'Germany', localName: 'Germany', flag: '🇩🇪', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'German; Latin script' }, plates: { label: 'Plate appearance', value: 'White plates, often with a blue side band' } },
    clues: [
      { id: 'de-bollard', category: 'bollards', title: "Black rectangular bollard panels", description: "A useful road-furniture clue when combined with language.", reliability: 'Identification', source: plonk('germany') },
      { id: 'de-sign', category: 'signs', title: "German words and characters", description: "Look for ß, ä, ö and ü, then confirm with independent clues.", reliability: 'Identification', source: plonk('germany') },
    ],
  },
  'United Kingdom': {
    name: 'United Kingdom', localName: 'United Kingdom', flag: '🇬🇧', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Left-hand traffic' }, script: { label: 'Language', value: 'English; Latin script' }, plates: { label: 'Plate appearance', value: 'White front; yellow rear' } },
    clues: [
      { id: 'gb-plates', category: 'plates', title: "Yellow rear plates", description: "Rear plates often appear yellow; combine with left-hand traffic.", reliability: 'Identification', source: plonk('uk') },
      { id: 'gb-road', category: 'roadMarkings', title: "Left-hand traffic", description: "Observe moving traffic, junctions and roundabout arrows.", reliability: 'Identification', source: plonk('uk') },
    ],
  },
  Spain: {
    name: 'Spain', localName: 'Spain', flag: '🇪🇸', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Spanish and regional languages' }, plates: { label: 'Plate appearance', value: 'White plates, often with a blue side band' } },
    clues: [
      { id: 'es-bollard', category: 'bollards', title: "Spanish roadside bollards", description: "Compare reflector panels with Portugal and other neighbors.", reliability: 'Identification', source: plonk('spain') },
      { id: 'es-sign', category: 'signs', title: "Spanish and regional languages", description: "Look for ñ; Catalan and other regional languages also occur.", reliability: 'Supporting clue', source: plonk('spain') },
    ],
  },
  Portugal: {
    name: 'Portugal', localName: 'Portugal', flag: '🇵🇹', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Portuguese; Latin script' }, plates: { label: 'Plate appearance', value: 'White plates, often with a blue side band' } },
    clues: [
      { id: 'pt-road', category: 'roadMarkings', title: "Urban stone paving", description: "Black-and-white stone paving can support an urban guess.", reliability: 'Supporting clue', source: plonk('portugal') },
      { id: 'pt-sign', category: 'signs', title: "Portuguese characters", description: "Combinations containing ã, õ and ç can help distinguish Portuguese.", reliability: 'Identification', source: plonk('portugal') },
    ],
  },
  Italy: {
    name: 'Italy', localName: 'Italy', flag: '🇮🇹', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Italian; Latin script' }, plates: { label: 'Plate appearance', value: 'White plates, often with blue bands at both ends' } },
    clues: [
      { id: 'it-plates', category: 'plates', title: "Blue bands at both ends", description: "Some plates have blue bands at both ends; blur makes this a supporting clue.", reliability: 'Supporting clue', source: plonk('italy') },
      { id: 'it-bollard', category: 'bollards', title: "Italian roadside bollards", description: "Inspect the post shape and reflector panel; neighbors can look similar.", reliability: 'Identification', source: plonk('italy') },
    ],
  },
  Netherlands: {
    name: 'Netherlands', localName: 'Netherlands', flag: '🇳🇱', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Dutch; Latin script' }, plates: { label: 'Plate appearance', value: 'Yellow plates' } },
    clues: [
      { id: 'nl-plates', category: 'plates', title: "Yellow license plates", description: "Yellow plates at both ends are a valuable clue.", reliability: 'Identification', source: plonk('netherlands') },
      { id: 'nl-road', category: 'roadMarkings', title: "Red bicycle paths", description: "Cycle infrastructure, flat terrain and red surfaces can reinforce one another.", reliability: 'Identification', source: plonk('netherlands') },
    ],
  },
  Norway: {
    name: 'Norway', localName: 'Norway', flag: '🇳🇴', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Norwegian; æ / ø / å' }, roadLines: { label: 'Road markings', value: 'Yellow center lines are common' } },
    clues: [
      { id: 'no-road', category: 'roadMarkings', title: "Yellow center lines", description: "Useful when comparing with Sweden; road types vary.", reliability: 'Identification', source: plonk('norway') },
      { id: 'no-sign', category: 'signs', title: "Norwegian letters", description: "Look for ø and å alongside terrain and road clues.", reliability: 'Supporting clue', source: plonk('norway') },
    ],
  },
  Sweden: {
    name: 'Sweden', localName: 'Sweden', flag: '🇸🇪', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Swedish; å / ä / ö' }, roadLines: { label: 'Road markings', value: 'White center lines are common' } },
    clues: [
      { id: 'se-road', category: 'roadMarkings', title: "White center lines", description: "A useful contrast with Norway's often-yellow center lines.", reliability: 'Identification', source: plonk('sweden') },
      { id: 'se-bollard', category: 'bollards', title: "Nordic reflector details", description: "Inspect the reflector and panel; forest scenery alone is inconclusive.", reliability: 'Supporting clue', source: plonk('sweden') },
    ],
  },
  Finland: {
    name: 'Finland', localName: 'Finland', flag: '🇫🇮', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Finnish; double vowels are common' }, roadLines: { label: 'Road markings', value: 'White road markings' } },
    clues: [
      { id: 'fi-sign', category: 'signs', title: "Finnish words", description: "Double vowels, ä and ö can help. Swedish occurs in some regions.", reliability: 'Identification', source: plonk('finland') },
      { id: 'fi-road', category: 'roadMarkings', title: "Flat forest roads", description: "Combine markings and road furniture with forest and lake terrain.", reliability: 'Supporting clue', source: plonk('finland') },
    ],
  },
  Ireland: {
    name: 'Ireland', localName: 'Ireland', flag: '🇮🇪', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Left-hand traffic' }, script: { label: 'Language', value: 'English and Irish' }, plates: { label: 'Plate appearance', value: 'Usually white front and rear plates' } },
    clues: [
      { id: 'ie-road', category: 'roadMarkings', title: "Left-hand traffic", description: "Use plates and road furniture to distinguish Ireland from the UK.", reliability: 'Identification', source: plonk('ireland') },
      { id: 'ie-sign', category: 'signs', title: "Bilingual signs", description: "Irish and English together are a valuable language clue.", reliability: 'Identification', source: plonk('ireland') },
    ],
  },
  Poland: {
    name: 'Poland', localName: 'Poland', flag: '🇵🇱', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'Polish; ł / ą / ę / ż' }, plates: { label: 'Plate appearance', value: 'White plates, often with a blue side band' } },
    clues: [
      { id: 'pl-sign', category: 'signs', title: "Polish characters", description: "Look for ł, ą, ę and ż, plus combinations such as cz and sz.", reliability: 'Identification', source: plonk('poland') },
      { id: 'pl-poles', category: 'utilityPoles', title: "Concrete utility poles", description: "Similar poles occur across Central Europe; confirm with language.", reliability: 'Supporting clue', source: plonk('poland') },
    ],
  },
  Switzerland: {
    name: 'Switzerland', localName: 'Switzerland', flag: '🇨🇭', region: 'Europe', level: 'Starter guide',
    summary: 'Use several independent clues to build your country guess. Start with traffic direction, then compare language and roadside details.',
    traits: { driving: { label: 'Driving side', value: 'Right-hand traffic' }, script: { label: 'Language', value: 'German / French / Italian' }, plates: { label: 'Plate appearance', value: 'Compact rear plates are common' } },
    clues: [
      { id: 'ch-plates', category: 'plates', title: "Compact rear plates", description: "Short or narrow rear plates can support a guess alongside other clues.", reliability: 'Supporting clue', source: plonk('switzerland') },
      { id: 'ch-sign', category: 'signs', title: "Several language regions", description: "German, French and Italian occur in different regions.", reliability: 'Identification', source: plonk('switzerland') },
    ],
  },
}

export const GENERAL_SOURCES = [
  { name: 'Plonk It Guide', url: 'https://www.plonkit.net/guide' },
  geoTips,
]

export const DEFAULT_COUNTRY = 'France'
