import {useEffect,useRef,useState} from 'react';
import {languages,locales,type Locale} from '../i18n';
import {categories,effectivePrice,formatPrice,type Localized} from '../store/catalog';
import {storeCopy} from '../store/copy';
import {Stock} from '../store/Storefront';
import Modal from '../store/Modal';
import {MAX_PRODUCTS,withPromotion,type EditableProduct} from './model';
import {editorCopy} from './copy';
import type {EditorController} from './useEditor';
import {NumberField,TextField} from './Fields';
import ImageField from './ImageField';

export default function EditorPanel({editor,locale,onReset,onStockChange}:{editor:EditorController;locale:Locale;onReset:()=>void;onStockChange?:(value:number)=>void}){
 const t=editorCopy[locale],st=storeCopy[locale],{doc}=editor;
 const [textLocale,setTextLocale]=useState(locale),[removeId,setRemoveId]=useState<string|null>(null);
 const title=useRef<HTMLHeadingElement>(null),scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>setTextLocale(locale),[locale]);
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=0;},[editor.selectedId,editor.tab]);
 useEffect(()=>{if(editor.selectedId&&editor.panelOpen)title.current?.focus({preventScroll:true});},[editor.selectedId,editor.panelOpen]);
 const p=doc.products.find(p=>p.id===editor.selectedId&&!p.deleted),live=doc.products.filter(p=>!p.deleted),removed=doc.products.filter(p=>p.deleted);
 function text(field:'name'|'subtitle'|'description'|'material'|'badge',value:string){if(p)editor.update(p.id,{[field]:{...(p[field]??{en:'',ru:'',nb:''}),[textLocale]:value}},`${p.id}:${field}:${textLocale}`);}
 function field(field:'name'|'subtitle'|'description'|'material'|'badge',label:string,max:number,multiline=false){return p&&<TextField key={p.id+textLocale+field} label={label} value={p[field]?.[textLocale]??''} max={max} multiline={multiline} required={field==='name'} locale={locale} onChange={value=>text(field,value)} onBlur={editor.endGroup}/>;}
 function check(field:'featured'|'bestseller'|'hidden',label:string,invert=false){return p&&<label className="editor-check"><input type="checkbox" checked={invert?!p[field]:!!p[field]} onChange={e=>editor.update(p.id,{[field]:invert?!e.target.checked:e.target.checked})}/><span>{label}</span></label>;}
 function showProduct(id:string,collapse=true){if(collapse&&window.matchMedia('(max-width: 900px)').matches)editor.setPanelOpen(false);requestAnimationFrame(()=>document.querySelector<HTMLElement>(`[data-product-id="${id}"]`)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));}
 const pending=!!editor.uploading||editor.busy;
 return <>
 <aside className={'editor-panel '+(editor.panelOpen?'is-open':'')} aria-label={t.editor} id="editor-panel" hidden={!editor.panelOpen}>
  <div className="editor-panel-top"><div><span className="eyebrow">ATELIER / STUDIO</span><h2>{t.panel}</h2></div><button className="editor-icon-button" aria-label={t.collapse} onClick={()=>{editor.setPanelOpen(false);document.getElementById('editor-panel-toggle')?.focus({preventScroll:true});}}>←</button></div>
  <p className="editor-local">● {t.local}</p>
  <div className="editor-tabs" role="group" aria-label={t.panel}>{(['product','collection'] as const).map(tab=><button key={tab} aria-pressed={editor.tab===tab} onClick={()=>{editor.setTab(tab);editor.endGroup();}}>{t[tab]}</button>)}</div>
  <div className="editor-panel-scroll" ref={scroll}>
   {editor.storageError&&<p className="editor-warning" role="status">{t.storage}</p>}
   {editor.imageError&&<p className="editor-warning" role="status">{t.imageMissing}</p>}
   {editor.tab==='product'?<>
    {p?<>
     <button className="editor-link" onClick={()=>{editor.select('');}}>{'← '+t.back}</button>
     <div className="selected-product-heading"><img src={editor.resolveImage(p)} alt=""/><div><h3 ref={title} tabIndex={-1}>{p.name[locale]}</h3><button className="editor-link" onClick={()=>showProduct(p.id)}>{t.preview} ↗</button></div></div>
     <label className="editor-field">{t.textLanguage}<select value={textLocale} onChange={e=>{setTextLocale(e.target.value as Locale);editor.endGroup();}}>{locales.map(l=><option key={l} value={l}>{languages[l].native}</option>)}</select></label>
     <p className="editor-help">{t.languageHelp}</p>
     <details className="editor-section" open><summary>{t.content}</summary>
      {field('name',t.name,100)}{field('subtitle',t.subtitle,220)}{field('description',t.description,2000,true)}{field('material',t.material,300)}
      <label className="editor-field">{t.category}<select value={p.category} onChange={e=>editor.update(p.id,{category:e.target.value as EditableProduct['category']})}>{categories.map(c=><option key={c} value={c}>{st.categories[c]}</option>)}</select></label>
      <NumberField key={p.id+'price'} label={t.price} locale={locale} value={p.price} max={1e12} onChange={value=>editor.update(p.id,{price:value},p.id+':price')} onBlur={editor.endGroup}/>
      <div data-tutorial={p.id==='moon'?'moon-stock':undefined}><NumberField key={p.id+'stock'} label={t.stock} locale={locale} value={p.stock} max={1e6} integer onChange={value=>editor.update(p.id,{stock:value},p.id+':stock')} onBlur={editor.endGroup} onCommit={value=>{if(p.id==='moon')onStockChange?.(value);}}/></div>
      <div className="editor-stock-preview"><Stock product={p} locale={locale}/></div>
     </details>
     <details className="editor-section"><summary>{t.image}</summary><ImageField key={p.id} product={p} editor={editor} locale={locale}/></details>
     <details className="editor-section"><summary>{t.presentation}</summary>
      {check('featured',t.featured)}{check('bestseller',t.bestseller)}
      <NumberField label={t.discount} locale={locale} value={p.discount??0} max={100} onChange={value=>editor.update(p.id,{discount:value},p.id+':discount')} onBlur={editor.endGroup}/>
      {field('badge',t.badge,50)}<p className="editor-price">{t.effective}<strong>{formatPrice(effectivePrice(withPromotion(p,doc.promotion)),locale)}</strong></p><p className="editor-help">{t.promotionHelp}</p>
     </details>
     <details className="editor-section"><summary>{t.order}</summary>
      {check('hidden',t.visible,true)}
      <div className="editor-row"><button className="editor-button" onClick={()=>editor.move(p.id,-1)} disabled={live[0]?.id===p.id}>↑ {t.earlier}</button><button className="editor-button" onClick={()=>editor.move(p.id,1)} disabled={live.at(-1)?.id===p.id}>↓ {t.later}</button></div>
     </details>
     {p.id==='moon'?<p className="editor-help moon-protection">{t.moonProtected}</p>:<button className="editor-button danger" disabled={pending} onClick={()=>setRemoveId(p.id)}>{t.remove}</button>}
    </>:<div className="editor-empty"><span aria-hidden="true">↖</span><h3 ref={title} tabIndex={-1}>{t.select}</h3><p>{t.selectHelp}</p><div className="editor-product-list">{live.map(item=><button key={item.id} onClick={()=>{editor.select(item.id);showProduct(item.id,false);}}><img src={editor.resolveImage(item)} alt=""/><span>{item.name[locale]}{item.hidden&&<small>{t.hidden}</small>}</span><span aria-hidden="true">↗</span></button>)}</div></div>}
    <button className="editor-button add-product" disabled={doc.products.length>=MAX_PRODUCTS||pending} onClick={editor.add}><span aria-hidden="true">+ </span>{t.add}</button>
    {doc.products.length>=MAX_PRODUCTS&&<p className="editor-help">{t.limitReached}</p>}
    <details className="editor-section"><summary>{t.removed} · {removed.length}</summary>{removed.length?removed.map(item=><div className="removed-product" key={item.id}><span>{item.name[locale]}</span><button className="editor-link" onClick={()=>{editor.update(item.id,{deleted:false});editor.select(item.id);}}>{t.restore}</button></div>):<p className="editor-help">{t.nothingRemoved}</p>}</details>
   </>:<>
    <section className="editor-section"><h3>{t.layout}</h3>
     <fieldset className="editor-segment"><legend>{t.size}</legend>{([[2,'large'],[3,'standard'],[4,'small']] as const).map(([columns,key])=><button key={key} aria-pressed={doc.layout.columns===columns} onClick={()=>editor.commit({...doc,layout:{...doc.layout,columns}})}>{t[key]}</button>)}</fieldset>
     <label className="editor-field">{t.columns}<select value={doc.layout.columns} onChange={e=>editor.commit({...doc,layout:{...doc.layout,columns:Number(e.target.value)}})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
     <fieldset className="editor-segment"><legend>{t.density}</legend>{(['airy','compact'] as const).map(density=><button key={density} aria-pressed={doc.layout.density===density} onClick={()=>editor.commit({...doc,layout:{...doc.layout,density}})}>{t[density]}</button>)}</fieldset>
     <label className="editor-field">{t.visibleCount}<select value={doc.layout.limit} onChange={e=>editor.commit({...doc,layout:{...doc.layout,limit:Number(e.target.value)}})}><option value={0}>{t.all}</option>{Array.from({length:MAX_PRODUCTS},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label><p className="editor-help">{t.layoutHelp}</p>
    </section>
    <section className="editor-section"><h3>{t.promotions}</h3>
     <label className="editor-check"><input type="checkbox" checked={doc.promotion.enabled} onChange={e=>editor.commit({...doc,promotion:{...doc.promotion,enabled:e.target.checked}})}/>{t.promotionEnabled}</label>
     <TextField key={'promotion'+locale} label={t.promotionName} locale={locale} max={50} value={doc.promotion.name[locale]} onChange={value=>editor.commit({...doc,promotion:{...doc.promotion,name:{...doc.promotion.name,[locale]:value} as Localized}},'promotion-name:'+locale)} onBlur={editor.endGroup}/>
     <NumberField label={t.discount} locale={locale} max={100} value={doc.promotion.discount} onChange={value=>editor.commit({...doc,promotion:{...doc.promotion,discount:value}},'promotion-discount')} onBlur={editor.endGroup}/>
     <label className="editor-field">{t.scope}<select value={doc.promotion.scope} onChange={e=>editor.commit({...doc,promotion:{...doc.promotion,scope:e.target.value as typeof doc.promotion.scope}})}><option value="all">{t.all}</option>{categories.map(c=><option key={c} value={c}>{st.categories[c]}</option>)}</select></label>
     <button className="editor-button" onClick={()=>editor.commit({...doc,promotion:{enabled:true,discount:20,scope:'all',name:{en:'Black Friday',ru:'Чёрная пятница',nb:'Black Friday'}}})}>{t.blackFriday}</button><p className="editor-help">{t.promotionHelp}</p>
    </section>
    <button className="editor-button danger" onClick={onReset} disabled={pending}>{t.reset}</button>
   </>}
  </div>
 </aside>
 {removeId&&<Modal label={t.removeTitle} onClose={()=>setRemoveId(null)} className="editor-confirm"><h2>{t.removeTitle}</h2><p>{t.removeBody}</p><div className="editor-row"><button className="editor-button" autoFocus onClick={()=>setRemoveId(null)}>{t.cancel}</button><button className="editor-button danger" onClick={()=>{editor.update(removeId,{deleted:true});setRemoveId(null);}}>{t.remove}</button></div></Modal>}
 </>;
}
