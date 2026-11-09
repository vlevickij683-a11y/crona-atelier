export default function FavoriteButton({saved,label,onClick,className=''}:{saved:boolean;label:string;onClick:()=>void;className?:string}) {
 return <button type="button" className={'favorite-button '+className} aria-pressed={saved} aria-label={label} title={label} onClick={onClick}>
  <svg viewBox="0 0 24 24" aria-hidden="true" fill={saved?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
   <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
  </svg>
 </button>;
}
