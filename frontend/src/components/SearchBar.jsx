import React from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm cursor-pointer whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
