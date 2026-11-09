import {describe,it,expect} from 'vitest';
import {products,inventoryState,effectivePrice} from './catalog';
describe('catalog rules',()=>{
 it('keeps six distinct products and the tutorial Moon inventory',()=>{
  expect(new Set(products.map(p=>p.id)).size).toBe(6);
  expect(products.find(p=>p.id==='moon')?.stock).toBe(1337);
 });
 it.each([[0,'out'],[1,'last'],[2,'low'],[3,'available'],[1337,'available'],[-1,'out'],[NaN,'out']])('maps stock %s to %s',(stock,state)=>expect(inventoryState(stock as number)).toBe(state));
 it('calculates discounts in cents and bounds invalid percentages',()=>{
  expect(effectivePrice({price:499,discount:20})).toBe(399.2);
  expect(effectivePrice({price:499,discount:-20})).toBe(499);
  expect(effectivePrice({price:499,discount:120})).toBe(0);
 });
});
