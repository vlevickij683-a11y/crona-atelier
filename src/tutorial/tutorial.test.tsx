import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within,waitFor} from '@testing-library/react';
import App from '../App';
import {STORAGE_KEY} from '../storage';
import {defaults,EDITOR_KEY} from '../editor/model';
import {hasSeenTutorial,TUTORIAL_KEY} from './useTutorial';
const boot=(locale='ru')=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({locale,completed:true}));return render(<App/>);};
const tour=()=>screen.queryByRole('region',{name:'Небольшая лунная поправка'});
const moon=()=>document.querySelector<HTMLElement>('[data-product-id="moon"]')!;
function selectMoon(){fireEvent.click(screen.getByRole('button',{name:'Редактировать демо'}));fireEvent.click(within(moon()).getByRole('button'));}
const stock=()=>screen.getByLabelText<HTMLInputElement>('Количество');
describe('real editor tutorial',()=>{
 it('guides real clicks, changes 1337 to 1, preserves undo and remembers completion',()=>{
  const app=boot();expect(tour()?.textContent).toContain('1 из 4');
  selectMoon();expect(stock().value).toBe('1337');expect(tour()?.textContent).toContain('3 из 4');
  fireEvent.click(screen.getByRole('button',{name:'Установить количество 1'}));
  expect(within(moon()).getByText('Остался последний')).toBeTruthy();expect(tour()?.textContent).toContain('4 из 4');
  fireEvent.click(screen.getByRole('button',{name:'Продолжить в редакторе'}));expect(tour()).toBeNull();expect(hasSeenTutorial()).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Отменить'}));expect(moon().textContent).toContain('1337');
  app.unmount();boot();expect(tour()).toBeNull();
 });
 it('waits for valid committed manual input, including typing numbers starting with 1',()=>{
  boot();selectMoon();fireEvent.change(stock(),{target:{value:'1'}});expect(tour()?.textContent).toContain('3 из 4');
  fireEvent.change(stock(),{target:{value:'12'}});fireEvent.blur(stock());expect(tour()?.textContent).toContain('3 из 4');
  fireEvent.change(stock(),{target:{value:'-1'}});fireEvent.blur(stock());expect(stock().value).toBe('12');
  fireEvent.change(stock(),{target:{value:'1'}});fireEvent.blur(stock());expect(tour()?.textContent).toContain('4 из 4');
  fireEvent.click(screen.getByRole('button',{name:'Отменить'}));expect(tour()?.textContent).toContain('3 из 4');expect(stock().value).toBe('12');
 });
 it('skips without changing data and replays from settings without resetting customized or hidden products',()=>{
  const doc=defaults();doc.products.find(p=>p.id==='moon')!.stock=1;doc.products.find(p=>p.id==='moon')!.hidden=true;doc.products[0].price=42;doc.layout.limit=1;
  localStorage.setItem(EDITOR_KEY,JSON.stringify(doc));const app=boot();
  fireEvent.click(screen.getByRole('button',{name:/Пропустить обучение/}));expect(hasSeenTutorial()).toBe(true);
  app.unmount();boot();expect(tour()).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Настройки'}));fireEvent.click(screen.getByRole('button',{name:/Повторить обучение редактору/}));
  selectMoon();expect(stock().value).toBe('1');expect(tour()?.textContent).toContain('3 из 4');
  fireEvent.click(screen.getByRole('button',{name:'Оставить 1 и продолжить'}));expect(tour()?.textContent).toContain('4 из 4');
  expect(JSON.parse(localStorage.getItem(EDITOR_KEY)!)).toEqual(doc);
 });
 it('keeps skipping usable when storage rejects writes',()=>{
  boot();vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('blocked');});
  fireEvent.click(screen.getByRole('button',{name:/Пропустить обучение/}));expect(tour()).toBeNull();expect(screen.getByRole('status').textContent).toContain('Не удалось сохранить прохождение');
 });
 it('starts after the welcome screen, restores a collapsed field and supports Escape',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:false}));render(<App/>);expect(tour()).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Войти в демо'}));selectMoon();
  fireEvent.click(within(screen.getByRole('complementary')).getByRole('button',{name:'Свернуть панель'}));
  fireEvent.click(screen.getByRole('button',{name:/Показать текущий шаг/}));expect(screen.getByRole('complementary')).toBeTruthy();
  fireEvent.keyDown(window,{key:'Escape'});expect(tour()).toBeNull();expect(hasSeenTutorial()).toBe(true);
 });
 it('uses instant scrolling when reduced motion is requested',async()=>{
  vi.mocked(window.matchMedia).mockReturnValue({matches:true} as MediaQueryList);boot();
  await waitFor(()=>expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({behavior:'instant',block:'center',inline:'nearest'}));
 });
 it('rejects malformed progress and localizes all steps in English and Norwegian',()=>{
  localStorage.setItem(TUTORIAL_KEY,'not json');expect(hasSeenTutorial()).toBe(false);
  localStorage.setItem(TUTORIAL_KEY,JSON.stringify({version:2,status:'completed'}));expect(hasSeenTutorial()).toBe(false);
  boot('en');expect(screen.getByRole('heading',{name:'Make the storefront yours.'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Change language'}));fireEvent.click(screen.getByRole('menuitemradio',{name:'Norsk'}));
  expect(screen.getByRole('heading',{name:'Gjør butikken til din egen.'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Rediger demo'}));fireEvent.click(within(moon()).getByRole('button'));
  fireEvent.click(screen.getByRole('button',{name:'Sett antallet til 1'}));expect(screen.getByRole('heading',{name:'Balansen er gjenopprettet.'})).toBeTruthy();
 });
});
