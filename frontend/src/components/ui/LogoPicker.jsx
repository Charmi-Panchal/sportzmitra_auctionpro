import { useEffect, useRef, useState, useCallback } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { API_ROOT, getImageUrl } from "../../utils/imageUrl";

export default function LogoPicker({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;

      setBusy(true);
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      try {
        const formData = new FormData();
        formData.append("logo", file);
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_ROOT}/api/teams/upload-logo`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onChange(data.logo_url);
        setPreview(data.logo_url);
      } catch (error) {
        console.error("Logo upload error:", error);
        alert("Logo upload failed. Please check backend and try again.");
        setPreview(value || "");
      } finally {
        URL.revokeObjectURL(localPreview);
        setBusy(false);
      }
    },
    [onChange, value]
  );

  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          uploadFile(file);
          e.preventDefault();
          return;
        }
      }
    },
    [uploadFile]
  );

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      setPreview("");
      onChange("");
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        onPaste={handlePaste}
        tabIndex={0}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center outline-none transition hover:border-lime-500 hover:bg-lime-50/30 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
      >
        {preview ? (
          <img
            src={getImageUrl(preview)}
            alt="Team logo preview"
            className="h-28 w-28 rounded-2xl bg-white object-contain p-2 shadow-sm ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition group-hover:text-lime-600">
            <ImagePlus size={36} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 group-hover:text-lime-700">
          <Upload size={16} /> Upload Logo
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Click to upload or paste screenshot crop
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFile(e.target.files?.[0])}
        />
      </div>

      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-xs transition hover:bg-red-100"
        >
          <Trash2 size={14} /> Remove logo
        </button>
      )}

      {busy && <p className="text-xs font-semibold text-lime-600">Uploading logo...</p>}
    </div>
  );
}