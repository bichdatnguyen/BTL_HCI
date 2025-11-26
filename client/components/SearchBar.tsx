import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  placeholder = "Tìm kiếm sách...",
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <div className="w-full mb-10">
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-6 h-6 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-card rounded-3xl pl-16 pr-6 py-4 text-lg font-medium text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
          aria-label="Search books"
        />
      </div>
    </div>
  );
}
