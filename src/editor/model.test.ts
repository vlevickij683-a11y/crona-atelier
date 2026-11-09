import {describe,it,expect} from 'vitest';
import {defaults,parseDocument,patchProduct,moveProduct,historyReducer,withPromotion,createProduct,type History} from './model';
import {effectivePrice} from '../store/catalog';
describe('editor data and history',()=>{
 it('round-trips edits, rejects damaged documents and protects the Moon',()=>{
  const d=patchProduct(defaults(),'moon',{stock:1,deleted:true});
  expect(parseDocument(JSON.stringify(d)).products.find(p=>p.id==='moon')).toMatchObject({stock:1,deleted:false});
  expect(()=>parseDocument(JSON.stringify({...d,products:d.products.filter(p=>p.id!=='moon')}))).toThrow();
  for(const patch of [{stock:-1},{price:Infinity},{image:'https://untrusted.example/image'},{name:{en:'',ru:'x',nb:'x'}}])expect(()=>parseDocument(JSON.stringify(patchProduct(d,'watch',patch)))).toThrow();
 });
 it('groups a field edit, supports undo/redo and discards the redo branch on a new edit',()=>{
  let h:History={past:[],present:defaults(),future:[],group:null,revision:0};
  h=historyReducer(h,{type:'commit',document:patchProduct(h.present,'moon',{stock:13}),group:'stock'});
  h=historyReducer(h,{type:'commit',document:patchProduct(h.present,'moon',{stock:1}),group:'stock'});
  expect(h.past).toHaveLength(1);
  h=historyReducer(h,{type:'undo'});expect(h.present.products.find(p=>p.id==='moon')!.stock).toBe(1337);
  h=historyReducer(h,{type:'redo'});expect(h.present.products.find(p=>p.id==='moon')!.stock).toBe(1);
  h=historyReducer(h,{type:'undo'});h=historyReducer(h,{type:'commit',document:patchProduct(h.present,'moon',{price:10})});expect(h.future).toHaveLength(0);
  h=historyReducer(h,{type:'reset'});expect(h.present).toEqual(defaults());expect(h.past).toHaveLength(0);
 });
 it('reorders around removed objects and restores them without losing data',()=>{
  const d=patchProduct(defaults(),'sock',{deleted:true,price:123});
  const moved=moveProduct(d,'duck',-1);expect(moved.products.filter(p=>!p.deleted).map(p=>p.id).slice(0,2)).toEqual(['duck','watch']);
  const restored=patchProduct(moved,'sock',{deleted:false});expect(restored.products.find(p=>p.id==='sock')!.price).toBe(123);
  const p=createProduct();expect(parseDocument(JSON.stringify({...restored,products:[...restored.products,p]})).products.at(-1)!.id).toBe(p.id);
 });
 it('applies scoped promotions once, preserving individual discounts and original prices',()=>{
  const d=defaults(),sock=d.products.find(p=>p.id==='sock')!,watch=d.products[0];
  const promo={...d.promotion,enabled:true,discount:10,scope:'fashion' as const};
  expect(effectivePrice(withPromotion(sock,promo))).toBe(399.2);
  expect(effectivePrice(withPromotion(watch,promo))).toBe(12500);
  expect(effectivePrice(withPromotion(sock,{...promo,discount:50}))).toBe(249.5);
  expect(sock.price).toBe(499);
 });
});
