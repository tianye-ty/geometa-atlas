import {countryLabel} from './countryFlags'
import {useEffect,useMemo,useRef,useState} from 'react'
import {Search,X} from 'lucide-react'
import {normalizeSearch,searchAtlas,searchSnippet,type SearchResult} from './search'
function Highlight({text,query}:{text:string;query:string}){
 const terms=normalizeSearch(query).split(' ').filter(Boolean)
 const escaped=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))
 if(!escaped.length)return <>{text}</>
 return <>{text.split(new RegExp(`(${escaped.join('|')})`,'gi')).map((part,i)=>terms.includes(normalizeSearch(part))?<mark key={i}>{part}</mark>:part)}</>
}
export default function AtlasSearch({items,onClose,onChoose}:{items:SearchResult[];onClose:()=>void;onChoose:(item:SearchResult)=>void}){
 const [query,setQuery]=useState(''),[kind,setKind]=useState('all'),[active,setActive]=useState(0),[limit,setLimit]=useState(60)
 const panel=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null)
 const results=useMemo(()=>searchAtlas(items,query,kind),[items,query,kind]),shown=results.slice(0,limit)
 useEffect(()=>{const previous=document.activeElement as HTMLElement;input.current?.focus();return()=>{if(previous?.isConnected)previous.focus()}},[])
 useEffect(()=>{setActive(0);setLimit(60)},[query,kind])
 useEffect(()=>{panel.current?.querySelector(`[data-result-index="${active}"]`)?.scrollIntoView({block:'nearest'})},[active])
 return <div className="atlas-search-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div ref={panel} className="atlas-search" role="dialog" aria-modal="true" aria-labelledby="atlas-search-title" onKeyDown={e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose()}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(0,Math.min(shown.length-1,a+(e.key==='ArrowDown'?1:-1))))}
  if(e.key==='Enter'&&e.target===input.current&&shown[active]){e.preventDefault();onChoose(shown[active])}
  if(e.key==='Tab'){const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button,input,[tabindex="0"]')??[]).filter(n=>!n.hasAttribute('disabled'));const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
 }}><header><h2 id="atlas-search-title">Search atlas</h2><button aria-label="Close search" onClick={onClose}><X size={20}/></button></header><label className="atlas-search-input"><Search size={20}/><input ref={input} aria-label="Search countries, notes and guides" placeholder="Country, title, or any words in your notes…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>{setQuery('');input.current?.focus()}}><X size={16}/></button>}</label><div className="search-kind" aria-label="Search in">{[['all','Everything'],['country','Countries & territories'],['note','My notes'],['guide','Guide']].map(([key,label])=><button key={key} aria-pressed={kind===key} onClick={()=>setKind(key)}>{label}</button>)}</div><p className="search-summary" role="status">{query.trim()?`${results.length} results · All countries and categories`:'Search saved text, including observations, regions and source links. Photos are not text-searched.'}</p><div className="atlas-search-results">{shown.map((item,i)=><button className={i===active?'search-result active':'search-result'} data-result-index={i} key={item.kind+item.id} onMouseEnter={()=>setActive(i)} onClick={()=>onChoose(item)}>{item.image&&<img src={item.image} alt="" loading="lazy"/>}<span><small>{item.kind==='country'?'Country / territory':item.kind==='note'?'My notes':'Guide'} · {countryLabel(item.country)}</small><strong><Highlight text={item.kind==='country'?countryLabel(item.title):item.title} query={query}/></strong>{item.kind!=='country'&&<span className="search-snippet"><Highlight text={searchSnippet(item,query)} query={query}/></span>}</span></button>)}{query.trim()&&!results.length&&<div className="search-empty">No matches. Try fewer words or a country name.</div>}{results.length>limit&&<button className="search-more" onClick={()=>setLimit(n=>n+60)}>Show more results ({results.length-limit} remaining)</button>}</div><footer>↑ ↓ to select · Enter to open · Esc to close</footer></div></div>
}
