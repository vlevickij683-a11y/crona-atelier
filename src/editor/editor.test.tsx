import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within,waitFor} from '@testing-library/react';
import App from '../App';
import {STORAGE_KEY} from '../storage';
import {EDITOR_KEY} from './model';
import {TUTORIAL_KEY} from '../tutorial/useTutorial';
const boot=()=>{localStorage.setItem(TUTORIAL_KEY,JSON.stringify({version:1,status:'completed'}));localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:true}));const app=render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Редактировать демо'}));return app;};
const panel=()=>screen.getByRole('complementary',{name:'Визуальный редактор'});
function pick(name:string){const card=screen.getAllByRole('article').find(el=>within(el).queryByRole('heading',{name}));fireEvent.click(within(card!).getByRole('button',{name:'Редактировать товар: '+name}));}
describe('integrated editor',()=>{
 it('changes real inventory, undoes/redoes, and preserves it after reopening in browse mode',()=>{
  const app=boot();pick('Луна');
  const stock=within(panel()).getByLabelText('Количество');
  fireEvent.change(stock,{target:{value:'1'}});fireEvent.blur(stock);
  expect(screen.getAllByText('Остался последний').length).toBeGreaterThan(1);
  fireEvent.click(screen.getByRole('button',{name:'Отменить'}));expect((stock as HTMLInputElement).value).toBe('1337');
  fireEvent.click(screen.getByRole('button',{name:'Повторить'}));expect((stock as HTMLInputElement).value).toBe('1');
  expect(JSON.parse(localStorage.getItem(EDITOR_KEY)!).products.find((p:{id:string})=>p.id==='moon').stock).toBe(1);
  app.unmount();render(<App/>);expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Рассмотреть: Луна'}));expect(within(screen.getByRole('dialog')).getByText('Остался последний')).toBeTruthy();
 });
 it('validates numeric input and edits only the selected text locale',()=>{
  boot();pick('Луна');const p=within(panel()),stock=p.getByLabelText('Количество');
  fireEvent.change(stock,{target:{value:'-2'}});expect(stock.getAttribute('aria-invalid')).toBe('true');
  fireEvent.blur(stock);expect((stock as HTMLInputElement).value).toBe('1337');
  fireEvent.change(p.getByLabelText('Название товара'),{target:{value:'Моя Луна'}});
  fireEvent.change(p.getByLabelText('Язык текста'),{target:{value:'en'}});
  expect((p.getByLabelText('Название товара') as HTMLInputElement).value).toBe('The Moon');
  expect(screen.getAllByRole('heading',{name:'Моя Луна',level:3})).toHaveLength(2);
 });
 it('adds, removes and restores a product while hidden products disappear only from browse mode',()=>{
  boot();fireEvent.click(within(panel()).getByRole('button',{name:'Добавить товар'}));
  expect(screen.getAllByRole('article')).toHaveLength(7);
  fireEvent.click(within(panel()).getByText('Порядок в коллекции'));
  fireEvent.click(within(panel()).getByLabelText('Показывать в витрине'));
  expect(screen.getAllByRole('article')).toHaveLength(7);
  fireEvent.click(screen.getByRole('button',{name:/^Завершить/}));expect(screen.getAllByRole('article')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button',{name:'Редактировать демо'}));
  fireEvent.click(within(panel()).getByRole('button',{name:'Удалить товар'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Удалить товар'}));
  expect(screen.getAllByRole('article')).toHaveLength(6);
  fireEvent.click(within(panel()).getByText(/Удалённые товары/));fireEvent.click(within(panel()).getByRole('button',{name:'Восстановить'}));
  expect(screen.getAllByRole('article')).toHaveLength(7);
 });
 it('applies collection discounts, limits browse cards and confirms reset',async()=>{
  boot();fireEvent.click(within(panel()).getByRole('button',{name:'Витрина'}));
  fireEvent.click(within(panel()).getByRole('button',{name:'Чёрная пятница −20%'}));
  const watch=screen.getAllByRole('article')[0];expect(watch.textContent).toContain('10 000');
  fireEvent.change(within(panel()).getByLabelText('Максимум видимых товаров'),{target:{value:'2'}});
  fireEvent.click(screen.getByRole('button',{name:/^Завершить/}));expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:'Настройки'}));fireEvent.click(screen.getByRole('button',{name:'Сбросить демо'}));
  fireEvent.click(screen.getByRole('button',{name:'Отмена'}));expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:'Настройки'}));fireEvent.click(screen.getByRole('button',{name:'Сбросить демо'}));fireEvent.click(screen.getByRole('button',{name:'Восстановить демо'}));
  await waitFor(()=>expect(screen.getAllByRole('article')).toHaveLength(6));
 });
 it('keeps changes usable when localStorage rejects writes',()=>{
  boot();vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota');});pick('Луна');
  fireEvent.change(within(panel()).getByLabelText('Количество'),{target:{value:'2'}});
  expect(within(panel()).getByRole('status').textContent).toContain('Локальное сохранение');
  expect(screen.getAllByText('Почти закончились').length).toBeGreaterThan(1);
 });
});
