
import React, { useState, useEffect } from 'react';

interface TagInputProps {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // When tags are cleared programmatically (e.g., form reset), clear the input field
    if (tags.length === 0) {
      setInputValue('');
    }
  }, [tags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Split by comma and trim whitespace, filter out empty strings
    const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setTags(newTags);
  };
  
  const tagCount = tags.length;
  const tagCountColor = tagCount > 13 ? 'text-red-500' : 'text-gray-500';

  return (
    <div>
      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id="tags"
          name="tags"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          placeholder="e.g. digital art, printable, wall decor"
        />
        <div className={`absolute inset-y-0 right-0 pr-3 flex items-center text-sm ${tagCountColor}`}>
          {tagCount} / 13
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.slice(0, 13).map((tag, index) => (
          <span key={index} className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
        {tags.length > 13 && (
             <span className="inline-block bg-red-200 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
                Too many tags!
            </span>
        )}
      </div>
    </div>
  );
};

export default TagInput;
