type Ring = { points:number[][]; minX:number; maxX:number; minY:number; maxY:number }
type Polygon = Ring[]
const cache = new WeakMap<GeoJSON.Feature,Polygon[]>()
function ring(raw:number[][]):Ring {
 const points:number[][]=[]
 for(const [x,y] of raw){let lng=x;if(points.length){const previous=points[points.length-1][0];while(lng-previous>180)lng-=360;while(lng-previous< -180)lng+=360}points.push([lng,y])}
 return {points,minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))}
}
function inside(r:Ring,lng:number,lat:number){
 if(lat<r.minY||lat>r.maxY)return false
 const x=lng+360*Math.round(((r.minX+r.maxX)/2-lng)/360)
 if(x<r.minX||x>r.maxX)return false
 let result=false
 for(let i=0,j=r.points.length-1;i<r.points.length;j=i++){
  const a=r.points[i],b=r.points[j]
  if((a[1]>lat)!==(b[1]>lat)&&x<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])result=!result
 }
 return result
}
export function countryAt(features:GeoJSON.Feature[],lng:number,lat:number):string|null {
 for(const f of features){
  let polygons=cache.get(f)
  if(!polygons){const g=f.geometry;polygons=g?.type==='Polygon'?[g.coordinates.map(ring)]:g?.type==='MultiPolygon'?g.coordinates.map(p=>p.map(ring)):[];cache.set(f,polygons)}
  if(polygons.some(p=>p.length&&inside(p[0],lng,lat)&&!p.slice(1).some(h=>inside(h,lng,lat))))return f.properties?.name??null
 }
 return null
}
