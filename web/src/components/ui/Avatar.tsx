import Image from "next/image";

type Props = {
  url: string | null;
  name: string;
  size?: number;
  className?: string;
};

export function Avatar({ url, name, size = 40, className = "" }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (url) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-zinc-800 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={url} alt={name} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-amber-200 select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(size * 0.35, 11) }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
