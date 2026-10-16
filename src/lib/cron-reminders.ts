import cron from "node-cron";
import { prisma } from "./prisma";

let cronStarted = false;

export function initReminderCron() {
  if (cronStarted) return;
  cronStarted = true;

  console.log("⏰ [ReminderService] Background notification cron initialized.");

  // Check every 1 minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      await processAppointmentReminders();
    } catch (err) {
      console.error("❌ [ReminderService] Cron error:", err);
    }
  });
}

/**
 * Checks for upcoming appointments and triggers notifications:
 * - T-24h window (between 23h and 25h away): Confirm/reschedule prompt
 * - T-2h window (between 1.5h and 2.5h away): 2-hour prep reminder
 * - T-15m window (between 10m and 20m away): 15-minute final alert
 */
export async function processAppointmentReminders() {
  const now = new Date();

  // 1. Check T-24h window
  const t24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const t24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const t24hAppointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminder24hSent: false,
      appointmentDate: { gte: t24hStart, lte: t24hEnd },
    },
    include: {
      patient: true,
      doctor: { include: { user: true } },
    },
  });

  for (const appt of t24hAppointments) {
    const timeFormatted = new Date(appt.appointmentDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    await prisma.notification.create({
      data: {
        userId: appt.patientId,
        title: "Upcoming Appointment Tomorrow (T-24h)",
        message: `Reminder: You have an appointment with ${appt.doctor.user.name} tomorrow at ${timeFormatted}. Need to reschedule? You can do so with 1 click in My Appointments.`,
        type: "REMINDER_24H",
      },
    });

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminder24hSent: true },
    });

    console.log(
      `📩 [ReminderService] Sent T-24h notification to ${appt.patient.name} (${appt.patient.email})`
    );
  }

  // 2. Check T-2h window
  const t2hStart = new Date(now.getTime() + 90 * 60 * 1000);
  const t2hEnd = new Date(now.getTime() + 150 * 60 * 1000);

  const t2hAppointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminder2hSent: false,
      appointmentDate: { gte: t2hStart, lte: t2hEnd },
    },
    include: {
      patient: true,
      doctor: { include: { user: true } },
    },
  });

  for (const appt of t2hAppointments) {
    const timeFormatted = new Date(appt.appointmentDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    await prisma.notification.create({
      data: {
        userId: appt.patientId,
        title: "Appointment in 2 Hours (T-2h)",
        message: `Your consultation with ${appt.doctor.user.name} starts in 2 hours at ${timeFormatted}. Please have your medical notes ready.`,
        type: "REMINDER_2H",
      },
    });

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminder2hSent: true },
    });

    console.log(
      `📩 [ReminderService] Sent T-2h notification to ${appt.patient.name} (${appt.patient.email})`
    );
  }

  // 3. Check T-15m window
  const t15mStart = new Date(now.getTime() + 5 * 60 * 1000);
  const t15mEnd = new Date(now.getTime() + 20 * 60 * 1000);

  const t15mAppointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminder15mSent: false,
      appointmentDate: { gte: t15mStart, lte: t15mEnd },
    },
    include: {
      patient: true,
      doctor: { include: { user: true } },
    },
  });

  for (const appt of t15mAppointments) {
    const timeFormatted = new Date(appt.appointmentDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    await prisma.notification.create({
      data: {
        userId: appt.patientId,
        title: "Starting in 15 Minutes (T-15m)",
        message: `Your doctor appointment with ${appt.doctor.user.name} starts in 15 minutes at ${timeFormatted}.`,
        type: "REMINDER_15M",
      },
    });

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminder15mSent: true },
    });

    console.log(
      `📩 [ReminderService] Sent T-15m urgent reminder to ${appt.patient.name} (${appt.patient.email})`
    );
  }
}
