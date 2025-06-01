import logoPath from "@assets/Makepromptsbetter-logo-green.png";

export function Logo() {
  return (
    <div className="flex items-center">
      <img 
        src={logoPath} 
        alt="makepromptsbetter.com Logo" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}
