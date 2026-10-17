import SPAIN_PROVINCES from './spainProvinceNames.json' with {type:'json'}
import type {Note} from './types'
export const FRANCE_REGIONS = [
 {id:'FR-11',name:'Île-de-France',aliases:['Ile-de-France']},
 {id:'FR-24',name:'Centre-Val de Loire',aliases:[]},
 {id:'FR-27',name:'Bourgogne-Franche-Comté',aliases:['Burgundy-Franche-Comté']},
 {id:'FR-28',name:'Normandy',aliases:['Normandie']},
 {id:'FR-32',name:'Hauts-de-France',aliases:[]},
 {id:'FR-44',name:'Grand Est',aliases:[]},
 {id:'FR-52',name:'Pays de la Loire',aliases:[]},
 {id:'FR-53',name:'Brittany',aliases:['Bretagne']},
 {id:'FR-75',name:'Nouvelle-Aquitaine',aliases:[]},
 {id:'FR-76',name:'Occitanie',aliases:[]},
 {id:'FR-84',name:'Auvergne-Rhône-Alpes',aliases:[]},
 {id:'FR-93',name:"Provence-Alpes-Côte d’Azur",aliases:["Provence-Alpes-Côte d'Azur"]},
 {id:'FR-94',name:'Corsica',aliases:['Corse']},
]
export const hasRegions=(country:string)=>country==='France'||country==='Spain'
export const regionsFor=(country:string)=>country==='Spain'?SPAIN_PROVINCES:country==='France'?FRANCE_REGIONS:[]
export const ALL_REGIONS=[...FRANCE_REGIONS,...SPAIN_PROVINCES]
const normalized=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[’']/g,'')
export const regionName=(id:string)=>ALL_REGIONS.find(r=>r.id===id)?.name??''
export function franceRegionId(text?:string){if(!text)return '';return FRANCE_REGIONS.find(r=>[r.name,...r.aliases].some(n=>normalized(n)===normalized(text)))?.id??''}
export type RegionScope=string|string[]
export function noteRegionIds(note:Pick<Note,'region'|'regionId'|'regionIds'>){return [...new Set(note.regionIds?.length?note.regionIds:note.regionId?[note.regionId]:franceRegionId(note.region)?[franceRegionId(note.region)]:[])]}
export function scopeHasRegions(scope:RegionScope){return Array.isArray(scope)?scope.length>0:!!scope&&scope!=='country-wide'}
export function scopeName(scope:RegionScope){return (Array.isArray(scope)?scope:[scope]).map(regionName).filter(Boolean).join(' + ')}
export function toggleRegionSelection(current:string[],id:string,additive:boolean){if(!additive)return [id];return current.includes(id)?current.filter(r=>r!==id):[...current,id]}
export function matchesRegion(note:Pick<Note,'country'|'region'|'regionId'|'regionIds'>,scope:RegionScope){
 if(!scope||(Array.isArray(scope)&&!scope.length))return true
 const ids=noteRegionIds(note)
 if(scope==='country-wide')return !ids.length&&!note.region?.trim()
 return hasRegions(note.country)&&(Array.isArray(scope)?scope:[scope]).some(id=>ids.includes(id))
}
let request:Promise<GeoJSON.FeatureCollection>|null=null
export function loadFranceRegions(){
 if(!request)request=fetch(import.meta.env.BASE_URL+'france-regions.geojson').then(r=>{if(!r.ok)throw Error('Region boundary download failed');return r.json()}).then((data:GeoJSON.FeatureCollection)=>{
  if(data.type!=='FeatureCollection'||data.features.length!==13)throw Error('Unexpected France boundary data')
  return {...data,features:data.features.map(f=>({...f,properties:{...f.properties,country:'France',regionId:'FR-'+f.properties?.code,name:regionName('FR-'+f.properties?.code)}}))}
 }).catch(error=>{request=null;throw error})
 return request
}
let spainRequest:Promise<GeoJSON.FeatureCollection>|null=null
export function loadSpainRegions(){if(!spainRequest)spainRequest=fetch(import.meta.env.BASE_URL+'spain-provinces.geojson').then(r=>{if(!r.ok)throw Error('Province boundary download failed');return r.json()}).then((data:GeoJSON.FeatureCollection)=>{if(data.features?.length!==52)throw Error('Unexpected province data');return {...data,features:data.features.map(f=>({...f,properties:{...f.properties,country:'Spain'}}))}}).catch(error=>{spainRequest=null;throw error});return spainRequest}

