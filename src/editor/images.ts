const DB='crona-atelier-images',STORE='images';
export class ImageFailure extends Error {constructor(public code:'imageType'|'imageSize'|'imageDecode'|'imageStore'){super(code);}}
function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
 if(!window.indexedDB){reject(new ImageFailure('imageStore'));return;}
 const request=indexedDB.open(DB,1);let abandoned=false;
 request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
 request.onsuccess=()=>{if(abandoned){request.result.close();return;}resolve(request.result);};request.onerror=()=>reject(new ImageFailure('imageStore'));request.onblocked=()=>{abandoned=true;reject(new ImageFailure('imageStore'));};
});}
export async function storeImage(key:string,blob:Blob){
 const db=await openDB();try{await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),count=store.count();
  count.onsuccess=()=>{if(count.result>=80){tx.abort();return;}store.put(blob,key);};
  tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(new ImageFailure('imageStore'));
 });}finally{db.close();}
}
export async function getImage(key:string):Promise<Blob|undefined>{const db=await openDB();try{return await new Promise((resolve,reject)=>{
 const request=db.transaction(STORE).objectStore(STORE).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new ImageFailure('imageStore'));
});}finally{db.close();}}
// Only called at reset. Regular restores retain blobs for Undo/Redo.
export async function clearImages(){const db=await openDB();try{await new Promise<void>((resolve,reject)=>{
 const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(new ImageFailure('imageStore'));
});}finally{db.close();}}
export async function prepareImage(file:File):Promise<Blob>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new ImageFailure('imageType');
 if(file.size>8*1024*1024)throw new ImageFailure('imageSize');
 let bitmap:ImageBitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw new ImageFailure('imageDecode');}
 try{
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>40e6)throw new ImageFailure('imageSize');
  const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const context=canvas.getContext('2d');if(!context)throw new ImageFailure('imageDecode');
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.88));
  if(!blob||blob.size>3*1024*1024)throw new ImageFailure('imageSize');return blob;
 }finally{bitmap.close();}
}
