import type {Category} from './types'
export type SearchResult={id:string;kind:'country'|'note'|'guide';country:string;title:string;body:string;category?:Category;region?:string;sourceUrl?:string;aliases?:string;image?:string;distinction?:string;confusedWith?:string[];photoDetails?:{caption?:string}[]}
export const normalizeSearch=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()
export function searchAtlas(items:SearchResult[],query:string,kind='all'){
 const q=normalizeSearch(query),terms=q.split(' ').filter(Boolean)
 if(!q)return []
 return items.filter(item=>(kind==='all'||kind===item.kind)&&terms.every(term=>normalizeSearch([item.title,item.body,item.country,item.category,item.region,item.sourceUrl,item.aliases,item.distinction,item.confusedWith?.join(' '),item.photoDetails?.map(d=>d.caption??'').join(' ')].filter(Boolean).join(' ')).includes(term))).sort((a,b)=>{
  const rank=(x:SearchResult)=>normalizeSearch(x.title)===q?0:normalizeSearch(x.title).startsWith(q)?1:normalizeSearch(x.title).includes(q)?2:x.kind==='country'?3:4
  return rank(a)-rank(b)||a.country.localeCompare(b.country)||a.title.localeCompare(b.title)
 })
}
export function searchSnippet(item:SearchResult,query:string){
 const text=[item.body,item.region,item.distinction,item.photoDetails?.map(d=>d.caption??'').join(' '),item.sourceUrl].filter(Boolean).join(' · ')
 const terms=normalizeSearch(query).split(' ').filter(Boolean),at=terms.reduce((best,t)=>{const n=normalizeSearch(text).indexOf(t);return n<0?best:Math.min(best,n)},Infinity)
 const start=Number.isFinite(at)?Math.max(0,at-55):0
 return (start?'…':'')+text.slice(start,start+200)+(text.length>start+200?'…':'')
}
