import {countryLabel} from './countryFlags'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import {countryGeo,COUNTRY_DOTS,countryBounds,ALL_COUNTRIES} from './atlasCountries'
import { countryAt } from './mapHitTest'
import {loadFranceRegions,loadSpainRegions,hasRegions,scopeName} from './franceRegions'
import {safeCountryFill} from './countrySelection'
import {DEFAULT_STUDY,isMuted,previewClue,type MapView,type MapClue} from './mapStudy'
import CountryPicker from './CountryPicker'

maplibregl.setWorkerUrl(workerUrl)
const hitFeatures = countryGeo.features
export const SMALL_COUNTRIES = COUNTRY_DOTS

function FreeMap({ clues=[],notedCountries=[],categoryLabel='All clues',focusRequest,selected,selectedCountries,regionIds=[],regionalMode=false,onRegionPreview,onRegionSelect,onPreview, onSelect }: {clues?:MapClue[];notedCountries?:string[];categoryLabel?:string; focusRequest?:{country:string;nonce:number};selected:string;selectedCountries?:string[];regionIds?:string[];regionalMode?:boolean;onRegionPreview?:(id:string|null)=>void;onRegionSelect?:(id:string,additive:boolean)=>void; onPreview:(c:string|null)=>void; onSelect:(c:string,additive?:boolean)=>void }) {
 const [view,setView]=useState<MapView>('study'),[study,setStudy]=useState<string[]>(()=>{try{const saved=JSON.parse(localStorage.getItem('atlas-study-countries')??'null');if(Array.isArray(saved)&&saved.length&&saved.every(c=>typeof c==='string'&&ALL_COUNTRIES.includes(c)))return saved}catch{}return DEFAULT_STUDY.filter(c=>ALL_COUNTRIES.includes(c))})
 const [previewArea,setPreviewArea]=useState<{country:string;region:string|null}|null>(null),[editStudy,setEditStudy]=useState(false)
 const notedKey=[...new Set(notedCountries)].sort().join('|')
 const noted=useMemo(()=>new Set(notedKey?notedKey.split('|'):[]),[notedKey])
 const mutedNames=useMemo(()=>ALL_COUNTRIES.filter(c=>isMuted(c,view,study,noted)),[view,study,noted])
 const mutedFill=useMemo(()=>safeCountryFill(hitFeatures,mutedNames),[mutedNames])
 const layers=useRef({mutedFill,mutedNames});layers.current={mutedFill,mutedNames}
 const clue=previewArea?previewClue(clues,previewArea.country,previewArea.region):undefined
 const previewMuted=previewArea?mutedNames.includes(previewArea.country):false
 useEffect(()=>{try{localStorage.setItem('atlas-study-countries',JSON.stringify(study))}catch{}},[study])
 const node = useRef<HTMLDivElement>(null), map = useRef<maplibregl.Map|null>(null)
 const callbacks = useRef({onPreview,onSelect,onRegionPreview,onRegionSelect}); callbacks.current = {onPreview,onSelect,onRegionPreview,onRegionSelect}
 const selection=useRef({selected,selectedCountries:selectedCountries??[selected],regionIds,regionalMode});selection.current={selected,selectedCountries:selectedCountries??[selected],regionIds,regionalMode}
 const sync=useRef<()=>void>(()=>{})
 const [regionError,setRegionError]=useState(false),[regionsVisible,setRegionsVisible]=useState(false)
 useEffect(() => {
  if (!node.current) return
  const m = new maplibregl.Map({
   container:node.current, center:[7,48], zoom:3.5, minZoom:1.7, maxZoom:18,
   renderWorldCopies:true, dragRotate:false, touchPitch:false,boxZoom:false,
   pixelRatio:Math.min(window.devicePixelRatio || 1,1.5),
   style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'}},layers:[{id:'basemap',type:'raster',source:'osm',paint:{'raster-fade-duration':100}}]},
  })
  map.current = m
  m.scrollZoom.setWheelZoomRate(1/600); m.scrollZoom.setZoomRate(1/120)
  m.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right')
  m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left')
  let disposed=false,regionData:GeoJSON.FeatureCollection|null=null,loading=false
  let countryKey='',lastMuted:GeoJSON.FeatureCollection|null=null
  const syncRegions=()=>{
   if(disposed||!m.getLayer('basemap'))return
   if(!m.getSource('muted-countries')){
    m.addSource('muted-countries',{type:'geojson',data:layers.current.mutedFill})
    m.addLayer({id:'muted-country-fill',type:'fill',source:'muted-countries',paint:{'fill-color':'#777f88','fill-opacity':.28}})
    lastMuted=layers.current.mutedFill
   }else if(lastMuted!==layers.current.mutedFill){(m.getSource('muted-countries') as maplibregl.GeoJSONSource).setData(layers.current.mutedFill);lastMuted=layers.current.mutedFill}
   // Selected countries remain distinct even when outside the learning selection.
   m.setFilter('muted-country-fill',['!', ['in',['get','name'],['literal',selection.current.selectedCountries]]])
   node.current?.querySelectorAll<HTMLButtonElement>('.micro-country-dot').forEach(button=>button.classList.toggle('is-muted-country',layers.current.mutedNames.includes(button.dataset.country??'')))
   const countryNames=selection.current.selectedCountries
   const key=countryNames.join('|')
   if(!m.getSource('selected-countries')){
    m.addSource('selected-countries',{type:'geojson',data:safeCountryFill(hitFeatures,countryNames)})
    m.addLayer({id:'selected-country-fill',type:'fill',source:'selected-countries',paint:{'fill-color':'#77899a','fill-opacity':.18}})
    countryKey=key
   }else if(key!==countryKey){(m.getSource('selected-countries') as maplibregl.GeoJSONSource).setData(safeCountryFill(hitFeatures,countryNames));countryKey=key}
   m.setLayoutProperty('selected-country-fill','visibility',selection.current.regionalMode&&hasRegions(selection.current.selected)?'none':'visible')
   node.current?.querySelectorAll<HTMLButtonElement>('.micro-country-dot').forEach(button=>button.classList.toggle('is-country-selected',countryNames.includes(button.dataset.country??'')))
   const visible=hasRegions(selection.current.selected)&&selection.current.regionalMode&&m.getZoom()>=3.5
   setRegionsVisible(visible)
   if(visible&&!regionData&&!loading){loading=true;Promise.all([loadFranceRegions(),loadSpainRegions()]).then(([fr,es])=>({type:'FeatureCollection' as const,features:[...fr.features,...es.features]})).then(data=>{if(disposed)return;regionData=data;loading=false;setRegionError(false);syncRegions()}).catch(()=>{if(!disposed){loading=false;setRegionError(true)}})}
   if(regionData&&!m.getSource('france-regions')){
    m.addSource('france-regions',{type:'geojson',data:regionData,attribution:'France: IGN / INSEE 2018, Grégoire David · Licence Ouverte. Spain: Obra derivada de IGN EGR · CC BY 4.0 ign.es'})
    m.addLayer({id:'france-region-fill',type:'fill',source:'france-regions',paint:{'fill-color':'#88749c','fill-opacity':['case',['in',['get','regionId'],['literal',selection.current.regionIds]],.18,.015]}})
    m.addLayer({id:'france-region-lines',type:'line',source:'france-regions',paint:{'line-color':'#6e6478','line-width':1,'line-opacity':.55}})
   }
   if(m.getLayer('france-region-fill')){
    m.setPaintProperty('france-region-fill','fill-opacity',['case',['in',['get','regionId'],['literal',selection.current.regionIds]],.18,.015])
    for(const id of ['france-region-fill','france-region-lines']){m.setLayoutProperty(id,'visibility',visible?'visible':'none');m.setFilter(id,['==',['get','country'],selection.current.selected])}
   }
  }
  sync.current=syncRegions;m.on('load',syncRegions);m.on('zoomend',syncRegions)
  const hit=(lng:number,lat:number)=>{
   if(regionData&&hasRegions(selection.current.selected)&&selection.current.regionalMode&&m.getZoom()>=3.5){const name=countryAt(regionData.features.filter(f=>f.properties?.country===selection.current.selected),lng,lat);if(name)return {country:selection.current.selected,region:regionData.features.find(f=>f.properties?.country===selection.current.selected&&f.properties?.name===name)?.properties?.regionId as string}}
   return {country:countryAt(hitFeatures,lng,lat),region:null}
  }
  let previous:string|null = null,previousRegion:string|null=null, pending:ReturnType<typeof setTimeout>|undefined
  let moving = false, point:maplibregl.LngLat|null = null, markerHovered = false
  const preview = (name:string|null,region:string|null=null) => { if (name === previous&&region===previousRegion) return; previous = name;previousRegion=region;setPreviewArea(name?{country:name,region}:null); callbacks.current.onPreview(name);callbacks.current.onRegionPreview?.(region) }
  const clearPending = () => { if (pending) clearTimeout(pending); pending = undefined }
  m.on('movestart',()=>{moving=true;clearPending();preview(null)})
  m.on('moveend',()=>{moving=false})
  m.on('mousemove',e=>{
   if (moving || markerHovered) return
   point=e.lngLat
   if (pending) return
   pending=setTimeout(()=>{pending=undefined;if(!point||moving||markerHovered)return;const value=hit(point.lng,point.lat);m.getCanvas().style.cursor=value.country?'pointer':'';preview(value.country,value.region??null)},90)
  })
  const leave = () => {clearPending();preview(null);m.getCanvas().style.cursor=''}
  m.getCanvas().addEventListener('mouseleave',leave)
  m.on('click',e=>{clearPending();const value=hit(e.lngLat.lng,e.lngLat.lat);if(value.region)callbacks.current.onRegionSelect?.(value.region,!!e.originalEvent.shiftKey);else if(value.country)callbacks.current.onSelect(value.country,!!e.originalEvent.shiftKey);preview(null)})
  const markers = SMALL_COUNTRIES.map(country=>{
   const button=document.createElement('button');button.className='micro-country-dot';button.type='button';button.setAttribute('aria-label',`Select ${country.name}`);button.dataset.country=country.name
   const label=document.createElement('span');label.textContent=countryLabel(country.name);button.appendChild(label)
   const enter=()=>{markerHovered=true;clearPending();preview(country.name)}
   const exit=()=>{markerHovered=false;preview(null)}
   button.addEventListener('mouseenter',enter);button.addEventListener('mouseleave',exit);button.addEventListener('focus',enter);button.addEventListener('blur',exit)
   button.addEventListener('click',e=>{e.stopPropagation();clearPending();callbacks.current.onSelect(country.name,e.shiftKey);preview(null)})
   return new maplibregl.Marker({element:button,anchor:'center'}).setLngLat(country.center).addTo(m)
  })
  const observer=new ResizeObserver(()=>m.resize());observer.observe(node.current)
  return()=>{disposed=true;sync.current=()=>{};clearPending();observer.disconnect();m.getCanvas().removeEventListener('mouseleave',leave);markers.forEach(marker=>marker.remove());m.remove();map.current=null}
 },[])
 useEffect(()=>{if(!focusRequest)return;const bounds=countryBounds(focusRequest.country);if(bounds)map.current?.fitBounds(bounds,{padding:60,maxZoom:7,duration:650});},[focusRequest])
 useEffect(()=>{sync.current()},[selected,selectedCountries,regionIds,regionalMode,mutedFill])
 return <div className="free-map-wrap"><div ref={node} className="free-map" role="region" aria-label="Interactive world study map"/><div className="map-view-controls"><div role="group" aria-label="Map display">{(['study','all','notes'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='study'?'Study':v==='all'?'All countries':'My notes'}</button>)}<button aria-label="Customize study countries" aria-expanded={editStudy} onClick={()=>setEditStudy(v=>!v)}>⚙</button></div><small>{view==='study'?'Gray = outside your study list':view==='notes'?'Gray = no saved personal notes':'All countries remain selectable'}</small>{editStudy&&<div className="map-study-editor"><strong>Your study list</strong><p>A learning selection, not a coverage guarantee. Gray countries stay clickable.</p><CountryPicker countries={ALL_COUNTRIES} value={study} onChange={setStudy}/><button onClick={()=>setStudy(DEFAULT_STUDY.filter(c=>ALL_COUNTRIES.includes(c)))}>Reset starter list</button><button onClick={()=>setEditStudy(false)}>Done</button></div>}</div>{previewArea&&!editStudy&&<aside className="map-hover-card" aria-label="Country preview"><strong>{countryLabel(previewArea.country)}</strong>{previewArea.region&&<span>{scopeName(previewArea.region)}</span>}<small>{categoryLabel}{previewMuted?(view==='study'?' · Outside study list':' · No personal notes'):''}</small>{clue?<><div className="map-hover-clue">{clue.image&&<img key={clue.image} src={clue.image} alt={clue.title} onError={e=>{e.currentTarget.style.display='none'}}/>}<div><small>{clue.source}</small><b>{clue.title}</b>{clue.body&&<p>{clue.body.slice(0,160)}</p>}</div></div></>:<p>No saved clues in this category yet. Click to explore or add your own.</p>}<footer>Click to select · Shift + click to add</footer></aside>}<div className="free-map-buttons">{hasRegions(selected)&&<><button onClick={()=>{setRegionError(false);map.current?.fitBounds(selected==='Spain'?[[-9.5,35.7],[4.5,43.9]]:[[-5.2,41.3],[9.7,51.2]],{padding:40,duration:450});sync.current()}}>Explore {selected}</button>{selected==='Spain'&&<button onClick={()=>map.current?.fitBounds([[-18.3,27.5],[-13.3,29.6]],{padding:40,duration:450})}>Canary Islands</button>}</>}<button onClick={()=>map.current?.flyTo({center:[7,48],zoom:3.5,duration:450})}>Europe</button><button onClick={()=>map.current?.flyTo({center:[0,20],zoom:1.8,duration:450})}>World</button></div>{regionsVisible&&<a className="region-map-credit" href={import.meta.env.BASE_URL+(selected==='Spain'?'SPAIN-PROVINCES-LICENSE.md':'FRANCE-REGIONS-LICENSE.md')} target="_blank" rel="noreferrer">{selected==='Spain'?'Spain provinces · IGN · CC BY 4.0':'France regions · Open data'}</a>}{regionError&&regionalMode&&hasRegions(selected)&&<button className="region-map-error" onClick={()=>sync.current()}>Regions could not load. Retry</button>}</div>
}
export default memo(FreeMap)
