import { getImageUrl } from "../../utils/imageUrl";

function getInitials(name = "SM") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("") || "SM"
  );
}

export default function PlayerAvatar({ name, photoUrl, size = "md" }) {
  const sizeClasses = {
    lg: "h-36 w-36 text-3xl sm:h-48 sm:w-48 sm:text-5xl md:h-56 md:w-56 md:text-6xl",
    xs: "h-9 w-9 text-xs",
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-base",
  };

  const containerClass = sizeClasses[size] || sizeClasses.md;
  const imageSource = getImageUrl(photoUrl);

  if (imageSource) {
    return (
      <img
        src={imageSource}
        alt={name || "Player"}
        className={`${containerClass} rounded-2xl border-2 border-slate-200 bg-slate-100 object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${containerClass} flex items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 via-lime-500 to-pink-500 font-extrabold text-white shadow-sm ring-1 ring-slate-200`}
    >
      {getInitials(name)}
    </div>
  );
}