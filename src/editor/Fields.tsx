import {useEffect,useId,useRef,useState} from 'react';
import type {Locale} from '../i18n';
import {editorCopy} from './copy';
export function NumberField({label,value,max,integer=false,onChange,onBlur,onCommit,locale}:{label:string;value:number;max:number;integer?:boolean;onChange:(value:number)=>void;onBlur:()=>void;onCommit?:(value:number)=>void;locale:Locale}){
 const dirty=useRef(false);
 const [draft,setDraft]=useState(String(value));const id=useId(),t=editorCopy[locale];
 useEffect(()=>setDraft(String(value)),[value]);
 const normalized=draft.replace(',','.');const valid=(integer?/^\d+$/:/^\d+(\.\d{0,2})?$/).test(normalized)&&Number(normalized)<=max;
 function commit(){const edited=dirty.current;dirty.current=false;if(!valid)setDraft(String(value));onBlur();if(edited&&valid)onCommit?.(Number(normalized));}
 return <div className="editor-field"><label htmlFor={id}>{label}</label><input id={id} type="text" inputMode={integer?'numeric':'decimal'} value={draft} aria-invalid={!valid} aria-describedby={!valid?id+'-error':undefined} title={`0 – ${max}`} onChange={e=>{dirty.current=true;const next=e.target.value;setDraft(next);const n=next.replace(',','.');if((integer?/^\d+$/:/^\d+(\.\d{0,2})?$/).test(n)&&Number(n)<=max)onChange(Number(n));}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}}}/>{!valid&&<small id={id+'-error'} className="field-error">{t.invalid} 0–{max}</small>}</div>;
}
export function TextField({label,value,max,multiline=false,required=false,onChange,onBlur,locale}:{label:string;value:string;max:number;multiline?:boolean;required?:boolean;onChange:(value:string)=>void;onBlur:()=>void;locale:Locale}){
 const [draft,setDraft]=useState(value),id=useId();useEffect(()=>setDraft(value),[value]);
 const invalid=required&&!draft.trim();
 const props={id,value:draft,maxLength:max,'aria-invalid':invalid,'aria-describedby':invalid?id+'-error':undefined,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{setDraft(e.target.value);if(!required||e.target.value.trim())onChange(e.target.value);},onBlur:()=>{if(invalid)setDraft(value);onBlur();}};
 return <div className="editor-field"><label htmlFor={id}>{label}</label>{multiline?<textarea {...props} rows={4}/>:<input {...props} type="text"/>}{invalid&&<small className="field-error" id={id+'-error'}>{editorCopy[locale].required}</small>}</div>;
}
