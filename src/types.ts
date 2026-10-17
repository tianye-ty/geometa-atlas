export type Category =
  | 'all'
  | 'bollards'
  | 'roadMarkings'
  | 'plates'
  | 'utilityPoles'
  | 'signs'
  | 'googleCar'

export type ClueCategory = Exclude<Category, 'all'>

export interface SourceRef {
  name: string
  url: string
}

export interface PublicClue {
  id: string
  category: ClueCategory
  title: string
  description: string
  reliability: 'Identification' | 'Supporting clue' | 'Regional clue'
  source: SourceRef
}

export interface Trait {
  label: string
  value: string
}

export interface CountryProfile {
  name: string
  localName: string
  flag: string
  region: string
  summary: string
  level: 'Starter guide' | 'Preliminary'
  traits: Record<string, Trait>
  clues: PublicClue[]
}

export interface Note {
  photoDetails?: PhotoDetail[]
  confusedWith?: string[]
  distinction?: string
  review?: {due:string;interval:number;repetitions:number}
  id: string
  country: string
  title: string
  body: string
  category: ClueCategory
  image?: string
  images?: string[]
  sourceUrl?: string
  region?: string
  regionId?: string
  regionIds?: string[]
  helpful?: boolean
  createdAt: string
  updatedAt: string
}

export type PhotoMark={kind:'box'|'arrow';x:number;y:number;x2:number;y2:number}
export type PhotoDetail={caption?:string;marks?:PhotoMark[]}

export interface ImportBundle {
  app: 'GeoMeta Atlas'
  version: 1
  exportedAt: string
  notes: Note[]
}
