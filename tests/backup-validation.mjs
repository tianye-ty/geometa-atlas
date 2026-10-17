import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
const source=readFileSync(new URL('../src/guideDb.ts',import.meta.url),'utf8')
const js=stripTypeScriptTypes(source).replace("'./imageUpload'",JSON.stringify(new URL('../src/imageUpload.ts',import.meta.url).href))
const {validateRecords}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const n={id:'qa',country:'Spain',title:'Test',body:'',category:'bollards',createdAt:'2026-10-16',updatedAt:'2026-10-16',images:['data:image/avif;base64,AA=='],photoDetails:[{caption:'Reflector',marks:[{kind:'arrow',x:10,y:20,x2:30,y2:40}]}],regionIds:['ES-28','ES-43'],confusedWith:['Portugal'],distinction:'Test difference',review:{due:'2026-10-17T00:00:00Z',interval:1,repetitions:1}}
assert.ok(validateRecords(JSON.parse(JSON.stringify([n]))))
assert.ok(validateRecords([{...n,images:undefined,image:'data:image/avif;base64,AA==',photoDetails:undefined}]))
assert.ok(!validateRecords([{...n,photoDetails:[{caption:3}]}]))
assert.ok(!validateRecords([{...n,photoDetails:[{marks:[{kind:'arrow',x:Infinity,y:20,x2:30,y2:40}]}]}]))
assert.ok(!validateRecords([{...n,confusedWith:[42]}]))
assert.ok(!validateRecords([{...n,review:{due:'invalid',interval:1,repetitions:1}}]))
console.log('AVIF, annotations, multi-province scopes, confusion notes and review backup validation passed')
