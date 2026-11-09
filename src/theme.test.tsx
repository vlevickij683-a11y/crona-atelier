import { describe,it,expect,vi } from 'vitest';
import { render,screen,fireEvent } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY,readPreferences } from './storage';
import { THEME_KEY } from './theme';

describe('appearance and numbering',()=>{
 it('changes theme in place, persists across a reload and preserves onboarding',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:false}));
  const app=render(<App/>);
  fireEvent.click(screen.getByRole('button',{name:'Включить тёмную тему'}));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(screen.getByRole('button',{name:'Войти в демо'})).toBeTruthy();
  expect(readPreferences()).toEqual({locale:'ru',completed:false});
  app.unmount();render(<App/>);
  expect(screen.getByRole('button',{name:'Включить светлую тему'}).getAttribute('aria-pressed')).toBe('true');
  expect(document.documentElement.dataset.theme).toBe('dark');
  fireEvent.click(screen.getByRole('button',{name:'Включить светлую тему'}));
  expect(localStorage.getItem(THEME_KEY)).toBe('light');
 });
 it('changes theme even when storage is blocked and reports the limitation',()=>{
  localStorage.setItem(THEME_KEY,'invalid');
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
  render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Switch to dark theme'}));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(screen.getByRole('status').textContent).toContain('theme could not be saved');
 });
 it('uses localized unpadded stage numbers and keeps them in sync with the screen',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify({locale:'ru',completed:false}));
  render(<App/>);
  expect(screen.getByRole('contentinfo').textContent).toContain('2 из 3');
  expect(document.body.textContent).not.toMatch(/\b0[123]\b/);
  fireEvent.click(screen.getByRole('button',{name:'Сменить язык'}));
  fireEvent.click(screen.getByRole('menuitemradio',{name:'English'}));
  expect(screen.getByRole('contentinfo').textContent).toContain('2 of 3');
  fireEvent.click(screen.getByRole('button',{name:'Change language'}));
  fireEvent.click(screen.getByRole('menuitemradio',{name:'Norsk'}));
  expect(screen.getByRole('contentinfo').textContent).toContain('2 av 3');
  fireEvent.click(screen.getByRole('button',{name:'Åpne demoen'}));
  expect(screen.getByRole('contentinfo').textContent).toContain('Alle gjenstander, priser og lagerantall er fiktive.');
 });
});
