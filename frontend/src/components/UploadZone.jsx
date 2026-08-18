import { useCallback, useRef, useState } from "react";
import { requestUploadUrl, uploadToS3 } from "../api.js";

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function UploadZone({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]); // { id, name, progress, error }
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
      if (files.length === 0) return;

      for (const file of files) {
        const id = `${file.name}-${Date.now()}`;
        setUploads((prev) => [...prev, { id, name: file.name, progress: 0, error: null }]);

        try {
          const { uploadUrl, key } = await requestUploadUrl(file);
          await uploadToS3(uploadUrl, file, (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, progress } : u))
            );
          });
          setUploads((prev) => prev.filter((u) => u.id !== id));
          onUploaded(key);
        } catch (err) {
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, error: err.message } : u))
          );
        }
      }
    },
    [onUploaded]
  );

  return (
    <div
      className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="drop-zone__label">
        <span className="drop-zone__eyebrow">LOAD FILM</span>
        <span className="drop-zone__title">Drop images or click to select</span>
        <span className="drop-zone__hint">JPG · PNG · GIF · WEBP</span>
      </div>

      {uploads.length > 0 && (
        <ul className="upload-list" onClick={(e) => e.stopPropagation()}>
          {uploads.map((u) => (
            <li key={u.id} className="upload-list__item">
              <span className="upload-list__name">{u.name}</span>
              {u.error ? (
                <span className="upload-list__error">{u.error}</span>
              ) : (
                <div className="upload-list__bar">
                  <div
                    className="upload-list__bar-fill"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
