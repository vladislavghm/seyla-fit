# Image Performance Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate slow image loading on seyla-fit.ru/home by migrating CSS background-images to Next.js `<Image>`, enabling ISR, and fixing Swiper lazy loading.

**Architecture:** Replace inline CSS `background-image` in Hero and Trial blocks with `<Image fill>` components so Next.js handles WebP conversion, responsive sizing, and preloading. Enable ISR (`revalidate = 60`) to cache pages and reduce TTFB. Add `priority` to first visible training images.

**Tech Stack:** Next.js 15, `next/image`, TinaCMS, Swiper

---

### Task 1: Migrate Hero background to `<Image fill priority>`

**Files:**
- Modify: `components/blocks/hero.tsx`

The hero is the LCP element — this is the highest-priority fix. Replace the CSS `backgroundImage`/`backgroundSize`/`backgroundPosition`/`backgroundRepeat` style properties with a `<Image fill priority>` component positioned absolutely behind the content.

**Step 1: Open the file and locate the backgroundStyle object**

Read `components/blocks/hero.tsx` lines 36–51. You will see:
```tsx
const backgroundStyle: React.CSSProperties = {
  backgroundColor: backgroundImage ? undefined : backgroundColor,
  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
  backgroundSize: backgroundImage ? "cover" : undefined,
  backgroundPosition: backgroundImage ? "center" : undefined,
  backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
};
```
And the `<section>` that uses it:
```tsx
<section
  className="relative h-screen flex items-center"
  style={backgroundStyle}
  data-tina-field={tinaField(data, "backgroundImage")}
>
  {backgroundImage && <div className="absolute inset-0 bg-black/20" />}
```

**Step 2: Replace the `backgroundStyle` object and `<section>` opening**

Remove the entire `backgroundStyle` object (lines 36–42).

Replace the `<section>` opening tag and the overlay div with:
```tsx
<section
  className="relative h-screen flex items-center overflow-hidden"
  style={!backgroundImage ? { backgroundColor } : undefined}
>
  {backgroundImage && (
    <div
      className="absolute inset-0"
      data-tina-field={tinaField(data, "backgroundImage")}
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
        unoptimized={backgroundImage.startsWith("http")}
      />
    </div>
  )}
  {backgroundImage && <div className="absolute inset-0 bg-black/20" />}
```

Note: `Image` is already imported at line 2 — no new import needed.

**Step 3: Run the dev server and verify visually**

```bash
pnpm dev
```

Open http://localhost:3000/home and check:
- Hero background image renders correctly
- Text/button are visible above the image
- On Chrome DevTools → Network → Img: hero image loads as WebP and has `rel=preload` in the document `<head>`
- TinaCMS visual editor (http://localhost:3000/admin) → click the hero section → background image field still shows the picker

**Step 4: Commit**

```bash
git add components/blocks/hero.tsx
git commit -m "perf: migrate hero background to Next.js Image with priority"
```

---

### Task 2: Migrate Trial background to `<Image fill>` and remove fixed attachment

**Files:**
- Modify: `components/blocks/trial.tsx`

The trial block has two problems: CSS background (no optimization) and `backgroundAttachment: "fixed"` (kills GPU compositing on mobile).

**Step 1: Open the file and locate the backgroundStyle object**

Read `components/blocks/trial.tsx` lines 76–84. You will see:
```tsx
const backgroundStyle: React.CSSProperties = data.trialBackgroundImage
  ? {
      backgroundImage: `url(${data.trialBackgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }
  : {};
```

And the container div that uses it (line 87–91):
```tsx
<div
  id="trial"
  className="relative py-16 lg:py-24 min-h-[600px] scroll-mt-20"
  style={backgroundStyle}
>
```

**Step 2: Remove the `backgroundStyle` object entirely**

Delete lines 76–84 (the entire `backgroundStyle` const).

**Step 3: Update the container div and add `<Image>`**

Replace the container `<div>` opening and the existing background-handling divs. The current structure is:
```tsx
<div id="trial" className="relative ..." style={backgroundStyle}>
  {/* Оверлей */}
  {data.trialBackgroundImage && (
    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} ... />
  )}
  {/* Фон без изображения */}
  {!data.trialBackgroundImage && (
    <div className="absolute inset-0" style={{ backgroundColor: ... }} />
  )}
  {/* Tina field для фонового изображения */}
  {data.trialBackgroundImage && (
    <div className="hidden" data-tina-field={tinaField(data, "trialBackgroundImage")} />
  )}
```

Replace with:
```tsx
<div id="trial" className="relative py-16 lg:py-24 min-h-[600px] scroll-mt-20 overflow-hidden">
  {/* Фоновое изображение */}
  {data.trialBackgroundImage && (
    <div className="absolute inset-0">
      <Image
        src={data.trialBackgroundImage}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized={data.trialBackgroundImage.startsWith("http")}
      />
    </div>
  )}
  {/* Оверлей с настраиваемой прозрачностью */}
  {data.trialBackgroundImage && (
    <div
      className="absolute inset-0 bg-black"
      style={{ opacity: overlayOpacity }}
      data-tina-field={tinaField(data, "trialOverlayOpacity")}
    />
  )}
  {/* Фон для контента (если нет изображения) */}
  {!data.trialBackgroundImage && (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: (data as any).backgroundColor || "transparent",
      }}
    />
  )}
  {/* Tina field для фонового изображения */}
  {data.trialBackgroundImage && (
    <div
      className="hidden"
      data-tina-field={tinaField(data, "trialBackgroundImage")}
    />
  )}
