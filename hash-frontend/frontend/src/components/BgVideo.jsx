import { useEffect, useState } from "react";

// The background video is decorative and the heaviest asset, so it is attached
// only after the page has loaded, and skipped for data-saver / reduced-motion users.
function BgVideo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saveData = navigator.connection?.saveData;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (saveData || reduce) return;
    const start = () => setEnabled(true);
    if (document.readyState === "complete") {
      const t = setTimeout(start, 300);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return (
    <div className="bg-video-wrap" aria-hidden="true">
      {enabled && (
        <video className="bg-video" autoPlay muted loop playsInline preload="none">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      )}
      <div className="bg-video-scrim" />
    </div>
  );
}

export default BgVideo;
