import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference <= 0) {
        return { expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial call
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20">
        <Clock className="w-4 h-4" />
        <span>Offer Expired</span>
      </div>
    );
  }

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center min-w-[50px] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2">
      <span className="text-xl font-black text-white leading-none">{value.toString().padStart(2, '0')}</span>
      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Days" />}
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default CountdownTimer;
