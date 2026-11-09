import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within,waitFor} from '@testing-library/react';
import Storefront,{SAVED_KEY} from './Storefront';
import {products} from './catalog';
describe('storefront interactions',()=>{
 it('cycles Tab and Shift+Tab within the product dialog',()=>{
  vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([new DOMRect(0,0,44,44)] as unknown as DOMRectList);
  render(<Storefront locale="en"/>);fireEvent.click(screen.getByRole('button',{name:'Explore object: The Moon'}));
  const dialog=within(screen.getByRole('dialog')),first=dialog.getByRole('button',{name:'Close'}),last=dialog.getByRole('button',{name:'Save object: The Moon'});
  first.focus();fireEvent.keyDown(first,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last,{key:'Tab'});expect(document.activeElement).toBe(first);
 });
 it('returns keyboard focus to the opener when a product dialog closes',()=>{
  render(<Storefront locale="en"/>);const opener=screen.getByRole('button',{name:'Explore object: The Moon'});
  opener.focus();fireEvent.click(opener);fireEvent.click(screen.getByRole('button',{name:'Close'}));
  expect(document.activeElement).toBe(opener);
 });
 it('returns focus to Saved if removing a favorite makes the dialog opener disappear',()=>{
  localStorage.setItem(SAVED_KEY,JSON.stringify(['moon']));render(<Storefront locale="en"/>);
  fireEvent.click(screen.getByRole('button',{name:/Saved/}));const opener=screen.getByRole('button',{name:'Explore object: The Moon'});
  opener.focus();fireEvent.click(opener);fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Remove from saved: The Moon'}));
  fireEvent.click(screen.getByRole('button',{name:'Close'}));
  expect(document.activeElement).toBe(screen.getByRole('button',{name:/Saved/}));
 });
 it('keeps keyboard focus when unsaving the last card directly',async()=>{
  localStorage.setItem(SAVED_KEY,JSON.stringify(['moon']));render(<Storefront locale="en"/>);
  fireEvent.click(screen.getByRole('button',{name:/Saved/}));const heart=screen.getByRole('button',{name:'Remove from saved: The Moon'});
  heart.focus();fireEvent.click(heart);
  await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('button',{name:/Saved/})));
 });
 it('uses the edited category in the hero as well as the catalog',()=>{
  render(<Storefront locale="en" catalog={products.map(p=>p.id==='moon'?{...p,category:'technology'}:p)}/>);
  expect(within(screen.getByRole('button',{name:'Discover the Moon'})).getByText('Technology')).toBeTruthy();
 });
 it('toggles the icon-only detail heart, synchronizes the card and survives remount',()=>{
  const app=render(<Storefront locale="ru"/>);
  fireEvent.click(screen.getByRole('button',{name:'Рассмотреть: Карманная вселенная'}));
  const dialog=screen.getByRole('dialog',{name:'Карманная вселенная'});
  const heart=within(dialog).getByRole('button',{name:'В избранное: Карманная вселенная'});
  expect(heart.textContent).toBe('');
  expect(heart.querySelector('svg')?.getAttribute('fill')).toBe('none');
  fireEvent.click(heart);
  expect(heart.getAttribute('aria-pressed')).toBe('true');
  expect(heart.querySelector('svg')?.getAttribute('fill')).toBe('currentColor');
  expect(screen.getAllByRole('button',{name:'Убрать из избранного: Карманная вселенная'})).toHaveLength(2);
  app.unmount();render(<Storefront locale="ru"/>);
  const cardHeart=screen.getByRole('button',{name:'Убрать из избранного: Карманная вселенная'});
  expect(cardHeart.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(cardHeart);
  expect(cardHeart.querySelector('svg')?.getAttribute('fill')).toBe('none');
  expect(JSON.parse(localStorage.getItem(SAVED_KEY)!)).toEqual([]);
 });
 it('filters categories, sorts and opens real product details',()=>{
  render(<Storefront locale="en"/>);
  expect(screen.getAllByRole('article')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button',{name:'Celestial'}));
  expect(screen.getAllByRole('article')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Explore object: The Moon'}));
  const dialog=screen.getByRole('dialog',{name:'The Moon'});
  expect(within(dialog).getByText(/1337/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button',{name:'Close'}));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'All objects'}));
  fireEvent.change(screen.getByLabelText('Sort'),{target:{value:'low'}});
  expect(screen.getAllByRole('article')[0].textContent).toContain('The Lonely Sock');
 });
 it('persists favorites and shows an honest empty state',()=>{
  const app=render(<Storefront locale="ru"/>);
  fireEvent.click(screen.getByRole('button',{name:'В избранное: Луна'}));
  expect(JSON.parse(localStorage.getItem(SAVED_KEY)!)).toEqual(['moon']);
  app.unmount();render(<Storefront locale="ru"/>);
  fireEvent.click(screen.getByRole('button',{name:/Избранное/}));
  expect(screen.getAllByRole('article')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Убрать из избранного: Луна'}));
  expect(screen.getByText('Здесь пока ничего нет.')).toBeTruthy();
 });
 it('derives an open product inventory from updated product data',()=>{
  const app=render(<Storefront locale="en"/>);
  fireEvent.click(screen.getByRole('button',{name:'Discover the Moon'}));
  app.rerender(<Storefront locale="en" catalog={products.map(p=>p.id==='moon'?{...p,stock:1}:p)}/>);
  const dialog=screen.getByRole('dialog',{name:'The Moon'});
  expect(within(dialog).getByText('Last one available')).toBeTruthy();
  expect(within(dialog).getByText(/· 1 unit/)).toBeTruthy();
 });
});
