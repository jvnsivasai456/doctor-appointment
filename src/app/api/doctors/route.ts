import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty");
    const query = searchParams.get("query");
    const language = searchParams.get("language");
    const location = searchParams.get("location");
    const maxFee = searchParams.get("maxFee") ? Number(searchParams.get("maxFee")) : undefined;
    const sort = searchParams.get("sort") || "rating"; // rating, fee_asc, fee_desc, experience

    const whereClause: any = {
      isAvailable: true,
    };

    if (specialty && specialty !== "all") {
      whereClause.specialty = {
        name: { equals: specialty },
      };
    }

    if (location && location !== "all") {
      const omrKeywords = [
        "OMR",
        "Sholinganallur",
        "Perungudi",
        "Karapakkam",
        "Kelambakkam",
        "Kottivakkam",
        "Navalur",
        "Padur",
        "Pallikaranai",
      ];
      if (location.toUpperCase() === "OMR") {
        whereClause.OR = omrKeywords.flatMap((kw) => [
          { cityLocation: { contains: kw } },
          { hospital: { contains: kw } },
          { fullAddress: { contains: kw } },
          { landmark: { contains: kw } },
        ]);
      } else {
        whereClause.OR = [
          { cityLocation: { contains: location } },
          { hospital: { contains: location } },
          { fullAddress: { contains: location } },
          { landmark: { contains: location } },
          { pincode: { contains: location } },
        ];
      }
    }

    if (query && query.trim()) {
      const searchConditions = [
        { user: { name: { contains: query.trim() } } },
        { bio: { contains: query.trim() } },
        { qualification: { contains: query.trim() } },
        { specialty: { name: { contains: query.trim() } } },
        { hospital: { contains: query.trim() } },
        { cityLocation: { contains: query.trim() } },
        { fullAddress: { contains: query.trim() } },
        { landmark: { contains: query.trim() } },
        { doctorIdCode: { contains: query.trim() } },
        { pincode: { contains: query.trim() } },
      ];
      if (whereClause.OR) {
        whereClause.AND = [{ OR: searchConditions }];
      } else {
        whereClause.OR = searchConditions;
      }
    }

    if (language && language !== "all") {
      whereClause.languages = {
        contains: language,
      };
    }

    if (maxFee) {
      whereClause.consultationFee = {
        lte: maxFee,
      };
    }

    let orderBy: any = { rating: "desc" };
    if (sort === "fee_asc") orderBy = { consultationFee: "asc" };
    if (sort === "fee_desc") orderBy = { consultationFee: "desc" };
    if (sort === "experience") orderBy = { experienceYears: "desc" };

    const now = new Date();

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        specialty: true,
        slots: {
          where: {
            isBooked: false,
            isLocked: false,
            isEmergencyBlocked: false,
            startTime: { gt: now },
          },
          orderBy: { startTime: "asc" },
          take: 3,
        },
      },
      orderBy,
    });

    return NextResponse.json(doctors);
  } catch (error: any) {
    console.error("Doctors API error:", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
