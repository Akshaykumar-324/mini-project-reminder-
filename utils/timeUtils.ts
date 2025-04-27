// import { Alarm } from '@/types/alarm';
// import { format, addDays, setHours, setMinutes, setSeconds, isAfter } from 'date-fns';

// export function formatTimeForDisplay(hours: number, minutes: number, period: 'AM' | 'PM'): string {
//   return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
// }

// export function getWeekdayLabels(days: boolean[]): string {
//   const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const selectedDays = days
//     .map((selected, index) => (selected ? weekdays[index] : null))
//     .filter(Boolean);
  
//   if (selectedDays.length === 0) {
//     return 'One time';
//   }
  
//   if (selectedDays.length === 7) {
//     return 'Every day';
//   }
  
//   if (selectedDays.length === 5 && 
//       days[1] && days[2] && days[3] && days[4] && days[5]) {
//     return 'Weekdays';
//   }
  
//   if (selectedDays.length === 2 && days[0] && days[6]) {
//     return 'Weekends';
//   }
  
//   return selectedDays.join(', ');
// }

// export function getNextAlarmDate(alarm: Alarm): Date | null {
//   const { hours, minutes, period, days } = alarm;
  
//   // Convert 12-hour format to 24-hour format
//   let hour24 = hours;
//   if (period === 'PM' && hours < 12) {
//     hour24 += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hour24 = 0;
//   }
  
//   const now = new Date();
//   const todayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
//   // If no days are selected, return null
//   if (!days.some(day => day)) {
//     return null;
//   }
  
//   // Check if alarm should trigger today
//   const todayAlarm = setHours(
//     setMinutes(
//       setSeconds(now, 0),
//       minutes
//     ),
//     hour24
//   );
  
//   // If alarm is set for today and time hasn't passed yet
//   if (days[todayIndex] && isAfter(todayAlarm, now)) {
//     return todayAlarm;
//   }
  
//   // Find the next day that the alarm should trigger
//   for (let i = 1; i <= 7; i++) {
//     const nextDayIndex = (todayIndex + i) % 7;
//     if (days[nextDayIndex]) {
//       const nextAlarmDate = addDays(
//         setHours(
//           setMinutes(
//             setSeconds(now, 0),
//             minutes
//           ),
//           hour24
//         ),
//         i
//       );
//       return nextAlarmDate;
//     }
//   }
  
//   return null;
// }

// import { Alarm } from '@/types/alarm';

// export function getNextAlarmDate(alarm: Alarm): Date | null {
//   const now = new Date();
//   let hours = alarm.hours;
//   const minutes = alarm.minutes;

//   if (alarm.period === 'PM' && hours < 12) {
//     hours += 12;
//   }
//   if (alarm.period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   const today = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     hours,
//     minutes,
//     0,
//     0
//   );

//   const isTodayAlarmDay = alarm.days[now.getDay()];
//   const isTimeLaterToday = today.getTime() > now.getTime();

//   if (isTodayAlarmDay && isTimeLaterToday) {
//     return today;
//   }

//   // Otherwise, find the next valid day
//   for (let i = 1; i <= 7; i++) {
//     const nextDay = (now.getDay() + i) % 7;
//     if (alarm.days[nextDay]) {
//       const nextDate = new Date(
//         now.getFullYear(),
//         now.getMonth(),
//         now.getDate() + i,
//         hours,
//         minutes,
//         0,
//         0
//       );
//       return nextDate;
//     }
//   }

//   return null; // No valid alarm day selected
// }

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