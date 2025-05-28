export function Logo() {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="w-8 h-2 bg-brand-accent rounded-full transform rotate-12"></div>
      <div className="w-8 h-2 bg-brand-primary rounded-full"></div>
      <div className="w-8 h-2 bg-brand-secondary rounded-full transform -rotate-12"></div>
    </div>
  );
}
