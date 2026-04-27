import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StageType } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const stages = [
  {
    stageNumber: 1,
    name: "Ridgewood Loop",
    date: new Date("2025-09-06"),
    startLocation: "Palmetto Street, Ridgewood",
    endLocation: "Palmetto Street, Ridgewood",
    distanceKm: 5.5,
    stageType: StageType.FLAT,
    description:
      "The opening stage winds through the heart of Ridgewood, passing Cypress Hills Cemetery and the historic Onderdonk House.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 2,
    name: "Myrtle Avenue Sprint",
    date: new Date("2025-09-07"),
    startLocation: "Myrtle Avenue & Wyckoff, Ridgewood",
    endLocation: "Grover Cleveland Park, Ridgewood",
    distanceKm: 4.2,
    stageType: StageType.FLAT,
    description:
      "A flat, fast stage along Myrtle Avenue with a sprint finish at Grover Cleveland Park.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 3,
    name: "Forest Park Climb",
    date: new Date("2025-09-13"),
    startLocation: "Park Lane South, Forest Park",
    endLocation: "Park Lane South, Forest Park",
    distanceKm: 7.1,
    stageType: StageType.HILLY,
    description:
      "The queen stage: a challenging loop through Forest Park featuring the signature Woodhaven Blvd climb.",
    stravaEmbedUrl: null,
    elevationDescription: "Woodhaven Blvd climb",
  },
  {
    stageNumber: 4,
    name: "Bushwick Border",
    date: new Date("2025-09-14"),
    startLocation: "Knickerbocker Ave, Ridgewood",
    endLocation: "Knickerbocker Ave, Ridgewood",
    distanceKm: 5.8,
    stageType: StageType.FLAT,
    description:
      "Cross into Bushwick and back, tracing the Brooklyn–Queens border through industrial streets.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 5,
    name: "Cemetery Circuit",
    date: new Date("2025-09-20"),
    startLocation: "Cypress Hills St, Ridgewood",
    endLocation: "Cypress Hills St, Ridgewood",
    distanceKm: 6.3,
    stageType: StageType.MIXED,
    description: "A scenic circuit skirting the historic cemeteries of Middle Village.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 6,
    name: "Glendale Gallop",
    date: new Date("2025-09-21"),
    startLocation: "Myrtle Ave & Cooper Ave, Glendale",
    endLocation: "Myrtle Ave & Cooper Ave, Glendale",
    distanceKm: 5.0,
    stageType: StageType.MIXED,
    description:
      "Through the quiet residential streets of Glendale with a rolling mid-stage hill section.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 7,
    name: "Woodhaven Challenge",
    date: new Date("2025-09-27"),
    startLocation: "Jamaica Ave, Woodhaven",
    endLocation: "Jamaica Ave, Woodhaven",
    distanceKm: 6.8,
    stageType: StageType.HILLY,
    description:
      "Heading south into Woodhaven and Richmond Hill before the final ascent back to the start.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
  {
    stageNumber: 8,
    name: "Grand Finale",
    date: new Date("2025-09-28"),
    startLocation: "Palmetto Street, Ridgewood",
    endLocation: "Palmetto Street, Ridgewood",
    distanceKm: 8.0,
    stageType: StageType.MIXED,
    description:
      "The final stage: a grand loop connecting all neighborhoods of the race with a ceremonial finish on Palmetto Street.",
    stravaEmbedUrl: null,
    elevationDescription: null,
  },
];

const teams = [
  { name: "Ridgewood Rouleurs", color: "#FFD700" },
  { name: "Myrtle Avenue Sprinters", color: "#FC4C02" },
  { name: "Forest Park Climbers", color: "#228B22" },
  { name: "Bushwick Breakaway", color: "#6B21A8" },
];

async function main() {
  console.log("🌱 Seeding Tour de Ridgewood database…");

  // Upsert stages
  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { stageNumber: stage.stageNumber },
      create: stage,
      update: stage,
    });
    console.log(`  ✓ Stage ${stage.stageNumber}: ${stage.name}`);

  }

  // Upsert teams
  for (const team of teams) {
    const existing = await prisma.team.findFirst({ where: { name: team.name } });
    if (existing) {
      await prisma.team.update({ where: { id: existing.id }, data: team });
    } else {
      await prisma.team.create({ data: team });
    }
    console.log(`  ✓ Team: ${team.name}`);
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
