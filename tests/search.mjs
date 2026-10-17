import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {feature} from 'topojson-client'
import {searchAtlas,searchSnippet} from '../src/search.ts'
import {countryAt} from '../src/mapHitTest.ts'
import {safeCountryFill} from '../src/countrySelection.ts'
const items=[
 {id:'1',kind:'note',country:'Germany',title:'Bollard',body:'A dark red reflector below the cap',category:'bollards'},
 {id:'2',kind:'note',country:'France',title:'Red marker',body:'Dark paint',category:'signs',region:'Brittany',sourceUrl:'https://example.com/source'},
 {id:'3',kind:'country',country:'Réunion',title:'Réunion',body:'',aliases:'Reunion 留尼汪'},
 {id:'4',kind:'guide',country:'France',title:'Guide',body:'A dark red sign'},
]
assert.equal(searchAtlas(items,'DARK RED','note').length,2)
assert.equal(searchAtlas(items,'dark red').length,3)
assert.equal(searchAtlas(items,'brittany')[0].id,'2')
assert.equal(searchAtlas(items,'example.com')[0].id,'2')
assert.equal(searchAtlas(items,'reunion')[0].id,'3')
assert.equal(searchAtlas(items,'留尼汪')[0].id,'3')
assert.equal(searchAtlas(items,'missing').length,0)
assert.equal(searchAtlas(items,'   ').length,0)
assert.ok(searchSnippet({...items[0],body:'x'.repeat(500)+' dark red end'},'dark red').includes('dark red'))
const world=JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json',import.meta.url)))
const countries=feature(world,world.objects.countries).features
assert.equal(countries.length,241)
for(const [name,lng,lat] of [['Belarus',27.6,53.9],['China',116.4,39.9],['Saudi Arabia',46.7,24.7],['Namibia',17.1,-22.6],['Nepal',85.3,27.7],['Paraguay',-58,-23],['Russia',178,66],['Russia',-178,66]])assert.equal(countryAt(countries,lng,lat),name)
const filled=safeCountryFill(countries,['Russia'])
assert.equal(countryAt(filled.features,-30,58),null)
assert.equal(countryAt(filled.features,178,66),'Russia')
const start=performance.now();for(let i=0;i<10000;i++)countryAt(countries,-180+i%360,-60+i%130)
console.log(`Search, 241-area geography and Russia regression checks passed. 10,000 cached hit tests: ${Math.round(performance.now()-start)}ms`)
