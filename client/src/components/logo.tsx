import logoPath from "@assets/0f7224c8-cbce-498c-8fdd-f5f5211943ff_1748645493677.png";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoPath} 
        alt="makepromptsbetter.com Logo" 
        className="h-8 w-auto object-contain"
      />
      <span className="text-2xl font-heading text-current">makepromptsbetter</span>
    </div>
  );
}
