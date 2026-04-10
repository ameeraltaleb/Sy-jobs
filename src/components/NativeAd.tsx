import { useEffect, useRef } from 'react';

export default function NativeAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we only inject the script once per component instance
    if (adRef.current && adRef.current.children.length === 0) {
      const container = document.createElement('div');
      container.id = 'container-d4c25f36b6b36f3d9a865338db4909d4';
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl29118903.profitablecpmratenetwork.com/d4c25f36b6b36f3d9a865338db4909d4/invoke.js';
      
      adRef.current.appendChild(container);
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={adRef} 
      className="w-full my-6 flex justify-center items-center overflow-hidden min-h-[50px] bg-transparent rounded-xl"
    />
  );
}
