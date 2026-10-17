import {feature} from 'topojson-client'
import world from 'world-atlas/countries-50m.json'

// Natural Earth geography is a study index, not a Street View / game-mode whitelist.
export const countryGeo = feature(world as never, world.objects.countries as never) as unknown as GeoJSON.FeatureCollection
for(const f of countryGeo.features){
 if(f.properties?.name==='Macedonia')f.properties.name='North Macedonia'
 if(f.properties?.name==='Vatican')f.properties.name='Vatican City'
}
export const extraLocations: {name:string;center:[number,number]}[] = [
 {name:'Gibraltar',center:[-5.35,36.14]}, {name:'Christmas Island',center:[105.63,-10.48]}, {name:'Cocos (Keeling) Islands',center:[96.85,-12.17]}, {name:'Akrotiri and Dhekelia',center:[32.98,34.59]}, {name:'United States Minor Outlying Islands',center:[-177.37,28.21]},
 {name:'Tuvalu',center:[179.2,-8.52]},
 {name:'Guadeloupe',center:[-61.55,16.25]}, {name:'Martinique',center:[-61.02,14.64]},
 {name:'Réunion',center:[55.53,-21.12]}, {name:'Mayotte',center:[45.16,-12.82]},
 {name:'French Guiana',center:[-53.2,4]}, {name:'Svalbard',center:[15.6,78.2]},
]
export const ALL_COUNTRIES=[...new Set([...countryGeo.features.map(f=>String(f.properties?.name)),...extraLocations.map(c=>c.name)])].sort((a,b)=>a.localeCompare(b))
export const COUNTRY_ALIASES:Record<string,string>={
 'United States of America':'USA US United States America 美国', 'United Kingdom':'UK Great Britain England Scotland Wales Northern Ireland 英国',
 'Czechia':'Czech Republic 捷克', 'Turkey':'Türkiye 土耳其', 'eSwatini':'Eswatini Swaziland 斯威士兰',
 'Dominican Rep.':'Dominican Republic 多米尼加', 'Bosnia and Herz.':'Bosnia and Herzegovina 波黑',
 'Dem. Rep. Congo':'Democratic Republic of the Congo DRC', 'Congo':'Republic of the Congo',
 'Faeroe Is.':'Faroe Islands 法罗群岛', 'Fr. Polynesia':'French Polynesia Tahiti',
 'S. Sudan':'South Sudan', 'Eq. Guinea':'Equatorial Guinea', 'Central African Rep.':'Central African Republic',
 'N. Mariana Is.':'Northern Mariana Islands', 'U.S. Virgin Is.':'US Virgin Islands',
 'Antigua and Barb.':'Antigua and Barbuda', 'St. Vin. and Gren.':'Saint Vincent and the Grenadines',
 'St. Kitts and Nevis':'Saint Kitts and Nevis', 'Cabo Verde':'Cape Verde', 'Côte d\'Ivoire':'Ivory Coast',
 'North Macedonia':'Macedonia', 'Vatican City':'Vatican Holy See 梵蒂冈', 'N. Cyprus':'Northern Cyprus',
 'W. Sahara':'Western Sahara', 'France':'法国', 'Germany':'德国', 'Russia':'俄罗斯',
 'Belarus':'白俄罗斯', 'Andorra':'安道尔', 'Monaco':'摩纳哥', 'Malta':'马耳他',
 'Philippines':'菲律宾', 'Malaysia':'马来西亚', 'Japan':'日本', 'China':'中国', 'Taiwan':'台湾',
 'South Korea':'Korea 韩国', 'North Korea':'朝鲜', 'Spain':'西班牙', 'Portugal':'葡萄牙',
 'Italy':'意大利', 'Netherlands':'Holland 荷兰', 'Belgium':'比利时', 'Switzerland':'瑞士',
 'Austria':'奥地利', 'Poland':'波兰', 'Norway':'挪威', 'Sweden':'瑞典', 'Finland':'芬兰',
 'Denmark':'丹麦', 'Iceland':'冰岛', 'Ireland':'爱尔兰', 'Greece':'希腊', 'Ukraine':'乌克兰',
 'Australia':'澳大利亚 澳洲', 'New Zealand':'新西兰', 'Canada':'加拿大', 'Mexico':'墨西哥',
 'Brazil':'巴西', 'Argentina':'阿根廷', 'Chile':'智利', 'Peru':'秘鲁', 'Colombia':'哥伦比亚',
 'Indonesia':'印尼 印度尼西亚', 'Thailand':'泰国', 'Vietnam':'越南', 'Singapore':'新加坡',
 'India':'印度', 'Bangladesh':'孟加拉国', 'Pakistan':'巴基斯坦', 'South Africa':'南非',
 'Kenya':'肯尼亚', 'Nigeria':'尼日利亚', 'Hong Kong':'香港', 'Macao':'Macau 澳门',
 'Réunion':'Reunion 留尼汪', 'Svalbard':'Spitsbergen',
}

export function countryBounds(name:string):[[number,number],[number,number]]|null{
 const extra=extraLocations.find(c=>c.name===name)
 if(extra)return [[extra.center[0]-.6,extra.center[1]-.6],[extra.center[0]+.6,extra.center[1]+.6]]
 const g=countryGeo.features.find(f=>f.properties?.name===name)?.geometry
 const rings=g?.type==='Polygon'?[g.coordinates[0]]:g?.type==='MultiPolygon'?g.coordinates.map(p=>p[0]):[]
 // Focus on the largest landmass; remote islands should not zoom a country out to the entire world.
 const boxes=rings.map(r=>{let previous=r[0][0];const points=r.map(([x,y])=>{while(x-previous>180)x-=360;while(x-previous< -180)x+=360;previous=x;return [x,y]});return [[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1]))],[Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]] as [[number,number],[number,number]]})
 return boxes.sort((a,b)=>(b[1][0]-b[0][0])*(b[1][1]-b[0][1])-(a[1][0]-a[0][0])*(a[1][1]-a[0][1]))[0]??null
}
export const COUNTRY_DOTS=[...countryGeo.features.flatMap(f=>{const name=String(f.properties?.name),b=countryBounds(name);return b&&(b[1][0]-b[0][0])*(b[1][1]-b[0][1])<2?[{name,center:[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2] as [number,number]}]:[]}),...extraLocations]
