import { publicAsset } from './assets';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { copy, languages, locales, type Locale } from './i18n';

const flags: Record<Locale,string> = {en:'gb',ru:'ru',nb:'no'};
export function LanguageFlag({locale}:{locale:Locale}) {
  return <img className="language-flag" src={publicAsset('/flags/'+flags[locale]+'.svg')} alt="" aria-hidden="true" width="28" height="21"/>;
}
type Props = {locale:Locale;open:boolean;onOpenChange:(open:boolean)=>void;onSelect:(locale:Locale)=>void};
export default function LanguageMenu({locale,open,onOpenChange,onSelect}:Props) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement|null)[]>([]);
  const id = useId();
  useEffect(()=>{
    if(!open)return;
    options.current[locales.indexOf(locale)]?.focus();
    function outside(event:PointerEvent) {
      if(event.target instanceof Node && !root.current?.contains(event.target))onOpenChange(false);
    }
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[open,locale,onOpenChange]);
  function dismiss(){onOpenChange(false);trigger.current?.focus();}
  function select(value:Locale){onSelect(value);dismiss();}
  function navigate(event:KeyboardEvent<HTMLDivElement>){
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();return;}
    if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    event.preventDefault();
    const index=options.current.findIndex(item=>item===document.activeElement);
    const next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowDown'?1:-1)+3)%3;
    options.current[next]?.focus();
  }
  return <div className="language-switcher" ref={root} onBlur={event=>{
    if(!event.currentTarget.contains(event.relatedTarget))onOpenChange(false);
  }}>
    <button className="locale-button" ref={trigger} aria-label={copy[locale].preferences} aria-haspopup="menu"
      aria-expanded={open} aria-controls={id} onClick={()=>onOpenChange(!open)}
      onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();onOpenChange(true);}}}>
      <span className="translation-icon" aria-hidden="true"/><span>{locale.toUpperCase()}</span>
      <svg className="locale-chevron" data-open={open} aria-hidden="true" viewBox="0 0 16 16" width="12" height="12"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
    <div className="locale-popover" data-open={open} inert={!open} aria-hidden={!open}>
      <p className="locale-popover-title">{copy[locale].select}</p>
      <div id={id} role="menu" aria-label={copy[locale].select} onKeyDown={navigate}>
        {locales.map((value,index)=><button key={value} type="button" role="menuitemradio" aria-checked={value===locale}
          className="locale-option" ref={node=>{options.current[index]=node;}} tabIndex={open?0:-1} onClick={()=>select(value)}>
          <LanguageFlag locale={value}/><span lang={value}>{languages[value].native}</span>
          {value===locale && <svg aria-hidden="true" className="locale-check" width="16" height="16" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>)}
      </div>
    </div>
  </div>;
}

