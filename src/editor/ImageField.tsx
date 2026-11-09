import {useEffect,useRef,useState} from 'react';
import type {Locale} from '../i18n';
import {products} from '../store/catalog';
import {editorCopy} from './copy';
import {ImageFailure} from './images';
import type {EditorController} from './useEditor';
import type {EditableProduct} from './model';
export default function ImageField({product,editor,locale}:{product:EditableProduct;editor:EditorController;locale:Locale}){
 const t=editorCopy[locale],input=useRef<HTMLInputElement>(null),alive=useRef(true);
 const [error,setError]=useState<keyof typeof t|null>(null),[dragging,setDragging]=useState(false);
 useEffect(()=>{alive.current=true;return ()=>{alive.current=false;};},[]);
 const busy=!!editor.uploading;
 async function accept(file:File|undefined){if(!file||busy)return;setError(null);try{await editor.upload(product.id,file);}catch(e){if(alive.current)setError(e instanceof ImageFailure?e.code:'imageStore');}}
 const original=products.find(p=>p.id===product.id)?.image??'/brand/atelier-logo.png';
 return <div className="editor-image-field">
  <div className={'image-drop '+(dragging?'is-dragging':'')} onDragOver={e=>{e.preventDefault();if(!busy)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);void accept(e.dataTransfer.files[0]);}}>
   <img src={editor.resolveImage(product)} alt={product.name[locale]}/>
   <span>{editor.uploading===product.id?t.uploading:t.drop}</span>
   <button type="button" className="editor-button" onClick={()=>input.current?.click()} disabled={busy}>{t.upload}</button>
   <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label={t.upload} hidden onChange={e=>{void accept(e.target.files?.[0]);e.target.value='';}}/>
  </div>
  <p className="editor-help">{t.imageHelp}</p>
  {error&&<p role="alert" className="field-error">{t[error]}</p>}
  <button className="editor-link" disabled={busy||product.image===original} onClick={()=>{editor.update(product.id,{image:original});setError(null);}}>{t.restoreImage}</button>
 </div>;
}
