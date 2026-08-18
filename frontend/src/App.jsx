import { useEffect, useState, useCallback } from "react";
import UploadZone from "./components/UploadZone.jsx";
import Gallery from "./components/Gallery.jsx";
import { fetchImages, deleteImage } from "./api.js";

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchImages();
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUploaded = () => {
    // re-list from S3 rather than guessing the new object's shape locally
    load();
  };

  const handleDelete = async (key) => {
    setImages((prev) => prev.filter((img) => img.key !== key));
    try {
      await deleteImage(key);
    } catch (err) {
      setError(err.message);
      load(); // resync if the delete failed server-side
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__eyebrow">S3 · REACT · NODE</span>
        <h1 className="app__title">Contact Sheet</h1>
        <p className="app__subtitle">
          A minimal gallery backed by presigned S3 uploads.
        </p>
      </header>

      <UploadZone onUploaded={handleUploaded} />

      {error && <div className="app__error">{error}</div>}

      <Gallery images={images} onDelete={handleDelete} loading={loading} />
    </div>
  );
}
