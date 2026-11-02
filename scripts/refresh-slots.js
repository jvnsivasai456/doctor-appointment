const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SLOT_TIMES = [
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

async function refreshSlots() {
  console.log("Starting slot refresh for all doctors...");
  const now = new Date();

  // 1. Fetch all doctors
  const doctors = await prisma.doctorProfile.findMany({
    select: { id: true, user: { select: { name: true } } },
  });
  console.log(`Found ${doctors.length} doctors.`);

  // 2. Remove unbooked past slots
  const deleted = await prisma.slot.deleteMany({
    where: {
      isBooked: false,
      startTime: { lt: now },
    },
  });
  console.log(`Removed ${deleted.count} expired past slots.`);

  // 3. Generate slots for next 21 days
  const allSlots = [];
  const daysAhead = 21;

  for (const doc of doctors) {
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

        allSlots.push({
          doctorId: doc.id,
          startTime,
          endTime,
          isBooked: false,
          isLocked: false,
          isEmergencyBlocked: false,
        });
      }
    }
  }

  console.log(`Generated ${allSlots.length} new future slots. Inserting in chunks...`);

  // 4. Batch insert in chunks of 1000
  const chunkSize = 1000;
  for (let i = 0; i < allSlots.length; i += chunkSize) {
    const chunk = allSlots.slice(i, i + chunkSize);
    await prisma.slot.createMany({
      data: chunk,
    });
    process.stdout.write(`Inserted ${Math.min(i + chunkSize, allSlots.length)} / ${allSlots.length} slots...\r`);
  }
  console.log("\nSlot insertion complete!");

  // 5. Verification
  const totalSlots = await prisma.slot.count({
    where: { startTime: { gt: now } },
  });
  const firstSlot = await prisma.slot.findFirst({
    where: { startTime: { gt: now } },
    orderBy: { startTime: "asc" },
  });
  const lastSlot = await prisma.slot.findFirst({
    where: { startTime: { gt: now } },
    orderBy: { startTime: "desc" },
  });

  console.log({
    totalActiveSlots: totalSlots,
    firstAvailable: firstSlot?.startTime,
    lastAvailable: lastSlot?.startTime,
  });

  await prisma.$disconnect();
}

refreshSlots().catch((err) => {
  console.error("Error refreshing slots:", err);
  process.exit(1);
});
