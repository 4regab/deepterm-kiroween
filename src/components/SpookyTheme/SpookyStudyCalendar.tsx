"use client";

import { ChevronLeft, ChevronRight, Skull, Calendar } from "lucide-react";
import { useState } from "react";
import { useActivityStore, useThemeStore } from "@/lib/stores";
import { generateMonthGrid, type CalendarDay } from "@/utils/calendar";

// Spooky purple gradient for activity levels
const SPOOKY_LEVEL_COLORS = [
    "bg-[#1a1525]",
    "bg-purple-900/40",
    "bg-purple-700/50",
    "bg-purple-600/60",
    "bg-purple-500/70",
] as const;

// Normal warm colors
const NORMAL_LEVEL_COLORS = [
    "bg-[#f5f5f0]",
    "bg-[#f5e6c8]",
    "bg-[#e8c896]",
    "bg-[#d4a574]",
    "bg-[#c4875a]",
] as const;

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SPOOKY_DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const SPOOKY_MONTH_NAMES = [
    "Frost Moon", "Blood Moon", "Storm Moon", "Seed Moon", "Hare Moon", "Mead Moon",
    "Hay Moon", "Corn Moon", "Harvest Moon", "Hunter's Moon", "Mourning Moon", "Cold Moon"
];

function CalendarSkeleton({ isSpooky }: { isSpooky: boolean }) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                isSpooky ? "border-purple-500" : "border-[#171d2b]"
            }`} />
        </div>
    );
}

interface CalendarDayCellProps {
    day: CalendarDay;
    isSpooky: boolean;
}

function CalendarDayCell({ day, isSpooky }: CalendarDayCellProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const isToday = day.isToday;
    const isCurrentMonth = day.isCurrentMonth;
    const levelColors = isSpooky ? SPOOKY_LEVEL_COLORS : NORMAL_LEVEL_COLORS;
    
    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={`
                    w-full h-14 flex items-center justify-center text-xs font-medium
                    border-b border-r transition-colors cursor-default
                    ${levelColors[day.level]}
                    ${isSpooky 
                        ? `border-purple-500/10 ${isToday ? "ring-2 ring-purple-500 ring-inset" : ""}`
                        : `border-[#171d2b]/10 ${isToday ? "ring-2 ring-[#c4875a] ring-inset" : ""}`
                    }
                    ${isCurrentMonth 
                        ? (isSpooky ? "text-[#e8e4dc]" : "text-[#171d2b]")
                        : (isSpooky ? "text-purple-300/30" : "text-[#171d2b]/30")
                    }
                    ${isSpooky ? "hover:bg-purple-500/10" : "hover:bg-[#171d2b]/5"}
                `}
            >
                {day.dayOfMonth}
                {/* Show skull on high activity days in spooky mode */}
                {isSpooky && day.level >= 4 && isCurrentMonth && (
                    <Skull size={10} className="absolute top-1 right-1 text-purple-400/50" />
                )}
            </div>
            {showTooltip && isCurrentMonth && day.minutesStudied > 0 && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg whitespace-nowrap z-20 shadow-lg ${
                    isSpooky 
                        ? "bg-purple-900 text-purple-100 border border-purple-500/30"
                        : "bg-[#171d2b] text-white"
                }`}>
                    <div className="font-medium">
                        {isSpooky ? `${day.minutesStudied} min of dark study` : `${day.minutesStudied} min studied`}
                    </div>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
                        isSpooky ? "border-t-purple-900" : "border-t-[#171d2b]"
                    }`} />
                </div>
            )}
        </div>
    );
}

export function SpookyStudyCalendar() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const { activity, loading } = useActivityStore();
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    const grid = generateMonthGrid(currentYear, currentMonth, activity);
    const monthNames = isSpooky ? SPOOKY_MONTH_NAMES : MONTH_NAMES;
    const dayHeaders = isSpooky ? SPOOKY_DAY_HEADERS : DAY_HEADERS;
    const levelColors = isSpooky ? SPOOKY_LEVEL_COLORS : NORMAL_LEVEL_COLORS;

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    return (
        <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full ${
            isSpooky 
                ? "bg-[#151821] border-purple-500/20"
                : "bg-white border-[#171d2b]/5"
        }`}>
            {/* Header */}
            <div className={`px-3 py-2 border-b ${
                isSpooky 
                    ? "bg-purple-900/30 border-purple-500/20"
                    : "bg-[#f5e6c8] border-[#171d2b]/5"
            }`}>
                <div className="flex items-center gap-2">
                    {isSpooky ? (
                        <Skull size={16} className="text-purple-400" />
                    ) : (
                        <Calendar size={16} className="text-[#171d2b]/70" />
                    )}
                    <h2 className={`font-serif-4 text-sm ${
                        isSpooky ? "text-purple-200" : "text-[#171d2b]"
                    }`}>
                        {isSpooky ? "Grimoire of Studies" : "Study History"}
                    </h2>
                </div>
            </div>

            {/* Month navigation */}
            <div className={`flex items-center justify-between px-3 py-1.5 border-b ${
                isSpooky 
                    ? "border-purple-500/10 bg-[#151821]"
                    : "border-[#171d2b]/10 bg-white"
            }`}>
                <button
                    onClick={handlePrevMonth}
                    className={`w-7 h-7 flex items-center justify-center border rounded transition-colors ${
                        isSpooky
                            ? "border-purple-500/30 hover:bg-purple-500/10 text-purple-300"
                            : "border-[#171d2b]/20 hover:bg-[#171d2b]/5 text-[#171d2b]"
                    }`}
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className={`font-serif text-sm font-semibold ${
                    isSpooky ? "text-purple-200" : "text-[#171d2b]"
                }`}>
                    {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                    onClick={handleNextMonth}
                    className={`w-7 h-7 flex items-center justify-center border rounded transition-colors ${
                        isSpooky
                            ? "border-purple-500/30 hover:bg-purple-500/10 text-purple-300"
                            : "border-[#171d2b]/20 hover:bg-[#171d2b]/5 text-[#171d2b]"
                    }`}
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {loading ? (
                <CalendarSkeleton isSpooky={isSpooky} />
            ) : (
                <>
                    {/* Day of week headers */}
                    <div className={`grid grid-cols-7 ${
                        isSpooky ? "bg-[#1a1525]" : "bg-[#f5f0e0]"
                    }`}>
                        {dayHeaders.map((day, i) => (
                            <div
                                key={i}
                                className={`py-1.5 text-center text-[10px] font-semibold border-b border-r last:border-r-0 ${
                                    isSpooky
                                        ? "text-purple-300/70 border-purple-500/10"
                                        : "text-[#171d2b]/70 border-[#171d2b]/10"
                                }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 flex-1">
                        {grid.flat().map((day, index) => (
                            <CalendarDayCell key={index} day={day} isSpooky={isSpooky} />
                        ))}
                    </div>

                    {/* Legend */}
                    <div className={`flex justify-center items-center gap-2 py-2 border-t ${
                        isSpooky ? "border-purple-500/10" : "border-[#171d2b]/10"
                    }`}>
                        <span className={`text-[10px] ${
                            isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"
                        }`}>
                            {isSpooky ? "Dormant" : "Less"}
                        </span>
                        <div className="flex gap-1">
                            {levelColors.map((color, i) => (
                                <div key={i} className={`w-3 h-3 rounded-sm ${color} border ${
                                    isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"
                                }`} />
                            ))}
                        </div>
                        <span className={`text-[10px] ${
                            isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"
                        }`}>
                            {isSpooky ? "Possessed" : "More"}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
