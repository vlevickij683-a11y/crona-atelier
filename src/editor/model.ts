import {categories,products,type Product,type Localized} from '../store/catalog';
export const EDITOR_KEY='crona-atelier:editor:v1';
export const MAX_PRODUCTS=40;
export type EditableProduct=Product & {hidden:boolean;deleted:boolean};
export type Layout={columns:number;density:'airy'|'compact';limit:number};
export type Promotion={enabled:boolean;discount:number;name:Localized;scope:'all'|Product['category']};
export type DemoDocument={version:1;products:EditableProduct[];layout:Layout;promotion:Promotion};
export function defaults():DemoDocument{return {version:1,products:products.map(p=>({...p,hidden:false,deleted:false})),layout:{columns:3,density:'airy',limit:0},promotion:{enabled:false,discount:20,name:{en:'Black Friday',ru:'Чёрная пятница',nb:'Black Friday'},scope:'all'}};}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const number=(v:unknown,max:number,integer=false):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max&&(!integer||Number.isInteger(v));
const localized=(v:unknown,max:number):v is Localized=>record(v)&&['en','ru','nb'].every(l=>typeof v[l]==='string'&&(v[l] as string).length<=max);
export function validImage(value:unknown):value is string{return typeof value==='string'&&([...products.map(p=>p.image),'/brand/atelier-logo.png'].includes(value)||/^upload:[a-z0-9-]{1,80}$/i.test(value));}
export function parseDocument(raw:string):DemoDocument{
 const v:unknown=JSON.parse(raw);
 if(!record(v)||v.version!==1||!Array.isArray(v.products)||v.products.length<1||v.products.length>MAX_PRODUCTS)throw Error('document');
 const ids=new Set<string>();
 for(const p of v.products){
  if(!record(p)||typeof p.id!=='string'||!/^[a-z0-9_-]{1,80}$/i.test(p.id)||ids.has(p.id)||!localized(p.name,100)||Object.values(p.name).some(n=>!n.trim())||!localized(p.subtitle,220)||!localized(p.description,2000)||!localized(p.material,300)||!validImage(p.image)||!categories.includes(p.category as Product['category'])||!number(p.price,1e12)||!number(p.stock,1e6,true)||!number(p.discount??0,100)||typeof p.hidden!=='boolean'||typeof p.deleted!=='boolean'||(p.featured!==undefined&&typeof p.featured!=='boolean')||(p.bestseller!==undefined&&typeof p.bestseller!=='boolean')||(p.badge!==undefined&&!localized(p.badge,50)))throw Error('product');
  ids.add(p.id);
 }
 if(!v.products.some(p=>p.id==='moon'&&!p.deleted))throw Error('moon');
 const l=v.layout,pr=v.promotion;
 if(!record(l)||!number(l.columns,4,true)||l.columns<1||!['airy','compact'].includes(l.density as string)||!number(l.limit,MAX_PRODUCTS,true)||!record(pr)||typeof pr.enabled!=='boolean'||!number(pr.discount,100)||!localized(pr.name,50)||(pr.scope!=='all'&&!categories.includes(pr.scope as Product['category'])))throw Error('settings');
 return v as unknown as DemoDocument;
}
export function readDocument():{document:DemoDocument;error:boolean}{try{const raw=localStorage.getItem(EDITOR_KEY);return {document:raw?parseDocument(raw):defaults(),error:false};}catch{return {document:defaults(),error:true};}}
export function createProduct():EditableProduct{return {id:'custom-'+crypto.randomUUID(),name:{en:'New object',ru:'Новый предмет',nb:'Ny gjenstand'},subtitle:{en:'Your idea, in the collection.',ru:'Ваша идея в коллекции.',nb:'Din idé i kolleksjonen.'},description:{en:'A fictional demo object. Make it your own.',ru:'Вымышленный предмет для демо. Настройте его по своему вкусу.',nb:'En fiktiv demogjenstand. Gjør den til din egen.'},material:{en:'',ru:'',nb:''},category:'collectibles',price:1000,stock:3,image:'/brand/atelier-logo.png',hidden:false,deleted:false,discount:0};}
export function withPromotion(p:Product,promotion:Promotion):Product{
 const eligible=promotion.enabled&&(promotion.scope==='all'||promotion.scope===p.category);
 return eligible&&promotion.discount>=(p.discount??0)?{...p,discount:promotion.discount,badge:promotion.name}:p;
}
export function patchProduct(doc:DemoDocument,id:string,patch:Partial<EditableProduct>):DemoDocument{
 return {...doc,products:doc.products.map(p=>p.id===id?{...p,...patch,id:p.id,deleted:p.id==='moon'?false:patch.deleted??p.deleted}:p)};
}
export function moveProduct(doc:DemoDocument,id:string,direction:-1|1):DemoDocument{
 const live=doc.products.filter(p=>!p.deleted),index=live.findIndex(p=>p.id===id),neighbor=live[index+direction];
 if(!neighbor)return doc;
 const a=doc.products.findIndex(p=>p.id===id),b=doc.products.findIndex(p=>p.id===neighbor.id),next=[...doc.products];
 [next[a],next[b]]=[next[b],next[a]];return {...doc,products:next};
}
export type History={past:DemoDocument[];present:DemoDocument;future:DemoDocument[];group:string|null;revision:number};
export type HistoryAction={type:'commit';document:DemoDocument;group?:string}|{type:'undo'}|{type:'redo'}|{type:'end'}|{type:'reset'};
export function historyReducer(state:History,action:HistoryAction):History{
 if(action.type==='end')return {...state,group:null};
 if(action.type==='reset')return {past:[],present:defaults(),future:[],group:null,revision:state.revision+1};
 if(action.type==='undo')return state.past.length?{past:state.past.slice(0,-1),present:state.past.at(-1)!,future:[state.present,...state.future],group:null,revision:state.revision+1}:state;
 if(action.type==='redo')return state.future.length?{past:[...state.past,state.present].slice(-60),present:state.future[0],future:state.future.slice(1),group:null,revision:state.revision+1}:state;
 if(JSON.stringify(action.document)===JSON.stringify(state.present))return state;
 return {past:action.group&&action.group===state.group?state.past:[...state.past,state.present].slice(-60),present:action.document,future:[],group:action.group??null,revision:state.revision+1};
}
