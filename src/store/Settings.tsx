import {locales,languages,type Locale} from '../i18n';
import type {Theme} from '../theme';
import {LanguageFlag} from '../LanguageMenu';
import {storeCopy} from './copy';
import Modal from './Modal';
import {Icon} from './Storefront';
import {editorCopy} from '../editor/copy';
import {tutorialCopy} from '../tutorial/copy';
export default function Settings({locale,theme,onLocale,onTheme,onClose,onReplay,onWelcome,onTutorial,storageWarning,onReset,resetDisabled}:{locale:Locale;theme:Theme;onLocale:(value:Locale)=>void;onTheme:(value:Theme)=>void;onClose:()=>void;onReplay:()=>void;onWelcome:()=>void;onTutorial?:()=>void;storageWarning?:string;onReset?:()=>void;resetDisabled?:boolean}){
 const t=storeCopy[locale];
 return <Modal label={t.settings} onClose={onClose} className="settings-dialog">
  <button className="dialog-close" onClick={onClose} aria-label={t.close} autoFocus><Icon name="x"/></button>
  <p className="eyebrow">ATELIER</p><h2>{t.settings}</h2>
  <fieldset><legend>{t.language}</legend>{locales.map(value=><label className="settings-language" key={value}><input type="radio" name="settings-language" checked={locale===value} onChange={()=>onLocale(value)}/><LanguageFlag locale={value}/><span lang={value}>{languages[value].native}</span></label>)}</fieldset>
  <fieldset><legend>{t.appearance}</legend><div className="theme-options">{(['light','dark'] as const).map(value=><button key={value} className={theme===value?'selected':''} aria-pressed={theme===value} onClick={()=>onTheme(value)}><span className={'theme-icon '+(value==='light'?'sun':'moon')} aria-hidden="true"/>{t[value]}</button>)}</div></fieldset>
  <div className="settings-experience"><h3>{t.experience}</h3><button className="text-button" onClick={onReplay}>{t.replay}<span aria-hidden="true">↗</span></button><button className="text-button" onClick={onWelcome}>{t.welcome}<span aria-hidden="true">↗</span></button></div>
  <p className="settings-note">{t.settingsNote}</p>
  {onTutorial&&<div className="settings-experience"><button className="text-button" onClick={onTutorial} disabled={resetDisabled}>{tutorialCopy[locale].replay}<span aria-hidden="true">↗</span></button><p className="settings-note">{tutorialCopy[locale].replayNote}</p></div>}
  {onReset&&<button className="editor-button danger" onClick={onReset} disabled={resetDisabled}>{editorCopy[locale].reset}</button>}
  {storageWarning&&<p className="storage-warning" role="status">{storageWarning}</p>}
 </Modal>;
}

