
import React from 'react';

interface ColorPaletteProps {
  colors: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {colors.map((color, index) => (
        <div key={index} className="flex flex-col items-center group">
          <div
            className="w-16 h-16 rounded-lg shadow-lg cursor-pointer transition-transform transform group-hover:scale-110"
            style={{ backgroundColor: color }}
            onClick={() => copyToClipboard(color)}
            title="Copy to clipboard"
          />
          <span className="mt-2 text-xs text-gray-400 font-mono tracking-wider">{color}</span>
        </div>
      ))}
    </div>
  );
};

export default ColorPalette;
