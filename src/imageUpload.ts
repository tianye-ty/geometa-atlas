export const IMAGE_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/avif','image/bmp']
export const MAX_IMAGES=12
export function imageUploadError(files: {type:string;size:number}[],existing=0):string|null {
 if(!files.length)return 'Choose one or more image files.'
 if(existing+files.length>MAX_IMAGES)return `Each entry supports up to ${MAX_IMAGES} photos. Remove a photo before adding more.`
 if(files.some(file=>!IMAGE_TYPES.includes(file.type)))return 'Choose JPG, PNG, WebP, GIF, AVIF or BMP image files.'
 if(files.some(file=>file.size>3_000_000))return 'An image is too large. Each image must be up to 3 MB.'
 return null
}
export function noteImages(note:{image?:string;images?:string[]}){return Array.isArray(note.images)?note.images:note.image?[note.image]:[]}
export function validImageUrl(value:unknown):value is string{return typeof value==='string'&&(/^https:\/\//i.test(value)||/^data:image\/(png|jpeg|webp|gif|avif|bmp);base64,/i.test(value))}
