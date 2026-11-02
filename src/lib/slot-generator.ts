export const SLOT_TIMES = [
  // Morning (9:00 AM - 11:30 AM)
  { hour: 9, minute: 0 },
  { hour: 9, minute: 30 },
  { hour: 10, minute: 0 },
  { hour: 10, minute: 30 },
  { hour: 11, minute: 0 },
  { hour: 11, minute: 30 },
  // Afternoon (2:00 PM - 3:30 PM)
  { hour: 14, minute: 0 },
  { hour: 14, minute: 30 },
  { hour: 15, minute: 0 },
  { hour: 15, minute: 30 },
  // Evening (5:00 PM - 6:30 PM)
  { hour: 17, minute: 0 },
  { hour: 17, minute: 30 },
  { hour: 18, minute: 0 },
  { hour: 18, minute: 30 },
];

export function generateDoctorSlots(doctorId: string, daysAhead: number = 14, fromDate: Date = new Date()) {
  const slots: Array<{
    doctorId: string;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
    isLocked: boolean;
    isEmergencyBlocked: boolean;
  }> = [];

  const now = fromDate;
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    if (targetDate.getDay() === 0) continue; // Skip Sunday

    for (const time of SLOT_TIMES) {
      const startTime = new Date(targetDate);
      startTime.setHours(time.hour, time.minute, 0, 0);

      if (startTime <= now) continue;

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      slots.push({
        doctorId,
        startTime,
        endTime,
        isBooked: false,
        isLocked: false,
        isEmergencyBlocked: false,
      });
    }
  }

  return slots;
}
