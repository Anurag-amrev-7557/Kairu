"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarSelector({
  selectedDate,
  setSelectedDate,
  sessions,
}) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [isYearView, setYearView] = useState(false);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const calendarDays = Array.from(
    { length: firstDayOfMonth },
    () => null,
  ).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const hasSession = (day) => {
    if (!day) return false;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return sessions.some(
      (session) =>
        new Date(session.completedAt).toDateString() === date.toDateString(),
    );
  };

  const renderYearView = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i - 1);

    return (
      <div className="grid grid-cols-4 gap-2">
        {years.map((year) => (
          <button
            type="button"
            key={year}
            onClick={() => {
              setCurrentDate(new Date(year, currentDate.getMonth(), 1));
              setYearView(false);
            }}
            className={`p-2 rounded-lg text-sm ${
              year === currentYear ? "bg-black text-white" : "hover:bg-gray-100"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg w-72 z-100">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            if (isYearView) {
              setCurrentDate(new Date(currentDate.getFullYear() - 10, 0, 1));
            } else {
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1,
                ),
              );
            }
          }}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setYearView(!isYearView)}
          className="font-semibold text-sm"
        >
          {isYearView
            ? `${Math.floor(currentDate.getFullYear() / 10) * 10}s`
            : currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isYearView) {
              setCurrentDate(new Date(currentDate.getFullYear() + 10, 0, 1));
            } else {
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1,
                ),
              );
            }
          }}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {isYearView ? (
        renderYearView()
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
              <div key={`weekday-${index}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isSelected =
                day &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getFullYear() === currentDate.getFullYear();
              return (
                <button
                  type="button"
                  key={index}
                  disabled={!day}
                  onClick={() =>
                    day &&
                    setSelectedDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day,
                      ),
                    )
                  }
                  className={`
                    p-1.5 rounded-full text-sm relative
                    ${!day ? "cursor-default" : ""}
                    ${isSelected ? "bg-black text-white" : "hover:bg-gray-100"}
                  `}
                >
                  {day}
                  {hasSession(day) && (
                    <div
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-black"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
