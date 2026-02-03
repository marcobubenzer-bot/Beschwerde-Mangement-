import { KeyboardEvent, useState } from 'react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ label, tags, onChange, placeholder }: TagInputProps) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value.trim()) {
      event.preventDefault();
      onChange([...tags, value.trim()]);
      setValue('');
    }
  };

  return (
    <label className="tag-input">
      {label}
      <div className="tag-input-field">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="button ghost"
          onClick={() => {
            if (!value.trim()) return;
            onChange([...tags, value.trim()]);
            setValue('');
          }}
        >
          Hinzufügen
        </button>
      </div>
      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((item) => item !== tag))}>
              ×
            </button>
          </span>
        ))}
      </div>
    </label>
  );
};

export default TagInput;
