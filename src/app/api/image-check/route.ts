import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { services } from "@/data/services";
import { caseStudies } from "@/data/work";
import { team } from "@/data/team";
import { teamLifePhotos } from "@/data/life-photos";

export const dynamic = "force-dynamic";

/** Paths referenced directly in page components (not in the data modules). */
const hardcodedRefs = [
  "/images/life/group-work.jpg",
  "/images/life/office-bright.jpg",
  "/images/life/office-desk.jpg",
  "/images/life/brainstorm.jpg",
  "/images/life/team-desk.jpg",
  "/images/life/sticky-notes.jpg",
  "/images/life/sticky-notes-2.jpg",
  "/images/life/women-team.jpg",
  "/images/life/pair-code.jpg",
  "/images/life/pair-code-2.jpg",
  "/images/life/presentation.jpg",
  "/images/life/office-coworkers.jpg",
  "/images/life/discussion.jpg",
  "/images/services/ecommerce.jpg",
  "/images/work/fintech.jpg",
  "/images/work/saas.jpg",
  "/images/work/cloud.jpg",
  "/images/work/growth.jpg",
  "/images/work/health.jpg",
  "/images/work/ecommerce.jpg",
  "/fonts/sora-latin.woff2",
  "/fonts/manrope-latin.woff2",
  "/fonts/instrument-latin.woff2",
  "/fonts/instrument-italic-latin.woff2",
];

function collectRefs(): string[] {
  const refs = new Set<string>(hardcodedRefs);

  for (const s of services) {
    refs.add(s.heroImage);
    refs.add(s.detailImage);
  }
  for (const c of caseStudies) refs.add(c.image);
  for (const m of team) refs.add(m.photo);
  for (const p of teamLifePhotos) refs.add(`/images/life/team/${p.file}`);

  return Array.from(refs).sort();
}

/**
 * Deployment health check for static assets.
 * Visit `/api/image-check` on a live deploy to see exactly which binary assets
 * are missing from the repo (a common cause of "images not loading").
 */
export async function GET() {
  const refs = collectRefs();
  const missing: string[] = [];
  const present: string[] = [];

  for (const ref of refs) {
    try {
      await fs.access(path.join(process.cwd(), "public", ref));
      present.push(ref);
    } catch {
      missing.push(ref);
    }
  }

  const missingImages = missing.filter((m) => m.startsWith("/images/"));
  const missingFonts = missing.filter((m) => m.startsWith("/fonts/"));

  return NextResponse.json({
    ok: missing.length === 0,
    summary: {
      total: refs.length,
      present: present.length,
      missing: missing.length,
      missingImages: missingImages.length,
      missingFonts: missingFonts.length,
    },
    ...(missing.length > 0
      ? {
          missingImages,
          missingFonts,
          hint:
            "These files are missing from the deployed repo. Make sure the whole public/ folder " +
            "(including binary .jpg / .woff2 files) was committed and pushed to GitHub, then redeploy.",
        }
      : {}),
    allAssets: present,
  });
}
