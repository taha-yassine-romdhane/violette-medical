import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Catalogue snapshot produced by `npx tsx prisma/export-catalog.ts`.
// Product photos live in git under public/products/.
interface SeedSubfamily {
  nameFr: string; nameEn: string; slug: string; order: number; isActive: boolean;
}
interface SeedFamily extends SeedSubfamily { subfamilies: SeedSubfamily[]; }
interface SeedCategory {
  nameFr: string; nameEn: string; slug: string; description: string | null;
  image: string | null; order: number; isActive: boolean; families: SeedFamily[];
}
interface SeedProduct {
  nameFr: string; nameEn: string; slug: string;
  descriptionFr: string | null; descriptionEn: string | null; reference: string | null;
  priceHT: number; taxRate: number; priceTTC: number; stock: number; minStock: number;
  images: string[]; thumbnail: string | null;
  categorySlug: string; familySlug: string | null; subfamilySlug: string | null;
  isFeatured: boolean; featuredOrder: number | null; trackSerial: boolean; isActive: boolean;
}
interface SeedPack {
  nameFr: string; nameEn: string; slug: string;
  descriptionFr: string | null; descriptionEn: string | null;
  priceHT: number; taxRate: number; priceTTC: number;
  image: string | null; isActive: boolean;
  products: { productSlug: string; quantity: number }[];
}
interface SeedSlider {
  titleFr: string | null; titleEn: string | null;
  subtitleFr: string | null; subtitleEn: string | null;
  image: string; link: string | null;
  buttonTextFr: string | null; buttonTextEn: string | null;
  order: number; isActive: boolean;
}
interface SeedFeaturedSection {
  titleFr: string | null; titleEn: string | null;
  subtitleFr: string | null; subtitleEn: string | null;
  isActive: boolean; order: number;
}
interface SeedEvent {
  titleFr: string; titleEn: string;
  descriptionFr: string | null; descriptionEn: string | null;
  location: string | null; date: string; endDate: string | null;
  images: string[]; thumbnail: string | null;
  isActive: boolean; isFeatured: boolean; order: number;
}
interface SeedSetting { key: string; value: string; group: string; }
interface SeedData {
  categories: SeedCategory[];
  products: SeedProduct[];
  packs: SeedPack[];
  sliders: SeedSlider[];
  featuredSections: SeedFeaturedSection[];
  events: SeedEvent[];
  siteSettings: SeedSetting[];
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    // Credentials come from the environment so no real password lives in git.
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@violette-medical.tn";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error(
        "SEED_ADMIN_PASSWORD is not set. Add it to .env before running the seed."
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isActive: true },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrateur",
        role: "ADMIN",
        companyName: "Violette Medical Distribution",
        isActive: true,
      },
    });

    console.log(`Admin account created/verified: ${admin.email}`);

    // ---------------------------------------------------------------
    // Site content — everything except users and transactional data.
    // ---------------------------------------------------------------
    const data: SeedData = JSON.parse(
      readFileSync(join(__dirname, "seed-data.json"), "utf8")
    );

    // Category tree
    for (const cat of data.categories) {
      const { families, ...catData } = cat;
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: catData,
        create: catData,
      });
      for (const fam of families) {
        const { subfamilies, ...famData } = fam;
        const family = await prisma.family.upsert({
          where: { slug: fam.slug },
          update: { ...famData, categoryId: category.id },
          create: { ...famData, categoryId: category.id },
        });
        for (const sf of subfamilies) {
          await prisma.subfamily.upsert({
            where: { slug: sf.slug },
            update: { ...sf, familyId: family.id },
            create: { ...sf, familyId: family.id },
          });
        }
      }
    }
    console.log(`Catalogue tree seeded: ${data.categories.length} categories`);

    // Products
    for (const p of data.products) {
      const { categorySlug, familySlug, subfamilySlug, ...productData } = p;
      const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
      const family = familySlug
        ? await prisma.family.findUniqueOrThrow({ where: { slug: familySlug } })
        : null;
      const subfamily = subfamilySlug
        ? await prisma.subfamily.findUniqueOrThrow({ where: { slug: subfamilySlug } })
        : null;
      const payload = {
        ...productData,
        categoryId: category.id,
        familyId: family?.id ?? null,
        subfamilyId: subfamily?.id ?? null,
      };
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: payload,
        create: payload,
      });
    }
    console.log(`Products seeded: ${data.products.length}`);

    // Packs
    for (const pk of data.packs) {
      const { products: packProducts, ...packData } = pk;
      const pack = await prisma.pack.upsert({
        where: { slug: pk.slug },
        update: packData,
        create: packData,
      });
      for (const pp of packProducts) {
        const product = await prisma.product.findUniqueOrThrow({ where: { slug: pp.productSlug } });
        await prisma.packProduct.upsert({
          where: { packId_productId: { packId: pack.id, productId: product.id } },
          update: { quantity: pp.quantity },
          create: { packId: pack.id, productId: product.id, quantity: pp.quantity },
        });
      }
    }
    console.log(`Packs seeded: ${data.packs.length}`);

    // Sliders (no natural unique key — match on image to stay idempotent)
    for (const s of data.sliders) {
      const existing = await prisma.slider.findFirst({ where: { image: s.image } });
      if (existing) {
        await prisma.slider.update({ where: { id: existing.id }, data: s });
      } else {
        await prisma.slider.create({ data: s });
      }
    }
    console.log(`Sliders seeded: ${data.sliders.length}`);

    // Featured sections (match on order)
    for (const fs of data.featuredSections) {
      const existing = await prisma.featuredSection.findFirst({ where: { order: fs.order } });
      if (existing) {
        await prisma.featuredSection.update({ where: { id: existing.id }, data: fs });
      } else {
        await prisma.featuredSection.create({ data: fs });
      }
    }
    console.log(`Featured sections seeded: ${data.featuredSections.length}`);

    // Events (match on French title + date)
    for (const e of data.events) {
      const payload = { ...e, date: new Date(e.date), endDate: e.endDate ? new Date(e.endDate) : null };
      const existing = await prisma.event.findFirst({
        where: { titleFr: e.titleFr, date: payload.date },
      });
      if (existing) {
        await prisma.event.update({ where: { id: existing.id }, data: payload });
      } else {
        await prisma.event.create({ data: payload });
      }
    }
    console.log(`Events seeded: ${data.events.length}`);

    // Site settings
    for (const s of data.siteSettings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value, group: s.group },
        create: s,
      });
    }
    console.log(`Site settings seeded: ${data.siteSettings.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
