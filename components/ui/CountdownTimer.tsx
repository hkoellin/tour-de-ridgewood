"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculate(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

interface CountdownTimerProps {
  targetDate: string; // ISO string
  label?: string;
}

export default function CountdownTimer({
  targetDate,
  label = "Race starts in",
}: CountdownTimerProps) {
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculate(target));
    const id = setInterval(() => setTimeLeft(calculate(target)), 1_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (!mounted) return null; // avoid hydration mismatch

  const isOver =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isOver) {
    return (
      <p className="text-race-yellow font-bold uppercase tracking-widest text-sm">
        Race is underway!
      </p>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="text-center">
      <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">
        {label}
      </p>
      <div className="flex gap-4 justify-center">
        {units.map(({ label: unitLabel, value }) => (
          <div key={unitLabel} className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-race-yellow tabular-nums leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
              {unitLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
