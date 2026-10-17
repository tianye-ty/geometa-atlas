import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {feature} from 'topojson-client'
import {safeCountryFill,toggleCountrySelection} from '../src/countrySelection.ts'
import {countryAt} from '../src/mapHitTest.ts'
assert.deepEqual(toggleCountrySelection(['France'],'Germany',true),['France','Germany'])
assert.deepEqual(toggleCountrySelection(['France','Germany'],'France',true),['Germany'])
assert.deepEqual(toggleCountrySelection(['France'],'France',true),['France'])
assert.deepEqual(toggleCountrySelection(['France','Germany'],'Malaysia',false),['Malaysia'])
const world=JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-110m.json',import.meta.url),'utf8'))
const features=feature(world,world.objects.countries).features
const fills=safeCountryFill(features,['France','Germany','Russia'])
assert.equal(fills.features.length,3)
for(const f of fills.features)for(const polygon of f.geometry.coordinates)for(const ring of polygon)for(let i=0;i<ring.length;i++){
 assert.ok(ring[i][0]>=-180.000001&&ring[i][0]<=180.000001)
 if(i)assert.ok(Math.abs(ring[i][0]-ring[i-1][0])<=180.000001,'No cross-world selection edge')
}
assert.equal(countryAt(fills.features,178,66),'Russia')
assert.equal(countryAt(fills.features,-178,66),'Russia')
assert.equal(countryAt(fills.features,-30,58),null)
assert.equal(countryAt(fills.features,2,47),'France')
assert.equal(countryAt(fills.features,10,51),'Germany')
console.log('Country selection, toggling, selected fills and antimeridian regression checks passed')
