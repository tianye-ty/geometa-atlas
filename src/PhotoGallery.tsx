import {useState} from 'react'
import {createPortal} from 'react-dom'
import type {Note} from './types'
import {AnnotatedImage} from './PhotoAnnotation'
import {noteImages} from './imageUpload'
export default function PhotoGallery({note}:{note:Pick<Note,'title'|'image'|'images'|'photoDetails'>}){
 const [active,setActive]=useState<number|null>(null)
 const images=noteImages(note)
 if(!images.length)return null
 const index=Math.min(active??0,images.length-1)
 const move=(step:number)=>setActive((index+step+images.length)%images.length)
 return <div className="note-photo-gallery"><div className={`note-photo-grid ${images.length===1?'one-photo':''}`}>{images.map((url,i)=><button key={i} type="button" aria-label={`View ${note.title} image ${i+1}`} onClick={()=>setActive(i)}><AnnotatedImage src={url} alt={`${note.title} — image ${i+1}`} detail={note.photoDetails?.[i]}/>{note.photoDetails?.[i]?.caption&&<span className="photo-caption">{note.photoDetails[i].caption}</span>}</button>)}</div><small className="photo-count">{images.length} {images.length===1?'photo':'photos'} · Click to enlarge</small>{active!==null&&createPortal(<div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`${note.title} photos`} onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null)}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setActive(null)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}}}><div className="photo-lightbox-panel"><header><span>{note.title} · {index+1} / {images.length}</span><button type="button" aria-label="Close photos" autoFocus onClick={()=>setActive(null)}>Close ×</button></header><AnnotatedImage src={images[index]} alt={`${note.title} — image ${index+1}`} detail={note.photoDetails?.[index]}/>{note.photoDetails?.[index]?.caption&&<p className="photo-caption">{note.photoDetails[index].caption}</p>}{images.length>1&&<footer><button type="button" onClick={()=>move(-1)}>← Previous</button><button type="button" onClick={()=>move(1)}>Next →</button></footer>}</div></div>,document.body)}</div>
}
