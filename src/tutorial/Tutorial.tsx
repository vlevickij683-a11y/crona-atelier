import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {Locale} from '../i18n';
import type {TutorialStep} from './useTutorial';
import {tutorialCopy} from './copy';
import './tutorial.css';

const selectors:Record<TutorialStep,string>={edit:'#edit-demo-trigger',select:'[data-product-id="moon"] .product-info',inventory:'[data-tutorial="moon-stock"]',result:'[data-product-id="moon"] .stock'};
type Rect={left:number;top:number;width:number;height:number};
type Geometry={target:Rect|null;left:number;top:number;maxHeight:number};
const inset=12,gap=16;
export default function Tutorial({step,locale,quantity,onSkip,onFinish,onSetOne,onRestore}:{step:TutorialStep;locale:Locale;quantity:number;onSkip:()=>void;onFinish:()=>void;onSetOne:()=>void;onRestore:()=>void}){
 const t=tutorialCopy[locale],card=useRef<HTMLDivElement>(null);
 const [geometry,setGeometry]=useState<Geometry>({target:null,left:12,top:12,maxHeight:500});
 const [revision,setRevision]=useState(0);
 const skip=useRef(onSkip);skip.current=onSkip;
 useEffect(()=>{function escape(event:KeyboardEvent){if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();skip.current();}}window.addEventListener('keydown',escape);return ()=>window.removeEventListener('keydown',escape);},[]);
 const index=['edit','select','inventory','result'].indexOf(step)+1;
 useLayoutEffect(()=>{
  const target=document.querySelector<HTMLElement>(selectors[step]);
  let frame=0,settle=0,startFrame=0;
  const viewport=window.visualViewport;
  function measure(){
   const x=viewport?.offsetLeft??0,y=viewport?.offsetTop??0,w=Math.min(viewport?.width??window.innerWidth,document.documentElement.clientWidth||window.innerWidth),h=viewport?.height??window.innerHeight;
   const bounds=target?.getBoundingClientRect();
   const visible=!!target&&!!target.getClientRects().length&&!target.closest('[hidden]');
   const scrollBounds=target?.closest('.editor-panel-scroll')?.getBoundingClientRect();
   let rect:Rect|null=visible&&bounds?{left:Math.max(x,bounds.left-6),top:Math.max(y,bounds.top-6,scrollBounds?.top??0),width:0,height:0}:null;
   if(rect&&bounds){rect.width=Math.max(0,Math.min(x+w,bounds.right+6)-rect.left);rect.height=Math.max(0,Math.min(y+h,bounds.bottom+6,scrollBounds?.bottom??Infinity)-rect.top);if(!rect.width||!rect.height)rect=null;}
   const cw=card.current?.offsetWidth??Math.min(300,w-24),ch=card.current?.offsetHeight??240;
   let left=x+w-cw-inset,top=y+inset,maxHeight=h-2*inset;
   if(rect){
    if(w-(rect.left-x+rect.width)>cw+gap+inset){left=rect.left+rect.width+gap;top=rect.top+(rect.height-ch)/2;}
    else if(rect.left-x>cw+gap+inset){left=rect.left-cw-gap;top=rect.top+(rect.height-ch)/2;}
    else {
     const above=rect.top-y-gap-inset,below=y+h-inset-rect.top-rect.height-gap;
     left=rect.left;
     if(above>=ch||(below<ch&&above>=below)){maxHeight=Math.max(60,above);top=rect.top-Math.min(ch,maxHeight)-gap;}
     else {maxHeight=Math.max(60,below);top=rect.top+rect.height+gap;}
    }
   }
   left=Math.max(x+inset,Math.min(left,x+w-cw-inset));top=Math.max(y+inset,Math.min(top,y+h-Math.min(ch,maxHeight)-inset));
   const next={target:rect,left:Math.round(left),top:Math.round(top),maxHeight};
   setGeometry(prev=>JSON.stringify(prev)===JSON.stringify(next)?prev:next);
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);}
  function resize(){if(target&&!target.closest('[hidden]'))target.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});schedule();}
  startFrame=requestAnimationFrame(()=>{if(target){
   const details=target.closest('details');if(details)details.open=true;
   target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center',inline:'nearest'});
   const focusTarget=step==='select'?target.closest('button'):step==='inventory'?target.querySelector('input'):step==='edit'?target:null;
   if(focusTarget instanceof HTMLElement)focusTarget.focus({preventScroll:true});
   else card.current?.focus({preventScroll:true});
  }measure();});
  measure();settle=window.setTimeout(measure,450);
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
  if(target)observer?.observe(target);if(card.current)observer?.observe(card.current);observer?.observe(document.documentElement);
  window.addEventListener('scroll',schedule,true);window.addEventListener('resize',resize);
  viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);
  return ()=>{cancelAnimationFrame(startFrame);cancelAnimationFrame(frame);clearTimeout(settle);observer?.disconnect();window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',resize);viewport?.removeEventListener('resize',schedule);viewport?.removeEventListener('scroll',schedule);};
 },[step,locale,revision]);
 const titles={edit:t.editTitle,select:t.selectTitle,inventory:t.inventoryTitle,result:t.resultTitle};
 const bodies={edit:t.editBody,select:t.selectBody,inventory:quantity===1?t.alreadyOne:t.inventoryBody,result:t.resultBody};
 return createPortal(<div className={'tutorial-layer tutorial-'+step}>
  {geometry.target&&<div className="tutorial-spotlight" style={geometry.target} aria-hidden="true"/>}
  <div ref={card} className="tutorial-card" role="region" aria-label={t.label} tabIndex={-1} style={{left:geometry.left,top:geometry.top,maxHeight:geometry.maxHeight}}>
   <div className="tutorial-top"><span>ATELIER / {index} {t.of} 4</span><button className="tutorial-skip" onClick={onSkip}>{t.skip} <span aria-hidden="true">×</span></button></div>
   <div key={step} className="tutorial-copy" aria-live="polite" aria-atomic="true"><h2>{titles[step]}</h2><p>{bodies[step]}</p>{step==='result'&&<p className="tutorial-control">{t.control}</p>}</div>
   {step==='inventory'&&<button className="tutorial-action" onClick={onSetOne}>{quantity===1?t.confirmOne:t.setOne}<span aria-hidden="true">→</span></button>}
   {step==='result'&&<button className="tutorial-action" onClick={onFinish}>{t.finish}<span aria-hidden="true">✓</span></button>}
   {!geometry.target&&<button className="tutorial-restore" onClick={()=>{onRestore();setRevision(n=>n+1);}}>{t.restore} ↑</button>}
   <div className="tutorial-progress" aria-hidden="true">{[1,2,3,4].map(n=><span key={n} className={n<=index?'filled':''}/>)}</div>
  </div>
 </div>,document.body);
}
