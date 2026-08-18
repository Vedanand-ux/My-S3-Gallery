const BASE = "https://4vakph5q07.execute-api.ap-south-1.amazonaws.com/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

export async function fetchImages() {
  const res = await fetch(`${BASE}/images`);
  const data = await handle(res);
  return data.images;
}

export async function requestUploadUrl(file) {
  const res = await fetch(`${BASE}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  return handle(res);
}

export async function uploadToS3(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.send(file);
  });
}

export async function deleteImage(key) {
  const res = await fetch(`${BASE}/images/${key}`, {
    method: "DELETE",
  });
  return handle(res);
}
