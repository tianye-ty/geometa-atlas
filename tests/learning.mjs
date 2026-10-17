import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {regionsFor,matchesRegion,toggleRegionSelection,scopeName} from '../src/franceRegions.ts'
import {countryAt} from '../src/mapHitTest.ts'
import {nextReview,isDue} from '../src/review.ts'
import {countryFlag} from '../src/countryFlags.ts'
const spain=JSON.parse(readFileSync(new URL('../public/spain-provinces.geojson',import.meta.url),'utf8'))
assert.equal(spain.features.length,52)
assert.equal(regionsFor('Spain').length,52)
assert.ok(!spain.features.some(f=>f.properties.name.includes('Gibraltar')))
for(const [x,y,name] of [[-3.7,40.42,'Madrid'],[2.17,41.38,'Barcelona'],[-5.98,37.39,'Sevilla'],[-15.43,28.12,'Las Palmas'],[-16.25,28.46,'Santa Cruz de Tenerife']])assert.equal(countryAt(spain.features,x,y),name)
const note={country:'Spain',regionIds:['ES-28','ES-08']}
assert.ok(matchesRegion(note,'ES-08'));assert.ok(matchesRegion(note,'ES-28'));assert.ok(!matchesRegion(note,'FR-28'))
assert.deepEqual(toggleRegionSelection(['ES-28'],'ES-08',true),['ES-28','ES-08'])
assert.equal(scopeName(['ES-28','ES-08']),'Madrid + Barcelona')
assert.equal(countryFlag('Austria'),'🇦🇹');assert.equal(countryFlag('Monaco'),'🇲🇨');assert.equal(countryFlag('Vatican City'),'🇻🇦')
const now=Date.UTC(2026,9,16),r=nextReview(undefined,'good',now)
assert.equal(r.interval,1);assert.equal(new Date(r.due).getTime(),now+86400000)
assert.equal(nextReview(r,'easy',now).interval,4)
assert.equal(new Date(nextReview(r,'again',now).due).getTime(),now+600000)
assert.ok(isDue({},now));assert.ok(!isDue({review:r},now));assert.ok(isDue({review:r},now+86400001))
console.log('Spain: 52 areas, mainland/island hits, multi-selection, flags and review scheduling passed')
