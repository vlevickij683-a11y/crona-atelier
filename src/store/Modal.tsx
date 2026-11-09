import { useEffect,useRef,type ReactNode } from 'react';
export default function Modal({children,label,onClose,className='',fallbackFocus='.settings-trigger, #editor-panel-toggle'}:{children:ReactNode;label:string;onClose:()=>void;className?:string;fallbackFocus?:string}){
 const ref=useRef<HTMLDialogElement>(null);
 const previous=useRef(document.activeElement as HTMLElement|null);
 const fallback=useRef(fallbackFocus);fallback.current=fallbackFocus;
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const dialog=ref.current!;
  const overflow=document.body.style.overflow;
  dialog.showModal();document.body.style.overflow='hidden';
  return ()=>{dialog.close();document.body.style.overflow=overflow;const target=previous.current?.isConnected&&!previous.current.closest('[hidden]')?previous.current:document.querySelector<HTMLElement>(fallback.current);target?.focus();};
 },[]);
 return <dialog ref={ref} className={'atelier-dialog '+className} aria-label={label}
 onKeyDown={event=>{
  if(event.key!=='Tab')return;
  const items=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length>0&&!el.closest('[hidden],[inert]'));
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first&&last){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last&&first){event.preventDefault();first.focus();}
 }}
 onCancel={event=>{event.preventDefault();close.current();}}
 onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close.current();}}}>
 {children}
 </dialog>;
}

