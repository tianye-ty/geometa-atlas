import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import { ROAD_COVERAGE } from './coverage'
import { VISUAL_REFERENCES } from './visualReferences'
import { CATEGORY_META } from './data'
import type { Category, Note } from './types'

const geo = feature(world as never,world.objects.countries as never) as unknown as GeoJSON.FeatureCollection
const centers:Record<string,[number,number]>={France:[46.6,2.6],Germany:[51,10],Philippines:[12.5,122],Malaysia:[4.5,104]}

export default function StudyMap({selected,category,notes,onHover,onSelect,onCompare}:{selected:string;category:Category;notes:Note[];onHover:(country:string|null)=>void;onSelect:(country:string)=>void;onCompare:(country:string)=>void}) {
 const element=useRef<HTMLDivElement>(null)
 const map=useRef<L.Map|null>(null)
 const borders=useRef<L.GeoJSON|null>(null)
 const markers=useRef<L.LayerGroup|null>(null)
 const callbacks=useRef({onHover,onSelect,onCompare})
 callbacks.current={onHover,onSelect,onCompare}
 const values=useRef({selected,category,notes});values.current={selected,category,notes}
 const [preview,setPreview]=useState<string|null>(null)
 const [tilesFailed,setTilesFailed]=useState(false)
 const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
 const available=(country:string)=>VISUAL_REFERENCES.some(r=>r.country===country&&(values.current.category==='all'||r.category===values.current.category))||values.current.notes.some(n=>n.country===country&&(values.current.category==='all'||n.category===values.current.category))
 const style=(country:string):L.PathOptions=>({color:country===values.current.selected?'#7742ba':'#755e9b',weight:country===values.current.selected?2.2:1,fillColor:available(country)?'#9b70d0':'#aaa0b5',fillOpacity:country===values.current.selected ? 0.22 : available(country) ? 0.12 : 0.015})
 const hover=(country:string|null)=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);if(country){setPreview(country);callbacks.current.onHover(country)}else{hoverTimer.current=setTimeout(()=>{setPreview(null);callbacks.current.onHover(null)},160)}}
 useEffect(()=>{
  if(!element.current)return
  const m=L.map(element.current,{zoomControl:false,minZoom:2,maxZoom:19,worldCopyJump:true}).setView([48,7],4)
  map.current=m
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',updateWhenIdle:true,keepBuffer:1}).on('tileerror',()=>setTilesFailed(true)).on('tileload',()=>setTilesFailed(false)).addTo(m)
  L.control.zoom({position:'bottomright'}).addTo(m)
  L.control.scale({position:'bottomleft',imperial:false}).addTo(m)
  borders.current=L.geoJSON(geo,{filter:f=>ROAD_COVERAGE.has(f.properties?.name),style:f=>style(f?.properties?.name??''),onEachFeature:(f,layer)=>{
   const country=f.properties?.name as string
   layer.on('mouseover',()=>{(layer as L.Path).setStyle({fillOpacity:.3,weight:2.3});hover(country)})
   layer.on('mouseout',()=>{(layer as L.Path).setStyle(style(country));hover(null)})
   layer.on('click',()=>{callbacks.current.onSelect(country);hover(null)})
   layer.bindTooltip(country,{sticky:true,direction:'top',className:'study-country-tooltip'})
  }}).addTo(m)
  markers.current=L.layerGroup().addTo(m)
  const observer=new ResizeObserver(()=>m.invalidateSize({pan:false}));observer.observe(element.current)
  return()=>{observer.disconnect();if(hoverTimer.current)clearTimeout(hoverTimer.current);m.remove();map.current=null}
 },[])
 useEffect(()=>{
  borders.current?.eachLayer(layer=>{const f=(layer as L.GeoJSON & {feature:GeoJSON.Feature}).feature;(layer as L.Path).setStyle(style(f.properties?.name))})
  markers.current?.clearLayers()
  const countryNames=new Set([...VISUAL_REFERENCES.filter(r=>category==='all'||r.category===category).map(r=>r.country),...notes.filter(n=>category==='all'||n.category===category).map(n=>n.country)])
  countryNames.forEach(country=>{
   const matchingNotes=notes.filter(n=>n.country===country&&(category==='all'||n.category===category));const refs=VISUAL_REFERENCES.filter(r=>r.country===country&&(category==='all'||r.category===category))
   let center: L.LatLngExpression|undefined=centers[country]
   if(!center)borders.current?.eachLayer(layer=>{if((layer as L.GeoJSON & {feature:GeoJSON.Feature}).feature.properties?.name===country)center=(layer as L.Polygon).getBounds().getCenter()})
   if(!center||!markers.current)return
   const marker=L.marker(center,{icon:L.divIcon({className:'study-marker-wrap',html:`<span class="study-marker ${matchingNotes.length?'personal':''}">${matchingNotes.length||refs.length}</span>`,iconSize:[30,30],iconAnchor:[15,15]}),title:country})
   marker.on('mouseover',()=>hover(country)).on('mouseout',()=>hover(null)).on('click',()=>{callbacks.current.onSelect(country);hover(null)})
   marker.addTo(markers.current)
   const icon=marker.getElement();icon?.setAttribute('aria-label',`Study ${country}`);icon?.addEventListener('focus',()=>hover(country));icon?.addEventListener('blur',()=>hover(null))
  })
 },[selected,category,notes])
 const refs=VISUAL_REFERENCES.filter(r=>r.country===preview&&(category==='all'||r.category===category))
 const own=notes.filter(n=>n.country===preview&&(category==='all'||n.category===category))
 const visual=refs.find(r=>r.photo)
 const center=()=>{if(centers[selected])map.current?.flyTo(centers[selected],6,{duration:.6});else borders.current?.eachLayer(layer=>{if((layer as L.GeoJSON & {feature:GeoJSON.Feature}).feature.properties?.name===selected)map.current?.fitBounds((layer as L.Polygon).getBounds(),{maxZoom:7,padding:[30,30]})})}
 return <div className="study-map-shell"><div ref={element} className="study-leaflet" aria-label="Detailed OpenStreetMap study map"/>
  <div className="study-map-instructions"><strong>{CATEGORY_META[category].label}</strong><br/><span>Hover to preview · Click to pin · Scroll to zoom</span></div>
  <div className="study-map-actions"><button onClick={center}>Center country</button><button onClick={()=>map.current?.setView([48,7],4)}>Europe</button><button onClick={()=>map.current?.setView([20,0],2)}>World</button></div>
  {preview&&<section className="hover-clue-card" onMouseEnter={()=>{if(hoverTimer.current)clearTimeout(hoverTimer.current)}} onMouseLeave={()=>hover(null)}><div className="hover-card-label">HOVER PREVIEW · {CATEGORY_META[category].label}</div><h3>{preview}</h3>
   {visual?.photo?<img src={visual.photo.url} alt={visual.title}/>:own.find(n=>n.image)?<img src={own.find(n=>n.image)!.image} alt="Personal note preview"/>:<div className="hover-no-photo">{refs.length?'Open the source example from the reader':'No visual clue added yet'}</div>}
   <p>{visual?.title??own[0]?.title??refs[0]?.title??'Add your first observation'}</p><small>{refs.length} references · {own.length} personal notes</small>
   <div><button onClick={()=>{onSelect(preview);hover(null)}}>Pin country</button>{preview!==selected&&<button onClick={()=>onCompare(preview)}>Compare with {selected}</button>}</div>
   {visual?.photo&&<a href={visual.photo.page} target="_blank" rel="noreferrer">Photo: {visual.photo.author} · {visual.photo.license}</a>}
  </section>}
  {tilesFailed&&<div className="map-service-notice">Some map tiles could not load. Country interaction still works; check your connection.</div>}
 </div>
}
