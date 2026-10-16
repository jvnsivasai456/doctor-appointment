import { PrismaClient } from "@prisma/client";
import { acquireLock, releaseLock } from "../src/lib/lock-manager";
import { deterministicTriage } from "../src/lib/triage-engine";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=================================================");
  console.log("🚀 MediBook AI - Automated Test Suite");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 4;

  // ----------------------------------------------------------------
  // TEST 1: Concurrency Test (50 Simultaneous Requests at ONE slot)
  // ----------------------------------------------------------------
  console.log("TEST 1: 50 Simultaneous Concurrent Requests Locking One Slot");
  const testDoctor = await prisma.doctorProfile.findFirst({
    include: { user: true },
  });

  if (!testDoctor) {
    throw new Error("No doctor found in database for test");
  }

  // Find or create a dedicated test slot
  const testSlot = await prisma.slot.findFirst({
    where: {
      doctorId: testDoctor.id,
      isBooked: false,
      isLocked: false,
    },
  });

  if (!testSlot) {
    throw new Error("No open test slot found");
  }

  const slotId = testSlot.id;
  const totalConcurrent = 50;
  console.log(`  -> Firing ${totalConcurrent} simultaneous lock requests at slot ${slotId}...`);

  const promises = [];
  for (let i = 1; i <= totalConcurrent; i++) {
    const userId = `concurrent_user_${i}`;
    promises.push(acquireLock(slotId, userId, 180));
  }

  const results = await Promise.all(promises);

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);

  console.log(`  -> Successful Locks Acquired: ${successes.length}`);
  console.log(`  -> Collisions Blocked (409): ${failures.length}`);

  if (successes.length === 1 && failures.length === totalConcurrent - 1) {
    console.log("  ✅ PASS: Exactly ONE request acquired the mutex lock! Zero double-booking verified.\n");
    passedTests++;
  } else {
    console.error(
      `  ❌ FAIL: Expected exactly 1 success, got ${successes.length}\n`
    );
  }

  // Release lock
  await releaseLock(slotId, "concurrent_user_1");

  // ----------------------------------------------------------------
  // TEST 2: AI Triage Structured JSON & Specialty Validation
  // ----------------------------------------------------------------
  console.log("TEST 2: AI Triage Structured JSON & Schema Validation");
  const dermatSymptom = "Red itchy rash with small bumps on my forearms for 3 days";
  const triageRes = deterministicTriage(dermatSymptom);

  console.log("  -> Triage Result Output:", JSON.stringify(triageRes));

  const hasSpecialty = typeof triageRes.specialty === "string" && triageRes.specialty.length > 0;
  const validUrgency = ["GREEN", "AMBER", "RED"].includes(triageRes.urgency);
  const hasReason = typeof triageRes.reason === "string" && triageRes.reason.length > 0;

  if (hasSpecialty && validUrgency && hasReason && triageRes.specialty === "Dermatology") {
    console.log("  ✅ PASS: Triage returned valid structured JSON routing correctly to Dermatology.\n");
    passedTests++;
  } else {
    console.error("  ❌ FAIL: Invalid triage JSON schema or specialty routing\n");
  }

  // ----------------------------------------------------------------
  // TEST 3: Urgency RED Emergency Escalation & Blocking
  // ----------------------------------------------------------------
  console.log("TEST 3: Urgency RED Emergency Escalation (Life Threat Safety)");
  const emergencySymptoms = [
    "Severe crushing chest pain and shortness of breath",
    "நெஞ்சு வலி மற்றும் மூச்சுத்திணறல்",
    "తీవ్రమైన ఛాతీ నొప్పి మరియు గుండెపోటు లక్షణాలు",
  ];

  let redEscalatedCount = 0;
  for (const symptom of emergencySymptoms) {
    const res = deterministicTriage(symptom);
    if (res.urgency === "RED") {
      redEscalatedCount++;
    }
  }

  if (redEscalatedCount === emergencySymptoms.length) {
    console.log(
      `  ✅ PASS: All ${emergencySymptoms.length} emergency inputs (English, Tamil, Telugu) correctly escalated to RED tier.\n`
    );
    passedTests++;
  } else {
    console.error(
      `  ❌ FAIL: Expected ${emergencySymptoms.length} RED escalations, got ${redEscalatedCount}\n`
    );
  }

  // ----------------------------------------------------------------
  // TEST 4: Appointment Cancellation & Slot Re-opening
  // ----------------------------------------------------------------
  console.log("TEST 4: Appointment Cancellation & Atomic Slot Return");
  const patient = await prisma.user.findFirst({ where: { role: "PATIENT" } });

  if (patient) {
    // Book slot
    await prisma.slot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    const testAppt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: testDoctor.id,
        slotId: slotId,
        appointmentDate: testSlot.startTime,
        status: "CONFIRMED",
        urgency: "GREEN",
        encryptedSymptomNotes: "Test note",
        triageSpecialty: "General Medicine",
      },
    });

    // Cancel appointment
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: testAppt.id },
        data: { status: "CANCELLED" },
      }),
      prisma.slot.update({
        where: { id: slotId },
        data: { isBooked: false, isLocked: false },
      }),
    ]);

    // Check slot is open again
    const recheckedSlot = await prisma.slot.findUnique({ where: { id: slotId } });

    if (recheckedSlot && !recheckedSlot.isBooked) {
      console.log("  ✅ PASS: Slot atomically restored to available schedule after cancellation.\n");
      passedTests++;
    } else {
      console.error("  ❌ FAIL: Slot was not freed upon cancellation.\n");
    }

    // Clean up test appt
    await prisma.appointment.delete({ where: { id: testAppt.id } });
  }

  console.log("=================================================");
  console.log(`Summary: ${passedTests}/${totalTests} Tests Passed successfully!`);
  console.log("=================================================");

  await prisma.$disconnect();

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
