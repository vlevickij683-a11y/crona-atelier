import {useEffect,useRef,useState} from 'react';
export const TUTORIAL_KEY='crona-atelier:tutorial:v1';
export type TutorialStep='edit'|'select'|'inventory'|'result';
export function hasSeenTutorial(){
 try {const saved=JSON.parse(localStorage.getItem(TUTORIAL_KEY)??'null');return saved?.version===1&&(saved.status==='completed'||saved.status==='skipped');}catch{return false;}
}
export function useTutorial(ready:boolean){
 const [step,setStep]=useState<TutorialStep|null>(null),[storageError,setStorageError]=useState(false);
 const attempted=useRef(hasSeenTutorial());
 useEffect(()=>{if(ready&&!attempted.current){attempted.current=true;setStep('edit');}if(!ready)setStep(null);},[ready]);
 function close(status:'completed'|'skipped'){
  setStep(null);attempted.current=true;
  try{localStorage.setItem(TUTORIAL_KEY,JSON.stringify({version:1,status}));setStorageError(false);}catch{setStorageError(true);}
 }
 return {step,storageError,close,start:()=>{attempted.current=true;setStep('edit');},
  entered:()=>{if(step)setStep('select');},selected:(id:string)=>{if(step)setStep(id==='moon'?'inventory':'select');},
  changed:(stock:number)=>{if(step==='inventory'&&stock===1)setStep('result');},setStep};
}
