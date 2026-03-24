import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showPresence?: boolean;
}

export function Avatar({ name, src, size = "md", className, showPresence }: AvatarProps) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-2 ring-white",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-steel-100 text-steel-700 font-semibold flex items-center justify-center ring-2 ring-white",
            sizeClasses[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showPresence && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-forge-500 rounded-full border-2 border-white presence-dot" />
      )}
    </div>
  );
}
