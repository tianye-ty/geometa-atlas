// A starter learning selection, not an authoritative Street View coverage list.
import {ROAD_COVERAGE} from './coverage'
export const DEFAULT_STUDY = [...new Set([...ROAD_COVERAGE,'Cyprus','Georgia','Greenland','Lebanon','Nepal','Palestine','Paraguay','Qatar','São Tomé and Principe','Guernsey','Jersey','Isle of Man','Faeroe Is.','Gibraltar','Hong Kong','Macao','Puerto Rico','Guam','N. Mariana Is.','American Samoa','Curaçao','Réunion'])]
export type MapView = 'study'|'all'|'notes'
export type MapClue = {country:string;title:string;body:string;image?:string;source:'My note'|'Guide';regionIds?:string[];regionId?:string}
export function previewClue(clues:MapClue[],country:string,region:string|null){
 const found=clues.filter(c=>c.country===country&&(!region||!(c.regionIds?.length||c.regionId)||(c.regionIds??[c.regionId]).includes(region)))
 return found.find(c=>c.source==='My note'&&c.image)??found.find(c=>c.source==='My note')??found.find(c=>c.image)??found[0]
}
export function isMuted(country:string,view:MapView,study:string[],noted:Set<string>){return view==='study'?!study.includes(country):view==='notes'?!noted.has(country):false}
