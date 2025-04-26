export type Alarm = {
  id: string;
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
  days: boolean[]; // [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
  audioPath: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
};