import { useEffect, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-50m.json'
import { PROFILES } from './data'
import { VISUAL_REFERENCES } from './visualReferences'
import { ROAD_COVERAGE } from './coverage'
import type { Note } from './types'

type Geometry = { type: string; coordinates: number[][][] | number[][][][] }
const features = (feature(world as never, world.objects.countries as never) as unknown as { features: { properties: { name: string }; geometry: Geometry }[] }).features
const project = ([lon,lat]:number[]) => [(lon+180)*1000/360,(90-lat)*500/180]
const shapes = features.filter(f => f.properties.name !== 'Antarctica').map(f => {
 const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] : f.geometry.coordinates as number[][][][]
 const path = polygons.flatMap(p=>p.map(r=>{let previous=r[0][0];return r.map((p,i)=>{let lon=p[0];while(lon-previous>180)lon-=360;while(lon-previous< -180)lon+=360;previous=lon;const [x,y]=project([lon,p[1]]);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`}).join(' ')+' Z'})).join(' ')
 const main = [...polygons].sort((a,b)=>b[0].length-a[0].length)[0][0]
 const pts=main.map(project)
 const center=[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length]
 return {name:f.properties.name==='Macedonia'?'North Macedonia':f.properties.name,path,center}
})

export default function AtlasMap({selected,onSelect,notes}:{selected:string;onSelect:(country:string)=>void;notes:Note[]}) {
 const svgRef=useRef<SVGSVGElement>(null)
 const [size,setSize]=useState({width:800,height:600})
 const drag=useRef<{x:number;y:number;cx:number;cy:number;distance:number}|null>(null)
 const moved=useRef(false)
 const [view,setView]=useState({cx:535,cy:155,zoom:2.3})
 const [hover,setHover]=useState<string|null>(null)
 const noteCounts=useMemo(()=>notes.reduce<Record<string,number>>((a,n)=>{a[n.country]=(a[n.country]??0)+1;return a},{}),[notes])
 const w=1000/view.zoom,h=500/view.zoom
 const screenScale=Math.min(size.width/w,size.height/h)
 useEffect(()=>{const node=svgRef.current;if(!node)return;const observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;setSize({width:Math.max(1,r.width),height:Math.max(1,r.height)})});observer.observe(node);return()=>observer.disconnect()},[])
 const point=(clientX:number,clientY:number)=>{const svg=svgRef.current;const matrix=svg?.getScreenCTM();if(!svg||!matrix)return {x:0,y:0};const p=svg.createSVGPoint();p.x=clientX;p.y=clientY;return p.matrixTransform(matrix.inverse())}
 const zoom=(factor:number,x=view.cx,y=view.cy)=>setView(v=>{const z=Math.max(1,Math.min(15,v.zoom*factor)),ratio=v.zoom/z;return {zoom:z,cx:x+(v.cx-x)*ratio,cy:y+(v.cy-y)*ratio}})
 const focus=()=>{const country=shapes.find(s=>s.name===selected);if(country)setView({cx:country.center[0],cy:country.center[1],zoom:5})}
 useEffect(()=>{const node=svgRef.current;if(!node)return;const wheel=(e:WheelEvent)=>{e.preventDefault();const p=point(e.clientX,e.clientY);zoom(e.deltaY<0?1.15:1/1.15,p.x,p.y)};node.addEventListener('wheel',wheel,{passive:false});return()=>node.removeEventListener('wheel',wheel)},[])
 return <div className="atlas-map">
  <svg ref={svgRef} viewBox={`${view.cx-w/2} ${view.cy-h/2} ${w} ${h}`} aria-label="Interactive country and notebook map" className="world-svg" onPointerDown={e=>{if(e.button!==0)return;const p=point(e.clientX,e.clientY);drag.current={x:p.x,y:p.y,cx:view.cx,cy:view.cy,distance:0};moved.current=false;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current)return;const p=point(e.clientX,e.clientY);const d=drag.current;const dx=p.x-d.x,dy=p.y-d.y;d.distance+=Math.abs(dx)+Math.abs(dy);if(d.distance>3)moved.current=true;setView(v=>({...v,cx:v.cx-dx,cy:v.cy-dy}))}} onPointerUp={e=>{const wasDrag=moved.current;drag.current=null;if(!wasDrag){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-country]');const name=target?.getAttribute('data-country');if(name&&ROAD_COVERAGE.has(name))onSelect(name)}e.currentTarget.releasePointerCapture(e.pointerId)}}>
   <g className="graticule">{[-60,-30,0,30,60].map(lat=><line key={lat} x1="0" y1={(90-lat)*500/180} x2="1000" y2={(90-lat)*500/180}/>)}</g>
   <g className="country-shapes">{shapes.map(s=><path key={s.name} data-country={s.name} d={s.path} className={[ROAD_COVERAGE.has(s.name)?'playable':'unavailable',VISUAL_REFERENCES.some(r=>r.country===s.name)?'has-data':'',noteCounts[s.name]?'has-notes':'',s.name===selected?'selected':''].join(' ')} onMouseEnter={()=>setHover(s.name)} onMouseLeave={()=>setHover(null)} tabIndex={ROAD_COVERAGE.has(s.name)?0:undefined} role={ROAD_COVERAGE.has(s.name)?'button':undefined} aria-label={`Select ${s.name}`} onKeyDown={e=>{if(e.key==='Enter'&&ROAD_COVERAGE.has(s.name))onSelect(s.name)}} />)}</g>
   <g className="map-labels">{shapes.filter(s=>ROAD_COVERAGE.has(s.name)&&(view.zoom>=5||s.name===selected||noteCounts[s.name])).map(s=><text key={s.name} x={s.center[0]} y={s.center[1]} fontSize={11/screenScale} textAnchor="middle" pointerEvents="none">{s.name}</text>)}</g>
   <g>{shapes.filter(s=>noteCounts[s.name]).map(s=><g key={s.name} data-country={s.name} className="note-map-marker" transform={`translate(${s.center[0]},${s.center[1]-18/screenScale}) scale(${1/screenScale})`}><circle r="13"/><text textAnchor="middle" y="4">{noteCounts[s.name]}</text></g>)}</g>
  </svg>
  <div className="atlas-map-controls"><button aria-label="Zoom in" onClick={()=>zoom(1.4)}>+</button><button aria-label="Zoom out" onClick={()=>zoom(1/1.4)}>−</button><button onClick={focus} title="Center on selected country">◎</button><button onClick={()=>setView({cx:500,cy:250,zoom:1})} title="Reset world view">↺</button></div>
  <div className="map-help">Scroll to zoom · Drag to explore · Click a country</div>
  {hover&&<div className="map-hover-label">{PROFILES[hover]?.flag} {hover} · {noteCounts[hover]??0} notes{!ROAD_COVERAGE.has(hover)&&' · Outside study list'}</div>}
  <div className="map-attribution">Natural Earth · country overview</div>
 </div>
}