```

Add `Image` import — it's not yet imported in trial.tsx. Add at the top:
```tsx
import Image from "next/image";
```

**Step 4: Run the dev server and verify visually**

```bash
pnpm dev
```

Open http://localhost:3000/home and scroll to the trial section. Check:
- Background image renders correctly
- Overlay darkening still works
- No parallax/sticky effect (expected — removed intentionally for mobile performance)
- On Chrome DevTools → Network: trial image loads lazily (not preloaded)
- TinaCMS admin: click trial section → background image field still works

**Step 5: Commit**

```bash
git add components/blocks/trial.tsx
git commit -m "perf: migrate trial background to Next.js Image, remove fixed attachment"
```

---

### Task 3: Enable ISR (revalidate = 60) on both page routes

**Files:**
- Modify: `app/page.tsx:8-9`
- Modify: `app/[...urlSegments]/page.tsx:9-10`

Currently every page hit triggers fresh Tina Cloud API calls before HTML is served. ISR generates the page once and serves it cached, revalidating in the background every 60 seconds.

**Step 1: Update `app/page.tsx`**

Find and replace these two lines at the top of the file:
```tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

Replace with:
```tsx
export const revalidate = 60;
```

**Step 2: Update `app/[...urlSegments]/page.tsx`**

Same change — find and replace:
```tsx
// Отключаем статическую генерацию - страница будет генерироваться динамически
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

Replace with:
```tsx
export const revalidate = 60;
```

Also remove the stale comment above it.

**Step 3: Run build to verify ISR works**

```bash
pnpm build
```

Expected output: pages listed as `○ (Static)` or `ISR` — not `λ (Dynamic)`. If TinaCMS is unavailable during build, `generateStaticParams` returns `[]` and pages fall back to on-demand ISR — that's acceptable.

**Step 4: Commit**

```bash
git add app/page.tsx app/[...urlSegments]/page.tsx
git commit -m "perf: enable ISR (revalidate=60) to cache pages and reduce TTFB"
```

---

### Task 4: Add `priority` to first visible training card images

**Files:**
- Modify: `components/blocks/trainings.tsx:128-155`

The first 3 training cards are visible on desktop without scrolling. Adding `priority` to them triggers preloading. The remaining cards are already lazy-loaded by Next.js `<Image>` default behavior.

**Step 1: Add `priority` prop based on index**

In `trainings.tsx`, find the local image `<Image>` (around line 144):
```tsx
<Image
  src={training.trainingImage}
  alt={training.trainingTitle || "Тренировка"}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
  data-tina-field={tinaField(training, "trainingImage")}
/>
```

Add `priority={index < 3}`:
```tsx
<Image
  src={training.trainingImage}
  alt={training.trainingTitle || "Тренировка"}
  fill
  priority={index < 3}
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
  data-tina-field={tinaField(training, "trainingImage")}
/>
```

**Step 2: Run the dev server and verify**

```bash
pnpm dev
```

Open http://localhost:3000/home, scroll to the trainings section. In Chrome DevTools → Network → Img: the first 3 training images should have `fetchpriority="high"`.

**Step 3: Commit**

```bash
git add components/blocks/trainings.tsx
git commit -m "perf: add priority to first 3 training card images"
```

---

### Task 5: Lint check and final verification

**Step 1: Run linter**

```bash
pnpm lint
```

Fix any issues reported by Biome.

**Step 2: Run production build**

```bash
pnpm build
```

Confirm build succeeds with no errors.

**Step 3: Final visual check (dev server)**

```bash
pnpm dev
```

Open http://localhost:3000/home and verify with Chrome DevTools → Lighthouse:
- LCP should be significantly improved (hero image now preloaded)
- No layout shift from images
- Network tab: hero image loads with `fetchpriority=high`
- Trial image loads lazily (no preload)

**Step 4: Commit docs**

```bash
git add docs/
git commit -m "docs: add image performance optimization design and plan"
```
