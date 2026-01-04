"use client";
import React, { useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import { HexColorPicker } from "react-colorful";

export const ColorPickerInput = wrapFieldsWithMeta(({ input }) => {
  const colorValue = input.value || "#ebebeb";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <input type="text" id={input.name} className="hidden" {...input} />
      <div className="relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
            style={{ backgroundColor: colorValue }}
            aria-label="Выбрать цвет"
          />
          <input
            type="text"
            value={colorValue}
            onChange={(e) => {
              const value = e.target.value;
              if (value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                input.onChange(value);
              } else if (value === "") {
                input.onChange("#ebebeb");
              }
            }}
            placeholder="#ebebeb"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[999]"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-12 left-0 z-[1000] p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
              <HexColorPicker
                color={colorValue}
                onChange={(color) => {
                  input.onChange(color);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
});
