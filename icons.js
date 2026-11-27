const paths={
 soundOn:'<path d="m11 5-6 4H2v6h3l6 4z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 soundOff:'<path d="m11 5-6 4H2v6h3l6 4z"/><path d="m16 9 6 6m0-6-6 6"/>',
 expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 collapse:'<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="m8 5 11 7-11 7z"/>',
 exit:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
 tank:'<rect x="3" y="10" width="18" height="10" rx="4"/><path d="M8 10V6h8v4m-4-4V2M7 15h.01M12 15h.01M17 15h.01"/>'
};
export const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.tank}</svg>`;
export function iconButton(element,name,label,pressed){element.innerHTML=icon(name);element.setAttribute('aria-label',label);element.title=label;element.dataset.tooltip=label;if(pressed!==undefined)element.setAttribute('aria-pressed',String(pressed));}
