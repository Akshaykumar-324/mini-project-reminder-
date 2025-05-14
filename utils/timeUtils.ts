
import { Alarm } from '@/types/alarm';

// Returns the next scheduled alarm Date or null if not valid
export function getNextAlarmDate(alarm: Alarm): Date | null {
  // If alarm is inactive or no days selected, skip
  if (!alarm.days || !alarm.days.some(day => day) || !alarm.isActive) {
    return null;
  }

  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const currentDay = utcNow.getDay(); // 0 (Sun) - 6 (Sat)

  // Convert alarm time to 24-hour format
  let hours = alarm.hours;
  if (alarm.period === 'PM' && hours < 12) {
    hours += 12;
  } else if (alarm.period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Create today's alarm time
  const alarmDate = new Date(utcNow);
  alarmDate.setHours(hours, alarm.minutes, 0, 0);

  // If today is selected and time is at least 1 minute in the future, use today
  if (
    alarm.days[currentDay] &&
    alarmDate.getTime() - utcNow.getTime() >= 60000 // at least 1 minute in future
  ) {
    return alarmDate;
  }

  // Otherwise, find the next valid day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (alarm.days[nextDay]) {
      const futureDate = new Date(utcNow);
      futureDate.setDate(utcNow.getDate() + i);
      futureDate.setHours(hours, alarm.minutes, 0, 0);
      return futureDate;
    }
  }

  return null;
}

// Formats time into 12-hour string like "1:10 PM"
export function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${paddedMinutes} ${period}`;
}

// Returns weekday labels like ["Sun", "Mon", ..., "Sat"]
export function getWeekdayLabels(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}