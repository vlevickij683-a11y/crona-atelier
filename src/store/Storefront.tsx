import { publicAsset } from '../assets';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {Locale} from '../i18n';
import {products,categories,effectivePrice,formatPrice,inventoryState,type Product,type Category} from './catalog';
import {storeCopy} from './copy';
import Modal from './Modal';
import FavoriteButton from './FavoriteButton';
import ProductFrame from './ProductFrame';
import {editorCopy} from '../editor/copy';
import type {Layout} from '../editor/model';
export const SAVED_KEY='crona-atelier:saved:v1';
export function readSaved():string[]{
 try {const raw=JSON.parse(localStorage.getItem(SAVED_KEY)??'[]');return Array.isArray(raw)?[...new Set(raw.filter((id):id is string=>typeof id==='string'&&/^[a-z0-9_-]{1,80}$/i.test(id)))].slice(0,100):[];}catch{return [];}
}
export function Icon({name}:{name:string}){return <span className="store-icon" style={{maskImage:'url('+publicAsset('/icons/'+name+'.svg')+')',WebkitMaskImage:'url('+publicAsset('/icons/'+name+'.svg')+')'}} aria-hidden="true"/>;}
export function Stock({product,locale}:{product:Product;locale:Locale}){
 const state=inventoryState(product.stock);const t=storeCopy[locale];
 return <span className={'stock stock-'+state}><span className="stock-dot" aria-hidden="true"/>{t.stock[state]}<span className="stock-count"> · {product.stock} {locale==='en'&&product.stock===1?'unit':t.units}</span></span>;
}
function Price({product,locale}:{product:Product;locale:Locale}){
 const t=storeCopy[locale],value=effectivePrice(product);
 return <span className="product-price">{value<product.price && <del aria-label={t.original}>{formatPrice(product.price,locale)}</del>}<span>{formatPrice(value,locale)}</span></span>;
}
export default function Storefront({locale,catalog=products,layout,selectedId,onSelect}:{locale:Locale;catalog?:(Product&{hidden?:boolean})[];layout?:Layout;selectedId?:string|null;onSelect?:(id:string)=>void}){
 const t=storeCopy[locale];const heading=useRef<HTMLHeadingElement>(null);
 const et=editorCopy[locale],editing=!!onSelect;
 const [filter,setFilter]=useState<Category|'all'|'saved'>('all');
 const [sort,setSort]=useState('curated');const [saved,setSaved]=useState(readSaved);
 const [storageOk,setStorageOk]=useState(true);const [activeId,setActiveId]=useState<string|null>(null);
 const active=catalog.find(p=>p.id===activeId);
 const moon=catalog.find(p=>p.id==='moon');
 useEffect(()=>{if(editing){setActiveId(null);setFilter('all');setSort('curated');}},[editing]);
 useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo(0,0);},[]);
 function toggleSaved(id:string){
  const removingFocusedCard=filter==='saved'&&saved.includes(id)&&!activeId&&document.activeElement?.closest('[data-product-id]')?.getAttribute('data-product-id')===id;
  const next=saved.includes(id)?saved.filter(item=>item!==id):[...saved,id];setSaved(next);
  try{localStorage.setItem(SAVED_KEY,JSON.stringify(next));setStorageOk(true);}catch{setStorageOk(false);}
  if(removingFocusedCard)requestAnimationFrame(()=>document.querySelector<HTMLElement>('.saved-filter')?.focus());
 }
 const shown=editing?catalog:catalog.filter(p=>!p.hidden).slice(0,layout?.limit||undefined);
 const visible=shown.filter(p=>editing||filter==='all'||(filter==='saved'?saved.includes(p.id):p.category===filter));
 if(sort!=='curated')visible.sort((a,b)=>(effectivePrice(a)-effectivePrice(b))*(sort==='low'?1:-1));
 return <>
 <main id="storefront" tabIndex={-1} className="storefront page-enter">
  <div className="demo-ribbon"><span className="status-dot" aria-hidden="true"/>{t.demo}</div>
  <section className="store-hero" aria-labelledby="store-title">
   <div className="hero-copy"><p className="eyebrow"><span className="tiny-line"/>{t.edition}</p>
    <h1 id="store-title" ref={heading} tabIndex={-1}>{t.hero}<br/><em>{t.heroItalic}</em></h1>
    <p className="hero-description">{t.heroBody}</p>
    <a className="primary hero-cta" href="#collection">{t.explore}<span aria-hidden="true">↗</span></a>
    <p className="hero-footnote"><span aria-hidden="true">✳</span>{t.heroNote}</p>
   </div>
   {moon&&(!moon.hidden||editing)?<button className="hero-object" onClick={()=>editing?onSelect(moon.id):setActiveId(moon.id)} aria-label={editing?et.editingProduct+': '+moon.name[locale]:t.moonLink}>
    <div className="hero-image"><img src={publicAsset(moon.image)} alt={moon.name[locale]} width="1254" height="1254" fetchPriority="high"/><span className="hero-edition">ATELIER<br/>N° 5</span></div>
    <div className="hero-object-caption"><span><small>{t.categories[moon.category]}</small><strong>{moon.name[locale]}</strong></span><span className="round-arrow" aria-hidden="true">↗</span></div>
   </button>:<div className="hero-brand-art" aria-hidden="true"><span>A</span><small>ATELIER · CRONA</small></div>}
  </section>
  <div className="collection-divider"><span>ATELIER</span><span>{t.selected}</span><span aria-hidden="true">✳</span></div>
  <section id="collection" className="collection-section" aria-labelledby="collection-title">
   <div className="section-heading"><div><p className="eyebrow">{t.collection}</p><h2 id="collection-title">{t.collectionTitle}</h2></div><p>{t.collectionBody}</p></div>
   {editing?<p className="editing-collection-note">{et.editHint}</p>:<div className="catalog-toolbar">
    <div className="category-filters" role="group" aria-label={t.category}>
     <button className={filter==='all'?'active':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{t.all}</button>
     {categories.map(category=><button key={category} className={filter===category?'active':''} aria-pressed={filter===category} onClick={()=>setFilter(category)}>{t.categories[category]}</button>)}
     <button className={'saved-filter '+(filter==='saved'?'active':'')} aria-pressed={filter==='saved'} onClick={()=>setFilter('saved')}><Icon name="heart"/>{t.saved}<span>{shown.filter(p=>saved.includes(p.id)).length}</span></button>
    </div>
    <div className="catalog-tools"><span aria-live="polite">{visible.length} / {catalog.length} · {t.items}</span><label>{t.sort}<select value={sort} onChange={e=>setSort(e.target.value)}><option value="curated">{t.curated}</option><option value="low">{t.lowPrice}</option><option value="high">{t.highPrice}</option></select></label></div>
   </div>}
   {filter==='saved' && <p className="saved-explanation">{t.savedNote}</p>}
   {!storageOk && <p className="storage-warning" role="status">{t.storage}</p>}
   <div className={'product-grid'+(layout?' configured-grid density-'+layout.density:'')} style={layout?{'--grid-columns':layout.columns} as CSSProperties:undefined}>
    {visible.map(product=><ProductFrame key={product.id} id={product.id} editing={editing} selected={editing&&selectedId===product.id}>
     <button className="product-open" onClick={()=>editing?onSelect(product.id):setActiveId(product.id)} aria-pressed={editing?selectedId===product.id:undefined} aria-label={(editing?et.editingProduct:t.details)+': '+product.name[locale]}>
      <div className="product-image"><img src={publicAsset(product.image)} alt={product.name[locale]} width="1254" height="1254" loading="lazy"/>
       <div className="product-badges">{editing&&product.hidden&&<span className="hidden-badge">{et.hidden}</span>}{product.bestseller&&<span>{t.bestseller}</span>}{product.featured&&<span>{t.featured}</span>}{!!product.discount&&<span className="sale-badge">{product.badge?.[locale]||t.offer} −{product.discount}%</span>}</div>
       <span className="product-reveal">{editing?et.editingProduct:t.details}<span aria-hidden="true">↗</span></span>
      </div>
      <div className="product-info"><span className="product-category">{t.categories[product.category]}</span><h3>{product.name[locale]}</h3><p>{product.subtitle[locale]}</p><div className="product-meta"><Price product={product} locale={locale}/><Stock product={product} locale={locale}/></div></div>
     </button>
     {!editing&&<FavoriteButton className="save-object" saved={saved.includes(product.id)} onClick={()=>toggleSaved(product.id)} label={(saved.includes(product.id)?t.unsave:t.save)+': '+product.name[locale]}/>}
    </ProductFrame>)}
   </div>
   {!visible.length && <div className="catalog-empty"><span aria-hidden="true">♡</span><h3>{t.empty}</h3><p>{t.emptyBody}</p><button className="text-button" onClick={()=>setFilter('all')}>{t.showAll} →</button></div>}
  </section>
  <section id="perspective" className="perspective-section" aria-labelledby="perspective-title">
   <div className="perspective-copy"><p className="eyebrow">{t.philosophyLabel}</p><h2 id="perspective-title">{t.philosophy}<br/><em>{t.philosophyItalic}</em></h2><p>{t.philosophyBody}</p></div>
   <div className="principles">{[[t.principle1,t.principle1Body],[t.principle2,t.principle2Body],[t.principle3,t.principle3Body]].map(([title,body],index)=><div key={index}><span>{index+1}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div>
  </section>
  <section id="showroom" className="showroom-section" aria-labelledby="showroom-title">
   <div className="imaginary-map" aria-hidden="true"><div className="map-river"/><div className="map-streets"/><div className="map-pin"><span>A</span><small>ATELIER</small></div><span className="map-label">{t.fictional}</span><span className="map-compass">N ↑</span></div>
   <div className="showroom-copy"><p className="eyebrow">{t.locationLabel}</p><h2 id="showroom-title">{t.locationTitle}</h2><p>{t.locationBody}</p><address><strong>{t.address}</strong><span>{t.hours}</span></address><div className="fictional-contact"><span>{t.contact}</span><span>hello@atelier.example</span><small>{t.contactNote}</small></div></div>
  </section>
 </main>
 <footer className="store-footer"><div className="store-footer-top"><div><span className="brand">ATELIER.</span><p>{t.footerLine}</p></div><a href="#atelier-top" className="text-button">{t.backTop} ↑</a></div><div className="store-footer-bottom"><span>{t.fictionalProducts}</span><span>{t.footerCredit} ↗</span></div></footer>
 {active && !editing && <Modal label={active.name[locale]} onClose={()=>setActiveId(null)} className="product-dialog" fallbackFocus=".saved-filter">
  <button className="dialog-close" onClick={()=>setActiveId(null)} aria-label={t.close} autoFocus><Icon name="x"/></button>
  <div className="detail-grid"><div className="detail-image"><img src={publicAsset(active.image)} alt={active.name[locale]} width="1254" height="1254"/></div>
   <div className="detail-copy"><p className="eyebrow">{t.categories[active.category]} · {t.concept}</p><h2>{active.name[locale]}</h2><p className="detail-subtitle">{active.subtitle[locale]}</p>
    <div className="detail-price"><small>{t.price}</small><Price product={active} locale={locale}/></div>
    <p className="detail-description">{active.description[locale]}</p>
    <dl className="detail-facts"><div><dt>{t.material}</dt><dd>{active.material[locale]}</dd></div><div><dt>{t.quantity}</dt><dd><Stock product={active} locale={locale}/></dd></div></dl>
    <FavoriteButton className="detail-save" saved={saved.includes(active.id)} onClick={()=>toggleSaved(active.id)} label={(saved.includes(active.id)?t.unsave:t.save)+': '+active.name[locale]}/>
    <p className="detail-disclaimer">{t.detailDisclaimer}</p>
    {!storageOk&&<p role="status" className="storage-warning">{t.storage}</p>}
   </div>
  </div>
 </Modal>}
 </>;
}

