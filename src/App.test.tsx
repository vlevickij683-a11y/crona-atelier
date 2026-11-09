import { describe,it,expect,vi } from 'vitest';
import { render,screen,fireEvent,act } from '@testing-library/react';
import App from './App';
import { readPreferences, STORAGE_KEY } from './storage';
describe('onboarding',()=>{
 it('switches all three languages in place on the welcome screen and persists the choice',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:false}));render(<App/>);
  fireEvent.click(screen.getByRole('button',{name:'Сменить язык'}));
  expect(screen.getAllByRole('menuitemradio')).toHaveLength(3);
  fireEvent.click(screen.getByRole('menuitemradio',{name:'English'}));
  expect(screen.getByRole('button',{name:'Enter demo'})).toBeTruthy();
  expect(screen.queryByRole('menu')).toBeNull();
  expect(readPreferences()).toEqual({locale:'en',completed:false});
  fireEvent.click(screen.getByRole('button',{name:'Change language'}));
  fireEvent.click(screen.getByRole('menuitemradio',{name:'Norsk'}));
  expect(screen.getByRole('button',{name:'Åpne demoen'})).toBeTruthy();
  expect(readPreferences()).toEqual({locale:'nb',completed:false});
 });
 it('supports keyboard menu navigation, Escape, focus restoration and outside click',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:false}));render(<App/>);
  const trigger=screen.getByRole('button',{name:'Сменить язык'});
  fireEvent.keyDown(trigger,{key:'ArrowDown'});
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio',{name:'Русский'}));
  fireEvent.keyDown(document.activeElement!,{key:'ArrowDown'});
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio',{name:'Norsk'}));
  fireEvent.keyDown(document.activeElement!,{key:'Home'});
  expect(document.activeElement).toBe(screen.getByRole('menuitemradio',{name:'English'}));
  fireEvent.keyDown(document.activeElement!,{key:'Escape'});
  expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(trigger);
  fireEvent.click(trigger);fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('menu')).toBeNull();
 });
 it('requires a language choice and completes Russian onboarding with persisted return state',()=>{
  const app=render(<App/>);
  fireEvent.click(screen.getByRole('button',{name:/Skip introduction/}));
  expect((screen.getByRole('button',{name:'Continue'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('radio',{name:/Русский/}));
  fireEvent.click(screen.getByRole('button',{name:'Продолжить'}));
  expect(screen.getByText(/Это вымышленный магазин/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Войти в демо'}));
  expect(readPreferences()).toEqual({locale:'ru',completed:true});
  app.unmount();render(<App/>);
  expect(screen.getByRole('heading',{name:'Необычные вещи. Прекрасно необязательные.'})).toBeTruthy();
 });
 it('supports Norwegian, changing language after completion, and replay',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'nb',completed:true}));render(<App/>);
  fireEvent.click(screen.getByRole('button',{name:'Bytt språk'}));
  fireEvent.click(screen.getByRole('menuitemradio',{name:'English'}));
  expect(readPreferences()).toEqual({locale:'en',completed:true});
  fireEvent.click(screen.getByRole('button',{name:'Settings'}));
  fireEvent.click(screen.getByRole('button',{name:/Replay introduction/}));
  expect(screen.getByRole('button',{name:/Skip introduction/})).toBeTruthy();
 });
 it('discards malformed stored preferences',()=>{
  localStorage.setItem(STORAGE_KEY,'{"locale":"bad","completed":true}');expect(readPreferences()).toBeNull();
  localStorage.setItem(STORAGE_KEY,'not json');expect(readPreferences()).toBeNull();
 });
 it('remains usable when storage is blocked',()=>{
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
  render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Skip introduction/}));
  fireEvent.click(screen.getByRole('radio',{name:/English/}));
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.click(screen.getByRole('button',{name:'Enter demo'}));
  expect(screen.getByRole('status').textContent).toContain('storage is unavailable');
  expect(screen.getByRole('heading',{name:'Extraordinary things. Beautifully unnecessary.'})).toBeTruthy();
 });
 it('skips animation for reduced motion and clears the intro timer when manually skipped',()=>{
  vi.useFakeTimers();
  try {
   vi.mocked(window.matchMedia).mockReturnValue({matches:true} as MediaQueryList);
   const app=render(<App/>);act(()=>vi.advanceTimersByTime(150));
   expect(screen.getByRole('button',{name:'Continue'})).toBeTruthy();app.unmount();
   vi.mocked(window.matchMedia).mockReturnValue({matches:false} as MediaQueryList);
   render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Skip introduction/}));
   fireEvent.click(screen.getByRole('radio',{name:/English/}));
   fireEvent.click(screen.getByRole('button',{name:'Continue'}));
   act(()=>vi.advanceTimersByTime(5000));
   expect(screen.getByRole('button',{name:'Enter demo'})).toBeTruthy();
  } finally {vi.useRealTimers();}
 });
});
