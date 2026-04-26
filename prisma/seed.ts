import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const stages = [
  {
    number: 1,
    name: "Ridgewood Loop",
    date: new Date("2025-09-06"),
    distanceKm: 5.5,
    description:
      "The opening stage winds through the heart of Ridgewood, passing Cypress Hills Cemetery and the historic Onderdonk House.",
    routeMapUrl: null,
  },
  {
    number: 2,
    name: "Myrtle Avenue Sprint",
    date: new Date("2025-09-07"),
    distanceKm: 4.2,
    description:
      "A flat, fast stage along Myrtle Avenue with a sprint finish at Grover Cleveland Park.",
    routeMapUrl: null,
  },
  {
    number: 3,
    name: "Forest Park Climb",
    date: new Date("2025-09-13"),
    distanceKm: 7.1,
    description:
      "The queen stage: a challenging loop through Forest Park featuring the signature Woodhaven Blvd climb.",
    routeMapUrl: null,
  },
  {
    number: 4,
    name: "Bushwick Border",
    date: new Date("2025-09-14"),
    distanceKm: 5.8,
    description:
      "Cross into Bushwick and back, tracing the Brooklyn–Queens border through industrial streets.",
    routeMapUrl: null,
  },
  {
    number: 5,
    name: "Cemetery Circuit",
    date: new Date("2025-09-20"),
    distanceKm: 6.3,
    description:
      "A scenic circuit skirting the historic cemeteries of Middle Village.",
    routeMapUrl: null,
  },
  {
    number: 6,
    name: "Glendale Gallop",
    date: new Date("2025-09-21"),
    distanceKm: 5.0,
    description:
      "Through the quiet residential streets of Glendale with a rolling mid-stage hill section.",
    routeMapUrl: null,
  },
  {
    number: 7,
    name: "Woodhaven Challenge",
    date: new Date("2025-09-27"),
    distanceKm: 6.8,
    description:
      "Heading south into Woodhaven and Richmond Hill before the final ascent back to the start.",
    routeMapUrl: null,
  },
  {
    number: 8,
    name: "Grand Finale",
    date: new Date("2025-09-28"),
    distanceKm: 8.0,
    description:
      "The final stage: a grand loop connecting all neighborhoods of the race with a ceremonial finish on Palmetto Street.",
    routeMapUrl: null,
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
      where: { number: stage.number },
      create: stage,
      update: stage,
    });
    console.log(`  ✓ Stage ${stage.number}: ${stage.name}`);
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
