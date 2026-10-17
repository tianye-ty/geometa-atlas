import type { ClueCategory } from './types'
export interface VisualReference { country: string; category: ClueCategory; title: string; image: string; quote?: string; guide: string; location?: string; photo?: {url:string;author:string;page:string;license:string;licenseUrl:string} }
const ref = (country: string, category: ClueCategory, title: string, file: string, quote: string | undefined, location?: string): VisualReference => ({ country, category, title, image: `https://www.plonkit.net/images/${country.toLowerCase()}/${file}`, quote, guide: `https://www.plonkit.net/${country.toLowerCase()}`, location })
// Selected source-hosted examples, not a mirror of the publisher's library.
export const VISUAL_REFERENCES: VisualReference[] = [
 ref('France','bollards','French bollard','Bollard.png', 'a round white post with a pointed top', 'https://goo.gl/maps/umpqYFC9twDST7Qw9'),
 ref('France','utilityPoles','Ladder poles','Ladder_poles.png','Concrete poles with step-like indents are common in France.', 'https://goo.gl/maps/cYtpBcr8fPxdawT1A'),
 ref('Germany','bollards','German bollards','Germany_Bollard_v2.png','Germany uses these black and white bollards, with white and light-grey reflectors.', 'https://goo.gl/maps/pM4aUT6nYxs5sFtr6'),
 ref('Philippines','roadMarkings','Concrete roads','1_concreteroad.png','Concrete roads are extremely common in the Philippines.', 'https://goo.gl/maps/FgRvzDJXeHmsLgXf7'),
 ref('Philippines','utilityPoles','Octagonal metal poles','1_octopole.png','Octagonal metal poles are quite common in the Philippines.', 'https://goo.gl/maps/HpjZEr6E6bi1PLGh8'),
 ref('Malaysia','utilityPoles','Pole stickers','Untitled_design__2825_29.png','Electricity poles in Malaysia often have black or white stickers on them.', 'https://goo.gl/maps/FR7u5xsdejfe3Qp8A'),
 ref('Malaysia','bollards','Malaysian bollard examples','Untitled_design__2823_29.png',undefined, 'https://goo.gl/maps/VF2uZG1qdY85Aw9Z9'),
]
VISUAL_REFERENCES[0].photo = { url:'https://upload.wikimedia.org/wikipedia/commons/1/17/French_Bollard.png',author:'Slavuska Shabliy',page:'https://commons.wikimedia.org/wiki/File:French_Bollard.png',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/' }
VISUAL_REFERENCES[2].photo = { url:'https://upload.wikimedia.org/wikipedia/commons/0/01/Leitpfosten_am_Oberd%C3%BCsseler_Weg_20160710_17.jpg',author:'Sebastian Rittau',page:'https://commons.wikimedia.org/wiki/File:Leitpfosten_am_Oberd%C3%BCsseler_Weg_20160710_17.jpg',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/' }
