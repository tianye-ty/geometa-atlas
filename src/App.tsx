import PhotoAnnotation from './PhotoAnnotation'
import {hasRegions} from './franceRegions'
import {ALL_COUNTRIES} from './atlasCountries'
import {countryLabel} from './countryFlags'
import type {PhotoDetail} from './types'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  BookOpen,
  CarFront,
  Check,
  ChevronRight,
  CircleDot,
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  ImagePlus,
  Info,
  Landmark,
  Map as MapIcon,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Route,
  Search,
  ShieldCheck,
  Signpost,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import { CATEGORY_META, DEFAULT_COUNTRY, GENERAL_SOURCES, PROFILES } from './data'
import { deleteNote, getAllNotes, importNotes, putNote } from './db'
import type { Category, ClueCategory, ImportBundle, Note } from './types'
import { ROAD_COVERAGE } from './coverage'
import { VISUAL_REFERENCES, type VisualReference } from './visualReferences'
import StudyMap from './StudyMap'
import VisualCompare from './VisualCompare'
import { imageUploadError, IMAGE_TYPES,MAX_IMAGES,noteImages } from './imageUpload'
import PhotoGallery from './PhotoGallery'
import { noteRegionIds, scopeName } from './franceRegions'
import RegionPicker from './RegionPicker'

const categoryIcons: Record<Category, typeof CircleDot> = {
  all: MapIcon,
  bollards: Landmark,
  roadMarkings: Route,
  plates: FileText,
  utilityPoles: Zap,
  signs: Signpost,
  googleCar: CarFront,
}

const countryNames = [...ROAD_COVERAGE].sort((a,b)=>a.localeCompare(b))
export { NoteModal, NotesPanel }

function EmptyProfile({ country, onAdd }: { country: string; onAdd: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><MapPin size={22} /></div>
      <p className="eyebrow">START YOUR FIELD NOTES</p>
      <h2>{country}</h2>
      <p>No reference guide has been added yet. You can still collect your own observations here.</p>
      <button className="primary-button" onClick={onAdd}><Plus size={16} /> Add your first note</button>
    </div>
  )
}

