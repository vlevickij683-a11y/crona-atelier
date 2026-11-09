import {type ReactNode,type PointerEvent,useRef} from 'react';

// A restrained pointer reflection; no render loop, camera, video or GPU canvas.
export default function ProductFrame({id,children,selected=false,editing=false}:{id:string;children:ReactNode;selected?:boolean;editing?:boolean}) {
 const bounds=useRef<DOMRect|null>(null);
 function reset(event:PointerEvent<HTMLElement>){
  bounds.current=null;
  ['--card-rx','--card-ry','--glare-x','--glare-y'].forEach(key=>event.currentTarget.style.removeProperty(key));
 }
 function move(event:PointerEvent<HTMLElement>){
  if(editing||event.pointerType!=='mouse'||!window.matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)return;
  const r=bounds.current??(bounds.current=event.currentTarget.getBoundingClientRect());
  const x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));
  const y=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));
  event.currentTarget.style.setProperty('--card-rx',`${(0.5-y)*4}deg`);
  event.currentTarget.style.setProperty('--card-ry',`${(x-0.5)*4}deg`);
  event.currentTarget.style.setProperty('--glare-x',`${x*100}%`);
  event.currentTarget.style.setProperty('--glare-y',`${y*100}%`);
 }
 return <article className={'product-card'+(selected?' is-edit-selected':'')+(editing?' is-editable':'')} data-product-id={id} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>{children}</article>;
}
