interface WordCounterProps {
  text: string;
  limit: number;
  className?: string;
}

export function WordCounter({ text, limit, className }: WordCounterProps) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const percentage = (wordCount / limit) * 100;
  
  const getColor = () => {
    if (percentage >= 95) return "text-red-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-gray-600";
  };

  const getBgColor = () => {
    if (percentage >= 95) return "bg-red-50 border-red-200";
    if (percentage >= 80) return "bg-yellow-50 border-yellow-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className={`text-sm p-2 rounded border ${getBgColor()} ${className || ''}`}>
      <span className={getColor()}>
        {wordCount}/{limit} words used
      </span>
      {percentage >= 80 && (
        <span className="ml-2 text-xs">
          {percentage >= 95 ? "Limit reached" : "Approaching limit"}
        </span>
      )}
    </div>
  );
}