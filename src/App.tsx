import { publicAsset } from './assets';
import { useEffect, useRef, useState } from 'react';
import { copy, languages, locales, type Locale } from './i18n';
import { readPreferences, savePreferences } from './storage';
import LanguageMenu from './LanguageMenu';
import { readTheme, saveTheme, applyTheme, type Theme } from './theme';
import Storefront, { Icon } from './store/Storefront';
import Settings from './store/Settings';
import { storeCopy } from './store/copy';
import './store/store.css';
import './language-menu.css';
import {useEditor} from './editor/useEditor';
import EditorPanel from './editor/EditorPanel';
import {editorCopy} from './editor/copy';
import Modal from './store/Modal';
import './editor/editor.css';
import Tutorial from './tutorial/Tutorial';
import {useTutorial} from './tutorial/useTutorial';
import {tutorialCopy} from './tutorial/copy';
type Screen = 'intro'|'language'|'welcome'|'ready';
function Arrow() {return <span aria-hidden="true">→</span>;}
function Brand({small=false}:{small?:boolean}) {return <span className={small?'brand small':'brand'}>ATELIER<span className="brand-dot">.</span></span>;}
export default function App(){
  const editor=useEditor();
  const [resetOpen,setResetOpen]=useState(false);
  const [initial] = useState(readPreferences);
  const [locale,setLocale] = useState<Locale>(initial?.locale ?? 'en');
  const [selected,setSelected] = useState<Locale|null>(initial?.locale ?? null);
  const [completed,setCompleted] = useState(initial?.completed ?? false);
  const [screen,setScreen] = useState<Screen>(initial?.completed?'ready':initial?'welcome':'intro');
  const [storageOk,setStorageOk] = useState(true);
  const [languageMenuOpen,setLanguageMenuOpen] = useState(false);
  const [theme,setTheme] = useState(readTheme);
  const [themeStorageOk,setThemeStorageOk] = useState(true);
  const [settingsOpen,setSettingsOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const t = copy[locale];
  const st = storeCopy[locale];
  const et = editorCopy[locale];
  const editing=screen==='ready'&&editor.editing;
  const tutorial=useTutorial(screen==='ready');
  const moonStock=editor.doc.products.find(p=>p.id==='moon')?.stock??1337;
  function exitEditor(){if(tutorial.step)tutorial.close('skipped');editor.exit();requestAnimationFrame(()=>document.getElementById('edit-demo-trigger')?.focus({preventScroll:true}));}
  function startEditing(){editor.start();setLanguageMenuOpen(false);if(tutorial.step){editor.setPanelOpen(false);tutorial.entered();}else requestAnimationFrame(()=>document.getElementById('collection')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));}
  function selectProduct(id:string){editor.select(id);tutorial.selected(id);if(tutorial.step&&id!=='moon')editor.setPanelOpen(false);}
  function tutorialQuantity(value:number){if(tutorial.step==='inventory'&&value===1){editor.endGroup();editor.setPanelOpen(false);tutorial.changed(value);}}
  function finishTutorial(){tutorial.close('completed');document.getElementById('editor-panel-toggle')?.focus({preventScroll:true});}
  useEffect(()=>{if(tutorial.step==='result'&&moonStock!==1){tutorial.setStep('inventory');editor.select('moon');}},[moonStock,tutorial.step]);
  const step = screen==='welcome'?2:screen==='ready'?3:1;
  const stepLabel = (value:number)=>`${value} ${t.stepOf} 3`;
  useEffect(()=>{applyTheme(theme);},[theme]);
  useEffect(()=>{document.documentElement.lang=locale;document.title= 'ATELIER — '+t.title;},[locale,t.title]);
  useEffect(()=>{
    if(screen==='intro') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer=window.setTimeout(()=>setScreen('language'),reduced?150:4300);
      return ()=>window.clearTimeout(timer);
    }
    heading.current?.focus();
  },[screen]);
  function persist(nextLocale:Locale,done:boolean){setStorageOk(savePreferences({locale:nextLocale,completed:done}));}
  function choose(nextLocale:Locale){setSelected(nextLocale);setLocale(nextLocale);}
  function confirmLanguage(){if(!selected)return;persist(selected,completed);setScreen(completed?'ready':'welcome');}
  function enter(){persist(locale,true);setCompleted(true);setScreen('ready');}
  function switchLanguage(nextLocale:Locale){choose(nextLocale);persist(nextLocale,completed);}
  function setAppearance(next:Theme){setTheme(next);setThemeStorageOk(saveTheme(next));}
  function toggleTheme(){setAppearance(theme==='light'?'dark':'light');}
  return <div id="atelier-top" className={'app screen-'+(screen==='ready'?'store':screen)+(editing?' editor-active'+(editor.panelOpen?' panel-expanded':''):'')+(tutorial.step==='result'?' tutorial-stock-change':'')}>
    <a className="skip-content" href={screen==='ready'?'#storefront':'#main-content'}>{{en:'Skip to content',ru:'Перейти к содержимому',nb:'Hopp til innhold'}[locale]}</a>
    <header className="header">
      {screen==='ready'?<a className="brand-home" href="#atelier-top" aria-label="Atelier"><Brand/></a>:<Brand/>}
      {screen==='ready'?<nav className="store-nav" aria-label={st.collection}><a href="#collection">{st.collection}</a><a href="#perspective">{st.story}</a><a href="#showroom">{st.showroom}</a></nav>:<span className="header-note">{t.studio}</span>}
      {screen==='ready'&&!editing&&<button id="edit-demo-trigger" className="edit-trigger" onClick={startEditing}><span aria-hidden="true">✎</span>{et.edit}</button>}
      <div className="header-actions">
        {screen==='ready'&&<button className="theme-button settings-trigger" aria-label={st.settings} title={st.settings} onClick={()=>{if(tutorial.step)tutorial.close('skipped');setLanguageMenuOpen(false);setSettingsOpen(true);}}><Icon name="sliders-horizontal"/></button>}
        <button className="theme-button" aria-label={theme==='light'?t.darkTheme:t.lightTheme} title={theme==='light'?t.darkTheme:t.lightTheme} aria-pressed={theme==='dark'} onClick={toggleTheme}><span className={'theme-icon '+(theme==='light'?'moon':'sun')} aria-hidden="true"/></button>
        {screen==='intro'?<button className="text-button skip" onClick={()=>setScreen('language')}>{t.skip} <Arrow/></button>:
        <LanguageMenu locale={locale} open={languageMenuOpen} onOpenChange={setLanguageMenuOpen} onSelect={switchLanguage}/>}
      </div>
    </header>
    {editing&&<div className="editor-toolbar" role="region" aria-label={et.editor}>
      <button id="editor-panel-toggle" className="editor-button" aria-expanded={editor.panelOpen} aria-controls="editor-panel" onClick={()=>editor.setPanelOpen(!editor.panelOpen)}>{editor.panelOpen?et.collapse:et.show}</button>
      <span className="editor-toolbar-hint">{et.hint}</span>
      <div className="editor-history"><button className="editor-icon-button" onClick={editor.undo} disabled={!editor.canUndo||!!editor.uploading||editor.busy} aria-label={et.undo} title={et.undo+' · Ctrl / ⌘ Z'}>↶</button><button className="editor-icon-button" onClick={editor.redo} disabled={!editor.canRedo||!!editor.uploading||editor.busy} aria-label={et.redo} title={et.redo+' · Ctrl / ⌘ Shift Z'}>↷</button></div>
      <button className="editor-button editor-done" onClick={exitEditor}>{et.exit} ✓</button>
    </div>}
    {editing&&<EditorPanel editor={{...editor,select:selectProduct}} locale={locale} onStockChange={tutorialQuantity} onReset={()=>{if(tutorial.step)tutorial.close('skipped');setResetOpen(true);}}/>}
    {screen==='intro' ? <main id="main-content" tabIndex={-1} className="intro" aria-label="ATELIER & CRONA">
      <div className="intro-atelier"><div className="logo-frame"><img src={publicAsset('/brand/atelier-logo.png')} alt="ATELIER" fetchPriority="high"/></div></div>
      <span className="ampersand" aria-hidden="true">&amp;</span>
      <div className="intro-crona"><img src={publicAsset('/brand/crona.png')} alt="Crona Development"/><span>CRONA</span><small>DEVELOPMENT</small></div>
      <div className="intro-caption"><span>{t.theme}</span><span className="progress-track"><span/></span></div>
    </main> : screen==='language' ? <main id="main-content" tabIndex={-1} className="language-layout page-enter">
      <section className="editorial">
        <p className="eyebrow"><span className="tiny-line"/>{t.eyebrow}</p>
        <h1 ref={heading} tabIndex={-1}>{t.title}<br/><em>{t.italic}</em></h1>
        <p className="lead">{t.description}</p>
        <div className="artwork" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="art-a">A</span><span className="art-caption">ATELIER / CRONA</span><span className="art-index">1 — ∞</span></div>
      </section>
      <section className="language-panel" aria-labelledby="language-heading">
        <div className="section-index"><span>{stepLabel(1)}</span><span>{t.chapter}</span></div>
        <h2 id="language-heading">{t.choose}</h2><p className="muted">{t.languageHelp}</p>
        <fieldset className="language-options"><legend className="sr-only">{t.select}</legend>
          {locales.map((item,index)=><label key={item} className={'language-option '+(selected===item?'is-selected':'')}>
            <input type="radio" name="language" value={item} checked={selected===item} onChange={()=>choose(item)}/>
            <span className="option-number">{index+1}</span><span className="option-copy"><span className="language-name" lang={item}>{languages[item].native}</span><span className="language-detail" lang={item}>{languages[item].detail}</span></span><span className="radio-mark" aria-hidden="true"/>
          </label>)}
        </fieldset>
        <button className="primary" disabled={!selected} onClick={confirmLanguage}>{t.continue}<Arrow/></button>
        <p className="panel-caption"><span aria-hidden="true">↳</span> {t.theme}</p>
      </section>
    </main> : screen==='welcome' ? <main id="main-content" tabIndex={-1} className="welcome-layout page-enter">
      <aside className="welcome-art" aria-hidden="true"><div className="welcome-art-content"><span className="eyebrow">ATELIER & CRONA</span><span className="sculpture">A<span>∞</span></span><span className="art-bottom">FORM. FUNCTION. POSSIBILITY.</span></div></aside>
      <section className="welcome-content">
        <div className="section-index"><span>{stepLabel(2)}</span><span>{t.noticeLabel}</span></div>
        <h1 ref={heading} tabIndex={-1}>{t.welcome}<br/><em>{t.welcomeItalic}</em></h1>
        <p className="welcome-intro">{t.welcomeIntro}</p><p className="body-copy">{t.welcomeBody}</p>
        <ul className="feature-list">{t.features.map((feature,index)=><li key={feature}><span>{index+1}</span>{feature}</li>)}</ul>
        <div className="local-note"><span className="notice-exclamation" aria-hidden="true">!</span><p>{t.local}</p></div>
        <p className="fineprint">{t.disclaimer}</p><p className="phase-note">{t.phase}</p>
        <div className="welcome-actions"><button className="text-button" onClick={()=>setScreen('language')}>← {t.back}</button><button className="primary" onClick={enter}>{t.enter}<Arrow/></button></div>
      </section>
    </main> : <Storefront locale={locale} catalog={editor.catalog} layout={editor.doc.layout} selectedId={editor.selectedId} onSelect={editing?selectProduct:undefined}/>}
    {tutorial.storageError&&<p className="storage-warning" role="status">{tutorialCopy[locale].storage}</p>}
    {tutorial.step&&screen==='ready'&&<Tutorial step={tutorial.step} locale={locale} quantity={moonStock} onSkip={()=>tutorial.close('skipped')} onFinish={finishTutorial} onSetOne={()=>{editor.update('moon',{stock:1});tutorialQuantity(1);}} onRestore={()=>{if(tutorial.step==='inventory')editor.select('moon');if(tutorial.step==='select'||tutorial.step==='result')editor.setPanelOpen(false);}}/>}
    {screen==='ready'&&!editing&&editor.storageError&&<p role="status" className="storage-warning">{et.storage}</p>}
    {screen==='ready'&&!editing&&editor.imageError&&<p role="status" className="storage-warning">{et.imageMissing}</p>}
    {!storageOk && <p className="storage-warning" role="status">{t.storage}</p>}
    {!themeStorageOk && <p className="storage-warning" role="status">{t.themeStorage}</p>}
    {screen!=='ready'&&<footer className="footer"><span>{t.footer}</span><span>{stepLabel(step)}</span><span>{t.credit} <span aria-hidden="true">↗</span></span></footer>}
    {settingsOpen&&<Settings locale={locale} theme={theme} onLocale={switchLanguage} onTheme={setAppearance} onClose={()=>setSettingsOpen(false)} onReplay={()=>{editor.exit();setSettingsOpen(false);setScreen('intro');}} onWelcome={()=>{editor.exit();setSettingsOpen(false);setScreen('welcome');}} onTutorial={()=>{editor.exit();editor.select('');setSettingsOpen(false);tutorial.start();}} onReset={()=>{setSettingsOpen(false);setResetOpen(true);}} resetDisabled={!!editor.uploading||editor.busy} storageWarning={!storageOk?t.storage:!themeStorageOk?t.themeStorage:undefined}/>}
    {resetOpen&&<Modal label={et.resetTitle} onClose={()=>{if(!editor.busy)setResetOpen(false);}} className="editor-confirm"><h2>{et.resetTitle}</h2><p>{et.resetBody}</p><div className="editor-row"><button className="editor-button" disabled={editor.busy} autoFocus onClick={()=>setResetOpen(false)}>{et.cancel}</button><button className="editor-button danger" disabled={editor.busy} onClick={()=>{void editor.reset().then(()=>setResetOpen(false));}}>{editor.busy?et.resetting:et.resetConfirm}</button></div></Modal>}
  </div>;
}

