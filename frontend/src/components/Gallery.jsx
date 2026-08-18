export default function Gallery({ images, onDelete, loading }) {
  if (loading) {
    return <p className="gallery-status">Developing contact sheet…</p>;
  }

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No frames yet.</p>
        <p className="gallery-empty__sub">Uploaded images will appear here.</p>
      </div>
    );
  }

  return (
    <div className="gallery-grid">
      {images.map((img, i) => (
        <figure className="frame" key={img.key}>
          <span className="frame__number">{String(i + 1).padStart(2, "0")}</span>
          <img src={img.url} alt="" loading="lazy" />
          <button
            className="frame__delete"
            onClick={() => onDelete(img.key)}
            aria-label="Delete image"
            title="Delete"
          >
            ✕
          </button>
        </figure>
      ))}
    </div>
  );
}
