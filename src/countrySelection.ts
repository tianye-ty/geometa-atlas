export function toggleCountrySelection(current:string[],country:string,additive:boolean){
 if(!additive)return [country]
 if(!current.includes(country))return [...current,country]
 return current.length>1?current.filter(c=>c!==country):current
}
type Position=number[]
function unwrap(raw:Position[]){const result:Position[]=[];for(const p of raw){let x=p[0];if(result.length){const previous=result[result.length-1][0];while(x-previous>180)x-=360;while(x-previous< -180)x+=360}result.push([x,p[1]])}return result}
function clip(raw:Position[],edge:number,keepLeft:boolean){
 const result:Position[]=[]
 for(let i=0,j=raw.length-1;i<raw.length;j=i++){
  const a=raw[j],b=raw[i],insideA=keepLeft?a[0]<=edge:a[0]>=edge,insideB=keepLeft?b[0]<=edge:b[0]>=edge
  if(insideA!==insideB){const t=(edge-a[0])/(b[0]-a[0]);result.push([edge,a[1]+t*(b[1]-a[1])])}
  if(insideB)result.push(b)
 }
 return result
}
// Split visual fill at ±180°; no selection outline can span the world.
export function safeCountryFill(features:GeoJSON.Feature[],selected:string[]):GeoJSON.FeatureCollection {
 return {type:'FeatureCollection',features:features.filter(f=>selected.includes(f.properties?.name)).map(f=>{
  const g=f.geometry;if(g.type!=='Polygon'&&g.type!=='MultiPolygon')return f
  const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates
  const parts:Position[][][]=[]
  for(const polygon of polygons){
   const outer=unwrap(polygon[0]),min=Math.min(...outer.map(p=>p[0])),max=Math.max(...outer.map(p=>p[0])),center=(min+max)/2
   const rings=[outer,...polygon.slice(1).map(raw=>{const hole=unwrap(raw),shift=360*Math.round((center-hole[0][0])/360);return hole.map(p=>[p[0]+shift,p[1]])})]
   for(let k=Math.floor((min+180)/360);k<=Math.floor((max+180)/360);k++){
    const bounds=[-180+360*k,180+360*k],clipped=rings.map(r=>clip(clip(r,bounds[0],false),bounds[1],true)).map(r=>{const points=r.map(p=>[p[0]-360*k,p[1]]);if(points.length)points.push([...points[0]]);return points})
    if(clipped[0].length>=4)parts.push(clipped.filter(r=>r.length>=4))
   }
  }
  return {...f,geometry:{type:'MultiPolygon',coordinates:parts} as GeoJSON.MultiPolygon}
 })}
}
