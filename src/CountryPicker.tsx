import {countryLabel} from './countryFlags'
import {useState} from 'react'
export default function CountryPicker({countries,value,onChange}:{countries:string[];value:string[];onChange:(names:string[])=>void}){
 const [query,setQuery]=useState('')
 return <details className="country-multi-picker"><summary aria-label="Select countries">{value.length>1?`${value.length} countries selected`:'Select multiple countries'}<span>⌄</span></summary><div className="country-multi-options" role="group" aria-label="Countries to study"><input aria-label="Find countries to select" placeholder="Find a country" value={query} onChange={e=>setQuery(e.target.value)}/>{countries.filter(c=>c.toLowerCase().includes(query.toLowerCase())).map(c=><label key={c}><input type="checkbox" checked={value.includes(c)} disabled={value.length===1&&value.includes(c)} onChange={e=>onChange(e.target.checked?[...value,c]:value.filter(n=>n!==c))}/>{countryLabel(c)}</label>)}</div></details>
}
