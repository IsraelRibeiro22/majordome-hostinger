import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

const AutocompleteInput = ({ value, onChange, onSuggestionSelect, type, placeholder, allData, onUpdateData }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = () => {
      if (value.length < 2 || !allData || !Array.isArray(allData.descriptionMemory)) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filteredSuggestions = allData.descriptionMemory
        .filter(item => item.type === type && item.description.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);

      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [value, type, allData]);
  
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion.description);
    } else if (onChange) {
      // Fallback for components that only provide onChange
      const syntheticEvent = { target: { value: suggestion.description } };
      onChange(syntheticEvent);
    }
    setShowSuggestions(false);
  };
  
  const handleDeleteSuggestion = (suggestionId, e) => {
    e.stopPropagation();
    if (!allData || !Array.isArray(allData.descriptionMemory)) return;
    const updatedMemory = allData.descriptionMemory.filter(s => s.id !== suggestionId);
    onUpdateData({ descriptionMemory: updatedMemory });
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };


  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        className="w-full"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span>{suggestion.description}</span>
              <button onClick={(e) => handleDeleteSuggestion(suggestion.id, e)} className="p-1 text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;