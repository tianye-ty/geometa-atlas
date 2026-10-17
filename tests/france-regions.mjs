import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {FRANCE_REGIONS,franceRegionId,regionName,matchesRegion,toggleRegionSelection,noteRegionIds} from '../src/franceRegions.ts'
import {countryAt} from '../src/mapHitTest.ts'
const data=JSON.parse(readFileSync(new URL('../public/france-regions.geojson',import.meta.url),'utf8'))
assert.equal(data.features.length,13)
assert.equal(new Set(FRANCE_REGIONS.map(r=>r.id)).size,13)
for(const f of data.features){const id='FR-'+f.properties.code;assert.ok(regionName(id));f.properties.name=regionName(id)}
for(const [lng,lat,name] of [[-1.68,48.11,'Brittany'],[-.37,49.18,'Normandy'],[2.35,48.85,'Île-de-France'],[9,42,'Corsica'],[4.84,45.75,'Auvergne-Rhône-Alpes']])assert.equal(countryAt(data.features,lng,lat),name)
assert.equal(franceRegionId('Bretagne'),'FR-53')
assert.equal(franceRegionId('Normandie'),'FR-28')
assert.equal(franceRegionId('Ile-de-France'),'FR-11')
assert.ok(matchesRegion({country:'France',region:'Bretagne'},'FR-53'))
assert.ok(!matchesRegion({country:'France',region:'Normandy'},'FR-53'))
assert.ok(!matchesRegion({country:'France'},'FR-53'))
assert.ok(matchesRegion({country:'France'},'country-wide'))
assert.ok(!matchesRegion({country:'France',regionId:'FR-53'},'country-wide'))
assert.ok(matchesRegion({country:'France',region:'Existing custom region'},''))
console.log('France: 13 region IDs, 5 geographic hits, legacy labels and scope isolation passed')
assert.deepEqual(toggleRegionSelection(['FR-53'],'FR-28',true),['FR-53','FR-28'])
assert.deepEqual(toggleRegionSelection(['FR-53','FR-28'],'FR-28',true),['FR-53'])
assert.deepEqual(toggleRegionSelection(['FR-53'],'FR-28',false),['FR-28'])
const shared={country:'France',regionIds:['FR-53','FR-28']}
assert.ok(matchesRegion(shared,'FR-53'))
assert.ok(matchesRegion(shared,'FR-28'))
assert.ok(matchesRegion(shared,['FR-24','FR-28']))
assert.ok(!matchesRegion(shared,'FR-94'))
assert.ok(!matchesRegion(shared,'country-wide'))
assert.ok(matchesRegion(shared,''))
assert.deepEqual(noteRegionIds(JSON.parse(JSON.stringify(shared))),['FR-53','FR-28'])
const mapSource=readFileSync(new URL('../src/FreeMap.tsx',import.meta.url),'utf8')
assert.ok(!mapSource.includes('loadFranceRegions().then(data=>{if(cancelled'))
assert.ok(mapSource.includes('e.originalEvent.shiftKey'))
console.log('Multi-region toggle, union filtering, country-wide mode and serialization checks passed')
