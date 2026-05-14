interface LikeIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  filled?: boolean;
}

export default function LikeIcon({ size = 22, strokeWidth = 1.8, className, filled }: LikeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 23 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 9.66667L12 21L2 9.66667L8 4L12 8.25L16 4L22 9.66667Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}