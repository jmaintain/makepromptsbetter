export function formatTimeUntilReset(resetTime: string): string {
  const now = new Date();
  const reset = new Date(resetTime);
  const diff = reset.getTime() - now.getTime();
  
  if (diff <= 0) {
    return "Credits reset now!";
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}
