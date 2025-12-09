"use client";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function MatchScore({ score, size = "md" }: MatchScoreProps) {
  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const radius = size === "sm" ? 36 : size === "md" ? 48 : 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    if (score >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className={`${sizeClasses[size]} -rotate-90 transform`}
        viewBox="0 0 120 120"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getStrokeColor(score)} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getColor(score)}`}>
          {Math.round(score)}
        </span>
        <span className="text-xs text-gray-500">Match</span>
      </div>
    </div>
  );
}

