import type {Note} from './types'
export function nextReview(previous:Note['review'],rating:'again'|'good'|'easy',now=Date.now()):NonNullable<Note['review']>{
 const interval=rating==='again'?0:rating==='easy'?Math.max(4,(previous?.interval??0)*3):Math.max(1,(previous?.interval??0)*2)
 return {interval,repetitions:(previous?.repetitions??0)+1,due:new Date(now+(interval?interval*86400000:600000)).toISOString()}
}
export const isDue=(note:Note,now=Date.now())=>!note.review||new Date(note.review.due).getTime()<=now
