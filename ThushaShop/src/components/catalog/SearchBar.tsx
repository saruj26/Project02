
// import React from 'react';
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search } from "lucide-react";

// interface SearchBarProps {
//   searchTerm: string;
//   onSearchChange: (value: string) => void;
//   onSearch: (e: React.FormEvent) => void;
// }

// const SearchBar: React.FC<SearchBarProps> = ({
//   searchTerm,
//   onSearchChange,
//   onSearch,
// }) => {
//   return (
//     <form onSubmit={onSearch} className="flex flex-1 gap-2">
//       <div className="relative flex-1">
//         <Input
//           type="search"
//           placeholder="Search eyeglasses, sunglasses, frames..."
//           value={searchTerm}
//           onChange={e => onSearchChange(e.target.value)}
//           className="w-full pr-10"
//         />
//         <Button
//           type="submit"
//           variant="ghost"
//           size="icon"
//           className="absolute right-0 top-0 h-full"
//         >
//           <Search className="h-5 w-5" />
//         </Button>
//       </div>
//       <Button type="submit">Search</Button>
//     </form>
//   );
// };

// export default SearchBar;


import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);

  // Sync local state with parent state
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(e);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
      <div className="relative flex-1">
        <Input
          type="search"
          placeholder="Search eyeglasses, sunglasses, frames..."
          value={inputValue}
          onChange={handleInputChange}
          className="w-full pr-10"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
};

export default SearchBar;