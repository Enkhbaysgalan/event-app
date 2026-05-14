export default function LikeIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 9.66667L12 21L2 9.66667L8 4L12 8.25L16 4L22 9.66667Z"
        fill={filled ? "white" : "none"}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}