# Design: Image Performance Optimization

**Date:** 2026-03-01
**Approach:** A — Full Next.js `<Image>` migration

## Problem Summary

Slow image loading on seyla-fit.ru/home due to:
1. Hero and Trial backgrounds loaded via CSS `url()` — bypasses Next.js optimization entirely (no WebP, no resizing, no preload)
2. `force-dynamic` + `revalidate = 0` — no caching, every request queries Tina Cloud before serving HTML
3. `backgroundAttachment: "fixed"` in Trial — disables GPU compositing on mobile
4. Swiper carousel loads all slide images simultaneously (loop mode renders all slides in DOM)

## Changes

### 1. `components/blocks/hero.tsx`
- Remove `backgroundStyle` object (CSS `background-image` inline style)
- Add `<Image fill priority className="object-cover" sizes="100vw">` inside `<section>`
- Move `data-tina-field` attribute to the Image wrapper div
- Keep colored `backgroundColor` fallback for when no image is set
- Handle external URLs (starting with `http`) with `unoptimized` prop

### 2. `components/blocks/trial.tsx`
- Remove CSS `background-image` inline style and `backgroundAttachment: "fixed"`
- Add `<Image fill className="object-cover" sizes="100vw">` inside the container
- Keep the overlay `<div>` with `opacity` above the Image
- Keep hidden `data-tina-field` div for TinaCMS inline editing
- Handle external URLs with `unoptimized` prop

### 3. `app/page.tsx` and `app/[...urlSegments]/page.tsx`
- Remove `export const dynamic = "force-dynamic"`
- Change `export const revalidate = 0` → `export const revalidate = 60`
- Pages will be generated at build time (via `generateStaticParams`) and revalidated every 60s (ISR)

### 4. `components/blocks/trainings.tsx`
- Add `priority` prop to the first 3 training card images (initially visible on desktop)
- Remaining images already have `loading="lazy"` by default via Next.js `<Image>`

## TinaCMS Compatibility

- No schema changes — all image fields remain `type: "image"` with same `uploadDir`
- `data-tina-field` attributes preserved on visible elements
- TinaCMS image picker continues to work unchanged

## Non-Goals

- No changes to image files themselves (compression/resizing of source files)
- No CDN configuration changes
- No changes to Swiper loop mode (lazy loading already handled by Next.js `<Image>` default behavior)
