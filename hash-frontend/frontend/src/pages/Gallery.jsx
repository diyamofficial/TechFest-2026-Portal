import { useApi } from "../api";

// Placeholder gallery images — swap in real HASH photos once you have them.
const fallbackPhotos = [
  { src: "/images/event1.jpg", caption: "Opening session" },
  { src: "/images/coding.jpg", caption: "Build Sprint, in progress" },
  { src: "/images/robotics.jpg", caption: "Circuit Arena" },
  { src: "/images/event_audience.jpg", caption: "Talks & workshops" },
];

function Gallery() {
  const photos = useApi("/gallery", fallbackPhotos);
  return (
    <div className="page">
      <h1>Gallery</h1>
      <p className="page-lead">Placeholder shots — swap these for real HASH photos once you have them.</p>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <figure key={index} className="gallery-item">
            <img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" width="600" height="400" />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
