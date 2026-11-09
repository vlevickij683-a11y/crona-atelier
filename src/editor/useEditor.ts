import { publicAsset } from '../assets';
import {useCallback,useEffect,useReducer,useRef,useState} from 'react';
import {products,type Product} from '../store/catalog';
import {EDITOR_KEY,MAX_PRODUCTS,createProduct,historyReducer,moveProduct,patchProduct,readDocument,withPromotion,type DemoDocument,type EditableProduct,type History} from './model';
import {clearImages,getImage,ImageFailure,prepareImage,storeImage} from './images';

export function useEditor(){
 const [initial]=useState(readDocument);
 const [history,dispatch]=useReducer(historyReducer,{past:[],present:initial.document,future:[],group:null,revision:0} as History);
 const current=useRef(history.present);current.current=history.present;
 const [editing,setEditing]=useState(false),[panelOpen,setPanelOpen]=useState(true);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [tab,setTab]=useState<'product'|'collection'>('product');
 const [storageError,setStorageError]=useState(initial.error),[imageError,setImageError]=useState(false);
 const [busy,setBusy]=useState(false),[uploading,setUploading]=useState<string|null>(null);
 const [assetVersion,setAssetVersion]=useState(0);
 const assets=useRef(new Map<string,string>()),epoch=useRef(0);
 const doc=history.present;
 useEffect(()=>{if(!history.revision)return;try{localStorage.setItem(EDITOR_KEY,JSON.stringify(doc));setStorageError(false);}catch{setStorageError(true);}},[doc,history.revision]);
 useEffect(()=>()=>{epoch.current++;assets.current.forEach(url=>URL.revokeObjectURL(url));assets.current.clear();},[]);
 const imageKeys=JSON.stringify([...new Set(doc.products.map(p=>p.image).filter(s=>s.startsWith('upload:')))]);
 useEffect(()=>{
  let cancelled=false;
  for(const key of JSON.parse(imageKeys) as string[]){if(assets.current.has(key))continue;
   getImage(key).then(blob=>{if(cancelled)return;if(!blob){setImageError(true);return;}if(!assets.current.has(key))assets.current.set(key,URL.createObjectURL(blob));setAssetVersion(v=>v+1);}).catch(()=>{if(!cancelled)setImageError(true);});
  }
  return ()=>{cancelled=true;};
 },[imageKeys]);
 const commit=useCallback((next:DemoDocument,group?:string)=>dispatch({type:'commit',document:next,group}),[]);
 const endGroup=useCallback(()=>dispatch({type:'end'}),[]);
 const undo=useCallback(()=>dispatch({type:'undo'}),[]),redo=useCallback(()=>dispatch({type:'redo'}),[]);
 useEffect(()=>{
  if(!editing)return;
  const onKey=(event:KeyboardEvent)=>{
   const target=event.target as HTMLElement;
   if(busy||uploading||event.altKey||!(event.ctrlKey||event.metaKey)||target.closest('input,textarea,select,[contenteditable=true],dialog'))return;
   if(event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}
   else if(event.key.toLowerCase()==='y'){event.preventDefault();redo();}
  };
  window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
 },[editing,busy,uploading,undo,redo]);
 useEffect(()=>{if(selectedId&&!doc.products.some(p=>p.id===selectedId&&!p.deleted))setSelectedId(null);},[doc.products,selectedId]);
 function select(id:string){setSelectedId(id);setTab('product');setPanelOpen(true);endGroup();}
 function update(id:string,patch:Partial<EditableProduct>,group?:string){commit(patchProduct(current.current,id,patch),group);}
 function add(){if(current.current.products.length>=MAX_PRODUCTS)return;const p=createProduct();commit({...current.current,products:[...current.current.products,p]});select(p.id);}
 function move(id:string,direction:-1|1){commit(moveProduct(current.current,id,direction));}
 async function upload(id:string,file:File){
  const generation=epoch.current;setUploading(id);
  try{
   const blob=await prepareImage(file);if(generation!==epoch.current)return;
   const key='upload:'+crypto.randomUUID();await storeImage(key,blob);
   if(generation!==epoch.current||!current.current.products.some(p=>p.id===id&&!p.deleted))return;
   assets.current.set(key,URL.createObjectURL(blob));setAssetVersion(v=>v+1);update(id,{image:key});setImageError(false);
  }catch(error){throw error instanceof ImageFailure?error:new ImageFailure('imageStore');}
  finally{setUploading(null);}
 }
 async function reset(){
  setBusy(true);epoch.current++;
  let failed=false;try{if(window.indexedDB)await clearImages();}catch{failed=true;}
  dispatch({type:'reset'});setSelectedId(null);setImageError(failed);
  assets.current.forEach(url=>URL.revokeObjectURL(url));assets.current.clear();setAssetVersion(v=>v+1);setBusy(false);
 }
 function resolveImage(p:Product){return publicAsset(p.image.startsWith('upload:')?(assets.current.get(p.image)??products.find(original=>original.id===p.id)?.image??'/brand/atelier-logo.png'):p.image);}
 // Asset version ensures a newly loaded blob becomes visible without changing product data.
 void assetVersion;
 const catalog=doc.products.filter(p=>!p.deleted).map(p=>({...withPromotion(p,doc.promotion),image:resolveImage(p)}));
 return {doc,catalog,editing,panelOpen,setPanelOpen,selectedId,select,tab,setTab,storageError,imageError,busy,uploading,update,add,move,upload,reset,resolveImage,commit,endGroup,undo,redo,canUndo:history.past.length>0,canRedo:history.future.length>0,
  start:()=>{setEditing(true);setPanelOpen(true);},exit:()=>{setEditing(false);endGroup();}};
}
export type EditorController=ReturnType<typeof useEditor>;
