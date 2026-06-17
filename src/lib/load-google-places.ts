const BOOTSTRAP_ID = 'google-maps-bootstrap-inline';

function waitForImportLibrary(timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (window.google?.maps?.importLibrary) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error('Google Maps did not become ready in time'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/** Official Google bootstrap + importLibrary (matches Maps docs examples). */
function ensureGoogleMapsLoader(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (window.google?.maps?.importLibrary) return;
  if (document.getElementById(BOOTSTRAP_ID)) return;

  const legacyScript = document.getElementById('google-maps-bootstrap-script');
  legacyScript?.remove();

  const script = document.createElement('script');
  script.id = BOOTSTRAP_ID;
  script.textContent = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})(${JSON.stringify({ key: apiKey, v: 'weekly' })});`;
  document.head.appendChild(script);
}

/** Loads Maps JS and returns the Places library. */
export async function loadGooglePlacesLibrary(
  apiKey: string
): Promise<google.maps.PlacesLibrary> {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps can only load in the browser');
  }

  ensureGoogleMapsLoader(apiKey);

  if (!window.google?.maps?.importLibrary) {
    await waitForImportLibrary(15_000);
  }

  return google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>;
}