function PublicPanel({ country, category, onSaveReference }: { country: string; category: Category; onSaveReference:(ref:VisualReference)=>void }) {
  const [mode,setMode] = useState<'samples'|'publisher'>('samples')
  const [failed,setFailed] = useState<Record<string,boolean>>({})
  const slug = country === 'United Kingdom' ? 'uk' : country === 'United States of America' ? 'united-states' : country === 'Dominican Rep.' ? 'dominican-republic' : country === 'eSwatini' ? 'eswatini' : country.toLowerCase().replaceAll(' ','-')
  const url = `https://www.plonkit.net/${slug}`
  const profile=PROFILES[country]
  const refs=VISUAL_REFERENCES.filter(r=>r.country===country&&(category==='all'||r.category===category))
  return <div className="reference-reader">
    <div className="reference-heading"><div><p className="eyebrow">SOURCE REFERENCES</p><h2>{profile?.flag} {country}</h2></div><a href={url} target="_blank" rel="noreferrer" aria-label="Open original guide"><ExternalLink size={18}/></a></div>
    <div className="reference-mode"><button className={mode==='samples'?'active':''} onClick={()=>setMode('samples')}>Visual clues</button><button className={mode==='publisher'?'active':''} onClick={()=>setMode('publisher')}>Source guide</button></div>
    {mode==='publisher' ? <div className="visual-reader"><div className="visual-empty"><BookOpen size={30}/><h3>Read the original Plonk It guide</h3><p>The complete guide opens on Plonk It, with its original text, images and regional examples.</p><a className="primary-button" href={url} target="_blank" rel="noreferrer">Open source guide <ExternalLink size={16}/></a></div></div> : <div className="visual-reader">
      <p className="reference-intro">See the clue first. Selected examples link to the source guide and its Street View location.</p>
      {refs.length ? refs.map(ref=><article className="visual-clue" key={ref.image}><div className="visual-clue-top"><span>{CATEGORY_META[ref.category].label}</span><span>Plonk It reference</span></div><h3>{ref.title}</h3>
       {ref.photo ? <><a className="source-image-link" href={ref.photo.page} target="_blank" rel="noreferrer">{!failed[ref.photo.url] ? <img src={ref.photo.url} alt={ref.title+' — Wikimedia Commons reference photograph'} loading="lazy" onError={()=>setFailed(v=>({...v,[ref.photo!.url]:true}))}/> : <div className="source-image-fallback">Photo unavailable. Open its source page ↗</div>}</a><div className="photo-attribution">Photo: <a href={ref.photo.page} target="_blank" rel="noreferrer">{ref.photo.author}</a> · <a href={ref.photo.licenseUrl} target="_blank" rel="noreferrer">{ref.photo.license}</a> · Unmodified. Separate photo, not a Plonk It image.</div></> : <a className="source-only-preview" href={ref.location??ref.guide} target="_blank" rel="noreferrer"><ImagePlus size={23}/><span>View original example on source site ↗</span></a>}
       {ref.quote&&<blockquote>“{ref.quote}”<cite>— Plonk It, short excerpt</cite></blockquote>}
       <div className="visual-source-links"><button onClick={()=>onSaveReference(ref)}>Save to my notes</button><a href={ref.guide} target="_blank" rel="noreferrer">Read source guide <ExternalLink size={13}/></a>{ref.location&&<a href={ref.location} target="_blank" rel="noreferrer">Street View example <ExternalLink size={13}/></a>}</div>
      </article>) : <div className="visual-empty"><ImagePlus size={28}/><h3>No selected image in this category yet</h3><p>Read the original guide for the publisher's complete text and images.</p><button className="primary-button" onClick={()=>setMode('publisher')}>Read original guide</button></div>}
      <p className="source-credit">Text: short Plonk It excerpts. Inline photos: separately credited Wikimedia Commons examples. The complete publisher library remains on its own website.</p>
    </div>}
  </div>
}

function NotesPanel({ country, notes, onAdd, onEdit, onDelete }: { country: string; notes: Note[]; onAdd: () => void; onEdit: (note: Note) => void; onDelete: (id: string) => void }) {
  const countryNotes = notes.filter((note) => note.country === country).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return (
    <div className="panel-scroll">
      <div className="my-notes-hero"><span className="notes-storage-label">Saved on this device</span><button className="icon-label-button" onClick={onAdd}><Plus size={17} /> New note</button></div>
      {countryNotes.length ? <div className="note-list">{countryNotes.map((note) => <article className="note-card" data-entry-id={note.id} tabIndex={-1} key={note.id}>
        <PhotoGallery note={note}/>
        <div className="note-card-body"><div className="note-meta"><span>{CATEGORY_META[note.category].label}</span><time>{new Date(note.updatedAt).toLocaleDateString('en-US')}</time></div><h3>{note.title}</h3>{note.body&&<p>{note.body}</p>}
          <div className="note-actions"><button onClick={() => onEdit(note)}><Pencil size={14} /> Edit</button><button className="danger" onClick={() => onDelete(note.id)}><Trash2 size={14} /> Delete</button></div>
        </div>
      </article>)}</div> : <div className="notes-empty"><h3>No notes yet</h3><p>Add a screenshot and a short observation.</p></div>}
    </div>
  )
}

function NoteModal({ country, initial, isExisting, onClose, onSave, kind='note',initialRegionId='',initialRegionIds=[],initialCategory='bollards' }: { country: string; initial?: Note; isExisting?: boolean; onClose: () => void; onSave: (note: Note) => void; kind?:'guide'|'note';initialRegionId?:string;initialRegionIds?:string[];initialCategory?:ClueCategory }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [category, setCategory] = useState<ClueCategory>(initial?.category ?? initialCategory)
  const [images, setImages] = useState<string[]>(()=>initial?noteImages(initial):[])
  const [photoDetails,setPhotoDetails]=useState<PhotoDetail[]>(initial?.photoDetails??[])
  const [annotating,setAnnotating]=useState<number|null>(null)
  const [confusedWith,setConfusedWith]=useState<string[]>(initial?.confusedWith??[])
  const [distinction,setDistinction]=useState(initial?.distinction??'')
  const [mixup,setMixup]=useState('')
  const [region,setRegion] = useState(initial?.region ?? '')
  const [regionIds,setRegionIds] = useState<string[]>(()=>initial?noteRegionIds(initial):initialRegionIds.length?initialRegionIds:initialRegionId?[initialRegionId]:[])
  const [sourceUrl,setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [helpful,setHelpful] = useState(initial?.helpful ?? false)
  const [dragging,setDragging] = useState(false)
  const [imageError,setImageError] = useState('')
  const [imageLoading,setImageLoading] = useState(false)
  const dragDepth = useRef(0)
  const imageRequest = useRef(0)
  const loadingImages=useRef(false)
  useEffect(()=>()=>{imageRequest.current++},[])

  const chooseImages = async (files: File[]) => {
    if(loadingImages.current){setImageError('Please wait for the current photos to finish loading.');return}
    const error=imageUploadError(files,images.length)
    if(error){setImageError(error);return}
    const request=++imageRequest.current
    setImageError('');setImageLoading(true);loadingImages.current=true
    try{
      const uploaded=await Promise.all(files.map(file=>new Promise<string>((resolve,reject)=>{
        const reader=new FileReader();reader.onerror=()=>reject(Error('read'))
        reader.onload=()=>{const result=reader.result as string,preview=new Image();preview.onerror=()=>reject(Error('decode'));preview.onload=()=>resolve(result);preview.src=result}
        reader.readAsDataURL(file)
      })))
      if(request===imageRequest.current)setImages(current=>[...current,...uploaded])
    }catch{if(request===imageRequest.current)setImageError('One or more photos could not be read. No photos from this batch were added; existing photos are unchanged.')}
    finally{loadingImages.current=false;if(request===imageRequest.current)setImageLoading(false)}
  }
  const submit = () => {
    if (!title.trim() || (kind==='guide' && !body.trim()) || imageLoading) return
    const now = new Date().toISOString()
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) { window.alert('Use an http or https source link.'); return }
    onSave({ ...initial,photoDetails,confusedWith,distinction, id: initial?.id ?? crypto.randomUUID(), country, title: title.trim(), body: body.trim(), category, images,image:undefined, region:hasRegions(country)&&regionIds.length?scopeName(regionIds):region.trim(),regionId:hasRegions(country)&&regionIds.length===1?regionIds[0]:undefined,regionIds:hasRegions(country)?regionIds:undefined,sourceUrl:sourceUrl.trim(),helpful, createdAt: initial?.createdAt ?? now, updatedAt: now })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="note-modal" role="dialog" aria-modal="true" aria-label={kind==='guide'?'Edit guide entry':'Edit personal note'} onPaste={e=>{const files=Array.from(e.clipboardData.files);if(files.length){e.preventDefault();chooseImages(files)}}}
      onDragEnter={e=>{if(Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();dragDepth.current++;setDragging(true)}}}
      onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();e.dataTransfer.dropEffect='copy'}}}
      onDragLeave={e=>{e.preventDefault();dragDepth.current=Math.max(0,dragDepth.current-1);if(!dragDepth.current)setDragging(false)}}
      onDrop={e=>{e.preventDefault();e.stopPropagation();dragDepth.current=0;setDragging(false);chooseImages(Array.from(e.dataTransfer.files))}}>
      <div className="modal-header"><div><p className="eyebrow">{countryLabel(country)} · {kind==='guide'?'Guide library':'personal notes'}</p><h2>{kind==='guide'?'Edit guide entry':isExisting ? 'Edit note' : initial ? 'Save reference' : 'Add observation'}</h2></div><button className="round-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      {kind==='note'&&<p className="note-required-hint">* Required. All other fields are optional.</p>}
      <label>{kind==='note'?'Title *':'Title'}<input required aria-required="true" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pole labels on a rural road" autoFocus /></label>
      <label>Category<select value={category} onChange={(e) => setCategory(e.target.value as ClueCategory)}>{Object.entries(CATEGORY_META).filter(([key]) => key !== 'all').map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}</select></label>
      <label>{kind==='guide'?'Guide explanation':'Your observation'}<textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder={kind==='guide'?'Explain the clue in your own words and retain source attribution.':'Add more detail if useful.'} /></label>
      {hasRegions(country)?<div className="note-region-field"><span>{country==='Spain'?'Spanish provinces':'French regions'}</span><RegionPicker country={country} label="Note regions" value={regionIds} onChange={ids=>{setRegionIds(ids);setRegion('')}}/><small>{region&&!regionIds.length?`Existing custom region: ${region}`:regionIds.length?'Applies to every selected region.':'No selection = country-wide.'}</small></div>:<label>{kind==='note'?'Region':'Region (optional)'}<input value={region} onChange={e=>setRegion(e.target.value)} placeholder="e.g. Bavaria, Sabah" /></label>}
      <label>{kind==='note'?'Original source':'Original source (optional)'}<input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://www.plonkit.net/..." /></label>
      {kind==='note'&&<label className="helpful-check"><input type="checkbox" checked={helpful} onChange={e=>setHelpful(e.target.checked)}/> Mark as most helpful for me</label>}
      <div className={`image-picker image-drop-zone ${dragging?'is-dragging':''}`} aria-label="Image drop area" aria-busy={imageLoading}>
        {images.length>0&&<div className="draft-photo-grid">{images.map((url,i)=><div className="draft-photo" key={i}><img src={url} alt={`Note image preview ${i+1}`}/><button type="button" disabled={imageLoading} aria-label={`Remove image ${i+1}`} onClick={()=>{setImages(current=>current.filter((_,index)=>index!==i));setPhotoDetails(current=>images.filter((_,index)=>index!==i).map((_,newIndex)=>current[newIndex>=i?newIndex+1:newIndex]??{}));setImageError('')}}><X size={13}/> Remove</button><button type="button" disabled={imageLoading} onClick={()=>setAnnotating(i)}>Annotate / caption</button>{i>0&&<button type="button" onClick={()=>{const next=[...images];[next[i-1],next[i]]=[next[i],next[i-1]];setImages(next);const details=images.map((_,j)=>photoDetails[j]??{});[details[i-1],details[i]]=[details[i],details[i-1]];setPhotoDetails(details)}}>Move earlier</button>}</div>)}</div>}
        <label className="upload-box"><ImagePlus size={22} /><span>{dragging?'Drop photos here':images.length?'Drag more photos here, or click to add':'Drag photos here, or click to upload'}</span><small>{images.length} / {MAX_IMAGES} photos · JPG / PNG / WebP / GIF / AVIF / BMP · 3 MB each · ⌘V / Ctrl+V</small><input aria-label="Upload images" type="file" multiple disabled={imageLoading} accept={IMAGE_TYPES.join(',')} onChange={e=>{if(e.target.files?.length)chooseImages(Array.from(e.target.files));e.target.value=''}} /></label>
        {imageLoading&&<p className="image-upload-status" role="status">Loading photos…</p>}
        {imageError&&<p className="image-upload-error" role="alert">{imageError}</p>}
      </div>
      {kind==='note'&&<details className="mixup-editor"><summary>Similar countries & key difference</summary><label>Add a similar country<select aria-label="Similar country" value={mixup} onChange={e=>{const c=e.target.value;if(c&&!confusedWith.includes(c))setConfusedWith(v=>[...v,c]);setMixup('')}}><option value="">Choose a country</option>{ALL_COUNTRIES.filter(c=>c!==country&&!confusedWith.includes(c)).map(c=><option value={c} key={c}>{countryLabel(c)}</option>)}</select></label><div className="country-chips">{confusedWith.map(c=><button type="button" key={c} onClick={()=>setConfusedWith(v=>v.filter(n=>n!==c))}>{countryLabel(c)} ×</button>)}</div><label>Key difference<textarea value={distinction} onChange={e=>setDistinction(e.target.value)} placeholder="What helps you tell them apart?" rows={2}/></label></details>}
      {annotating!==null&&<PhotoAnnotation src={images[annotating]} initial={photoDetails[annotating]} onCancel={()=>setAnnotating(null)} onDone={detail=>{setPhotoDetails(current=>images.map((_,i)=>i===annotating?detail:current[i]??{}));setAnnotating(null)}}/>}
      <div className="modal-footer"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!title.trim() || (kind==='guide' && !body.trim()) || imageLoading} onClick={submit}><Check size={16} /> {kind==='guide'?'Save guide':'Save note'}</button></div>
    </section>
  </div>
}

