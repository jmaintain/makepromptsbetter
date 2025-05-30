import logoPath from "@assets/0f7224c8-cbce-498c-8fdd-f5f5211943ff_1748645493677.png";

export function Logo() {
  return (
    <img 
      src={logoPath} 
      alt="Prompt Optimizer Logo" 
      className="w-full h-full object-contain"
    />
  );
}
