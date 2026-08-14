import "dotenv/config";
import { writeFileSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Dumps all site content (catalogue tree, products, packs, sliders,
// featured sections, events, site settings — everything except users and
// transactional data) into prisma/seed-data.json so `prisma db seed`
// can rebuild it anywhere.
// Run with: npx tsx prisma/export-catalog.ts

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        families: {
          orderBy: { order: "asc" },
          include: { subfamilies: { orderBy: { order: "asc" } } },
        },
      },
    });

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        category: { select: { slug: true } },
        family: { select: { slug: true } },
        subfamily: { select: { slug: true } },
      },
    });

    const packs = await prisma.pack.findMany({
      include: { products: { include: { product: { select: { slug: true } } } } },
    });
    const sliders = await prisma.slider.findMany({ orderBy: { order: "asc" } });
    const featuredSections = await prisma.featuredSection.findMany({ orderBy: { order: "asc" } });
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    const siteSettings = await prisma.siteSetting.findMany();

    const data = {
      categories: categories.map((c) => ({
        nameFr: c.nameFr,
        nameEn: c.nameEn,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order,
        isActive: c.isActive,
        families: c.families.map((f) => ({
          nameFr: f.nameFr,
          nameEn: f.nameEn,
          slug: f.slug,
          order: f.order,
          isActive: f.isActive,
          subfamilies: f.subfamilies.map((sf) => ({
            nameFr: sf.nameFr,
            nameEn: sf.nameEn,
            slug: sf.slug,
            order: sf.order,
            isActive: sf.isActive,
          })),
        })),
      })),
      products: products.map((p) => ({
        nameFr: p.nameFr,
        nameEn: p.nameEn,
        slug: p.slug,
        descriptionFr: p.descriptionFr,
        descriptionEn: p.descriptionEn,
        reference: p.reference,
        priceHT: p.priceHT,
        taxRate: p.taxRate,
        priceTTC: p.priceTTC,
        stock: p.stock,
        minStock: p.minStock,
        images: p.images,
        thumbnail: p.thumbnail,
        categorySlug: p.category.slug,
        familySlug: p.family?.slug ?? null,
        subfamilySlug: p.subfamily?.slug ?? null,
        isFeatured: p.isFeatured,
        featuredOrder: p.featuredOrder,
        trackSerial: p.trackSerial,
        isActive: p.isActive,
      })),
      packs: packs.map((pk) => ({
        nameFr: pk.nameFr,
        nameEn: pk.nameEn,
        slug: pk.slug,
        descriptionFr: pk.descriptionFr,
        descriptionEn: pk.descriptionEn,
        priceHT: pk.priceHT,
        taxRate: pk.taxRate,
        priceTTC: pk.priceTTC,
        image: pk.image,
        isActive: pk.isActive,
        products: pk.products.map((pp) => ({
          productSlug: pp.product.slug,
          quantity: pp.quantity,
        })),
      })),
      sliders: sliders.map((s) => ({
        titleFr: s.titleFr,
        titleEn: s.titleEn,
        subtitleFr: s.subtitleFr,
        subtitleEn: s.subtitleEn,
        image: s.image,
        link: s.link,
        buttonTextFr: s.buttonTextFr,
        buttonTextEn: s.buttonTextEn,
        order: s.order,
        isActive: s.isActive,
      })),
      featuredSections: featuredSections.map((fs) => ({
        titleFr: fs.titleFr,
        titleEn: fs.titleEn,
        subtitleFr: fs.subtitleFr,
        subtitleEn: fs.subtitleEn,
        isActive: fs.isActive,
        order: fs.order,
      })),
      events: events.map((e) => ({
        titleFr: e.titleFr,
        titleEn: e.titleEn,
        descriptionFr: e.descriptionFr,
        descriptionEn: e.descriptionEn,
        location: e.location,
        date: e.date.toISOString(),
        endDate: e.endDate?.toISOString() ?? null,
        images: e.images,
        thumbnail: e.thumbnail,
        isActive: e.isActive,
        isFeatured: e.isFeatured,
        order: e.order,
      })),
      siteSettings: siteSettings.map((s) => ({
        key: s.key,
        value: s.value,
        group: s.group,
      })),
    };

    const out = join(__dirname, "seed-data.json");
    writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(
      `Exported ${data.categories.length} categories, ${data.products.length} products, ` +
        `${data.packs.length} packs, ${data.sliders.length} sliders, ` +
        `${data.featuredSections.length} featured sections, ${data.events.length} events, ` +
        `${data.siteSettings.length} settings to ${out}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
