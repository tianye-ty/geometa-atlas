import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { feature } from 'topojson-client'
import { countryAt } from '../src/mapHitTest.ts'
const world = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-110m.json',import.meta.url),'utf8'))
const countries = feature(world,world.objects.countries).features
const cases = [
 ['France',2,47],['Germany',10,51],['Russia',37.6,55.7],['Russia',178,66],
 ['Russia',-178,66],['Canada',-100,60],['United States of America',-100,40],
 [null,-30,58],['Greenland',-50,75],['Malaysia',102,4],['Philippines',121,15],
]
for (const [expected,lng,lat] of cases) assert.equal(countryAt(countries,lng,lat),expected,`${lng},${lat}`)
const start=performance.now()
for(let i=0;i<10000;i++)countryAt(countries,-180+(i%360),-60+(i%130))
console.log(`${cases.length} geographic checks passed; 10,000 cached queries: ${Math.round(performance.now()-start)} ms`)
