interface PromptHistoryItem {
  id: string;
  timestamp: number;
  originalPrompt: string;
  optimizedPrompt: string;
  improvement: number;
  contextText?: string;
}

const HISTORY_KEY = 'promptHistory';
const MAX_HISTORY_ITEMS = 5;

export function saveToHistory(
  originalPrompt: string,
  optimizedPrompt: string,
  improvement: number,
  contextText?: string
) {
  const historyItem: PromptHistoryItem = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    originalPrompt,
    optimizedPrompt,
    improvement,
    contextText
  };

  const existingHistory = getHistory();
  const newHistory = [historyItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
}

export function getHistory(): PromptHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing prompt history:', error);
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryItem(id: string) {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}