function CompareView({ onClose, initialA, initialB }: { onClose: () => void; initialA: string; initialB: string }) {
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)
  const [category, setCategory] = useState<Category>('all')
  const pa = PROFILES[a]
  const pb = PROFILES[b]
  const common: Array<{ label: string; value: string }> = []
  const differences: Array<{ label: string; a: string; b: string }> = []
  if (pa && pb) {
    const keys = [...new Set([...Object.keys(pa.traits), ...Object.keys(pb.traits)])]
    keys.forEach((key) => {
      const ta = pa.traits[key], tb = pb.traits[key]
      if (!ta || !tb) return
      if (ta.value === tb.value) common.push({ label: ta.label, value: ta.value })
      else differences.push({ label: ta.label, a: ta.value, b: tb.value })
    })
  }
  const clueFilter = (name: string) => PROFILES[name]?.clues.filter((clue) => category === 'all' || clue.category === category) ?? []
  const swap = () => { setA(b); setB(a) }
  return <div className="compare-overlay">
    <header className="compare-header"><div><p className="eyebrow">COMPARE MODE</p><h1>Compare countries</h1></div><button className="round-button light" onClick={onClose} aria-label="Close comparison"><X size={20} /></button></header>
    <div className="compare-toolbar">
      <label><span>Country A</span><select value={a} onChange={(e) => setA(e.target.value)}>{countryNames.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
      <button className="swap-button" onClick={swap} aria-label="Swap countries"><ArrowLeftRight size={18} /></button>
      <label><span>Country B</span><select value={b} onChange={(e) => setB(e.target.value)}>{countryNames.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
    </div>
    <div className="compare-categories">{(Object.keys(CATEGORY_META) as Category[]).map((key) => <button key={key} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>{CATEGORY_META[key].label}</button>)}</div>
    {!pa || !pb ? <div className="compare-empty"><MapPin size={28} /><h2>More references needed</h2><p>One of these countries has no structured reference guide yet. You can still add personal notes from its country page.</p></div> : <main className="compare-content">
      <section className="compare-summary-grid">
        <div className="compare-country-card"><span>{pa.flag}</span><div><p>{pa.region}</p><h2>{pa.localName}</h2><small>{pa.name}</small></div></div>
        <div className="versus">VS</div>
        <div className="compare-country-card right"><span>{pb.flag}</span><div><p>{pb.region}</p><h2>{pb.localName}</h2><small>{pb.name}</small></div></div>
      </section>
      <section className="comparison-block"><div className="block-title"><Check size={17} /><h3>Shared clues</h3><span>{common.length}</span></div>{common.length ? <div className="common-grid">{common.map((item) => <div key={item.label}><strong>{item.label}</strong><p>{item.value}</p></div>)}</div> : <p className="muted-copy">No identical reference traits yet. Explore the differences below.</p>}</section>
      <section className="comparison-block"><div className="block-title accent"><ArrowLeftRight size={17} /><h3>Key differences</h3><span>{differences.length}</span></div><div className="difference-table">{differences.map((item) => <div className="difference-row" key={item.label}><strong>{item.label}</strong><p>{item.a}</p><p>{item.b}</p></div>)}</div></section>
      <section className="comparison-block"><div className="block-title"><CircleDot size={17} /><h3>Side-by-side clues</h3><span>{clueFilter(a).length + clueFilter(b).length}</span></div>
        <div className="side-by-side"><div><h4>{pa.flag} {pa.localName}</h4>{clueFilter(a).map((clue) => <article className="mini-clue" key={clue.id}><span>{CATEGORY_META[clue.category].label}</span><h5>{clue.title}</h5><p>{clue.description}</p><a href={clue.source.url} target="_blank" rel="noreferrer">Source <ExternalLink size={12} /></a></article>)}</div><div><h4>{pb.flag} {pb.localName}</h4>{clueFilter(b).map((clue) => <article className="mini-clue" key={clue.id}><span>{CATEGORY_META[clue.category].label}</span><h5>{clue.title}</h5><p>{clue.description}</p><a href={clue.source.url} target="_blank" rel="noreferrer">Source <ExternalLink size={12} /></a></article>)}</div></div>
      </section>
    </main>}
  </div>
}

export default function App() {
  const [selected, setSelected] = useState(DEFAULT_COUNTRY)
  const [category, setCategory] = useState<Category>('bollards')
  const [tab, setTab] = useState<'public' | 'notes' | 'helpful'>('public')
  const [hovered,setHovered] = useState<string|null>(null)
  const [compareTarget,setCompareTarget] = useState('Germany')
  const [notes, setNotes] = useState<Note[]>([])
  const [modalNote, setModalNote] = useState<Note | 'new' | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme,setTheme] = useState<'light'|'dark'>(()=>localStorage.getItem('atlas-theme') === 'dark' ? 'dark' : 'light')
  const [mapExpanded,setMapExpanded] = useState(false)
  useEffect(()=>{localStorage.setItem('atlas-theme',theme)},[theme])
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getAllNotes().then(setNotes).catch(() => window.alert('Unable to open your local notebook.')) }, [])
  const filteredCountries = useMemo(() => countryNames.filter((name) => {
    const profile = PROFILES[name]
    const needle = query.toLowerCase()
    return name.toLowerCase().includes(needle) || profile?.localName.includes(query)
  }).slice(0, 12), [query])
  const selectedProfile = PROFILES[selected]
  const noteCount = notes.filter((note) => note.country === selected).length
  const referenceCount = VISUAL_REFERENCES.filter(r=>r.country===selected).length

  const saveNote = async (note: Note) => {
    await putNote(note)
    setNotes((current) => [...current.filter((item) => item.id !== note.id), note])
    setModalNote(null); setTab('notes')
  }
  const removeNote = async (id: string) => {
    if (!window.confirm('Delete this personal note?')) return
    await deleteNote(id); setNotes((current) => current.filter((note) => note.id !== id))
  }
  const exportData = () => {
    const data: ImportBundle = { app: 'GeoMeta Atlas', version: 1, exportedAt: new Date().toISOString(), notes }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `geometa-atlas-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url)
  }
  const importData = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as ImportBundle
      if (parsed.app !== 'GeoMeta Atlas' || !Array.isArray(parsed.notes)) throw new Error('invalid')
      await importNotes(parsed.notes); setNotes(await getAllNotes()); window.alert(`Imported ${parsed.notes.length} notes.`)
    } catch { window.alert('Import failed. Choose a JSON backup exported from GeoMeta Atlas.') }
    if (importRef.current) importRef.current.value = ''
  }
  const chooseCountry = (name: string) => { setSelected(name);setHovered(null); setSearchOpen(false); setQuery(''); setSidebarOpen(false) }
  const activeCountry=hovered??selected

  return <div className={`app-shell theme-${theme} ${mapExpanded ? 'map-expanded' : ''}`}>
    <header className="topbar">
      <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="brand"><span className="brand-mark"><MapPin size={19} /></span><div><strong>GeoMeta</strong><em>ATLAS</em></div></div>
      <div className="global-search">
        <button onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search countries</span><kbd>⌘ K</kbd></button>
        {searchOpen && <div className="search-popover"><div className="search-input"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a country…" autoFocus /><button onClick={() => setSearchOpen(false)}><X size={16} /></button></div><div className="search-results">{filteredCountries.map((name) => <button onClick={() => chooseCountry(name)} key={name}><span>{PROFILES[name]?.flag ?? '🌐'}</span><div><strong>{PROFILES[name]?.localName ?? name}</strong>{PROFILES[name] && <small>{name} · {PROFILES[name].clues.length} references</small>}</div><ChevronRight size={15} /></button>)}</div></div>}
      </div>
      <div className="header-actions">
        <button className="theme-toggle" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'?'☾ Deep purple':'☀ Light mode'}</button>
        <button className="ghost-header" onClick={() => importRef.current?.click()} title="Import notes"><Upload size={16} /><span>Import</span></button>
        <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importData(e.target.files?.[0])} />
        <button className="ghost-header" onClick={exportData} title="Export notes"><Download size={16} /><span>Export</span></button>
        <button className="compare-button" onClick={() => setCompareOpen(true)}><ArrowLeftRight size={17} /><span>Compare countries</span></button>
      </div>
    </header>
    <div className="workspace">
      <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="study-nav"><p className="eyebrow">YOUR ATLAS</p><button className={tab === 'public' ? 'active' : ''} onClick={() => { setTab('public'); setSidebarOpen(false) }}><BookOpen size={18} /> Country guide</button><button className={tab === 'notes' ? 'active' : ''} onClick={() => { setTab('notes'); setSidebarOpen(false) }}><Pencil size={18} /> My notes <span>{noteCount}</span></button><button onClick={() => setCompareOpen(true)}><ArrowLeftRight size={18} /> Compare countries</button></div>
        <label className="country-picker">Study a country<select value={selected} onChange={(e) => chooseCountry(e.target.value)}>{countryNames.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
        <div className="sidebar-label"><span>CLUE CATEGORIES</span><small>{referenceCount} samples</small></div>
        <nav className="category-nav">{(Object.keys(CATEGORY_META) as Category[]).map((key) => { const Icon = categoryIcons[key]; const count = VISUAL_REFERENCES.filter(r=>r.country===selected&&(key==='all'||r.category===key)).length; return <button key={key} className={category === key ? 'active' : ''} onClick={() => { setCategory(key); setSidebarOpen(false) }}><span><Icon size={17} /></span><strong>{CATEGORY_META[key].label}</strong>{selectedProfile && <em>{count}</em>}</button> })}</nav>
        <button className="helpful-nav" onClick={()=>setTab('helpful')}>★ Most helpful <span>{notes.filter(n=>n.helpful).length}</span></button>
        <div className="sidebar-divider" />
        <div className="coverage-card"><p className="eyebrow">REFERENCE LIBRARY</p><div><span className="dot rich" /><strong>Visual samples</strong><small>{VISUAL_REFERENCES.length} examples</small></div><div><span className="dot open" /><strong>Personal notes</strong><small>Study list</small></div></div>
        <div className="sidebar-tip"><CloudUpload size={17} /><div><strong>Saved on this device</strong><p>Export regularly to keep a backup.</p></div></div>
        <div className="source-links"><span>REFERENCE SOURCES</span>{GENERAL_SOURCES.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.name}>{source.name}<ExternalLink size={11} /></a>)}</div>
      </aside>
      <main className="map-stage">
        <div className="map-toolbar"><strong className="google-map-label"><MapPin size={16}/> OpenStreetMap · {CATEGORY_META[category].label}</strong><button onClick={() => setMapExpanded(!mapExpanded)}>{mapExpanded ? 'Restore panels' : 'Expand map'}</button></div>
        <StudyMap selected={selected} category={category} notes={notes} onHover={setHovered} onSelect={chooseCountry} onCompare={name=>{setCompareTarget(name);setCompareOpen(true)}} />
      </main>
      <aside className="detail-panel">
        <div className="panel-tabs"><button className={tab === 'public' ? 'active' : ''} onClick={() => setTab('public')}><BookOpen size={16} /> References</button><button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}><Pencil size={16} /> My notes {noteCount > 0 && <span>{noteCount}</span>}</button></div>
        <div className="selection-status">{hovered ? `HOVER PREVIEW · ${hovered}` : `PINNED COUNTRY · ${selected}`}</div>
        {tab === 'helpful' ? <div className="panel-scroll helpful-panel"><p className="eyebrow">YOUR PERSONAL PICKS</p><h2>Most helpful</h2><p>Not a community ranking. Mark a personal note as helpful to keep it here.</p>{notes.filter(n=>n.helpful&&(category==='all'||n.category===category)).map(n=><article className="note-card" key={n.id}>{n.image&&<img src={n.image} alt={n.title}/>}<div className="note-card-body"><small>{n.country} · {n.region||'Country-wide'}</small><h3>{n.title}</h3><p>{n.body}</p><button onClick={()=>{chooseCountry(n.country);setTab('notes')}}>Open country notes</button><button onClick={()=>setModalNote(n)}>Edit</button></div></article>)}{!notes.some(n=>n.helpful)&&<p>No picks yet. Add a note and check “Most helpful for me”.</p>}</div> : tab === 'public' ? <PublicPanel key={activeCountry} country={activeCountry} category={category} onSaveReference={ref=>{const now=new Date().toISOString();setModalNote({id:crypto.randomUUID(),country:ref.country,title:ref.title,category:ref.category,sourceUrl:ref.guide,body:`Source: ${ref.guide}\n${ref.quote ? `Plonk It excerpt: ${ref.quote}` : 'Original example: '+(ref.location??ref.guide)}${ref.photo ? `\nPhoto: ${ref.photo.author}, ${ref.photo.license}. Unmodified.\n${ref.photo.page}\n${ref.photo.licenseUrl}` : ''}`,image:ref.photo?.url,createdAt:now,updatedAt:now})}} /> : <NotesPanel country={activeCountry} notes={notes.filter(n=>category==='all'||n.category===category)} onAdd={() => {setSelected(activeCountry);setHovered(null);setModalNote('new')}} onEdit={(note) => setModalNote(note)} onDelete={removeNote} />}
      </aside>
    </div>
    {modalNote && <NoteModal country={modalNote==='new'?selected:modalNote.country} initial={modalNote === 'new' ? undefined : modalNote} isExisting={modalNote !== 'new' && notes.some(n=>n.id===modalNote.id)} onClose={() => setModalNote(null)} onSave={saveNote} />}
    {compareOpen && <VisualCompare onClose={() => setCompareOpen(false)} a={selected} b={compareTarget===selected?'France':compareTarget} initialCategory={category} notes={notes} />}
  </div>
}
