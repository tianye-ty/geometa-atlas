import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {feature} from 'topojson-client'
import {countryAt} from '../src/mapHitTest.ts'
import {safeCountryFill} from '../src/countrySelection.ts'
const source=stripTypeScriptTypes(readFileSync(new URL('../src/mapStudy.ts',import.meta.url),'utf8')).replace("'./coverage'",JSON.stringify(new URL('../src/coverage.ts',import.meta.url).href))
const {previewClue,isMuted,DEFAULT_STUDY}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
const clues=[{country:'France',title:'Public',body:'',source:'Guide',image:'public.jpg'},{country:'France',title:'Mine',body:'',source:'My note'},{country:'France',title:'Regional photo',body:'',source:'My note',image:'mine.jpg',regionIds:['FR-53']}]
assert.equal(previewClue(clues,'France',null).title,'Regional photo')
assert.equal(previewClue(clues,'France','FR-28').title,'Mine')
assert.equal(previewClue(clues,'China',null),undefined)
assert.equal(isMuted('China','study',DEFAULT_STUDY,new Set()),true)
assert.equal(isMuted('China','all',[],new Set()),false)
assert.equal(isMuted('China','notes',[],new Set(['China'])),false)
assert.equal(isMuted('France','notes',DEFAULT_STUDY,new Set()),true)
const world=JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json',import.meta.url)))
const countries=feature(world,world.objects.countries).features
for(const shift of [-1080,-360,0,360,1080]){
 assert.equal(countryAt(countries,116.4+shift,39.9),'China')
 assert.equal(countryAt(countries,178+shift,66),'Russia')
 assert.equal(countryAt(countries,-178+shift,66),'Russia')
}
const fill=safeCountryFill(countries,countries.map(f=>f.properties.name))
for(const f of fill.features)for(const poly of f.geometry.coordinates)for(const ring of poly)for(const p of ring)assert.ok(p[0]>=-180.000001&&p[0]<=180.000001)
console.log('Map preview priorities, scope modes, wrapped hit testing and dateline-safe fills passed')
