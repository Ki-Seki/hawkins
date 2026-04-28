# Unused Data Fields Analysis

## Purpose
This document identifies data fields in the JSON schema that are defined but not actively consumed by the UI, leading to potential confusion for contributors.

## Analysis Results

### 1. `moments.json` - `nextMomentId` Field

**Status**: ❌ Declared but unused

**Current Behavior:**
- Field exists in schema: `nextMomentId?: string | null`
- Populated in data (e.g., `"nextMomentId": "s01e01-search-begins"`)
- **NOT** used by `useTimeline.ts` for navigation

**How Timeline Actually Works:**
```typescript
// useTimeline.ts uses sortKey and array index:
const moments = momentsSorted  // Sorted by sortKey
const currentIndex = moments.findIndex((m) => m.id === currentMomentId)
next: () => setMoment(moments[currentIndex + 1].id)  // Array-based
```

**Decision**: 🗑️ **Remove from schema**

Timeline navigation should use ONE consistent approach. The current `sortKey`-based system is:
- Simpler to maintain (single source of truth)
- Easier for contributors to understand (just increment sortKey)
- Less error-prone (no manual linking required)

**Action Items:**
1. Remove `nextMomentId?: string | null` from `Moment` interface in `src/types/index.ts`
2. Remove field from all entries in `src/data/moments.json`
3. Remove from Zod schema in `src/data/catalog.ts`

---

### 2. `locations.json` - `map.radius` Field

**Status**: ⚠️ Declared but inconsistently applied

**Current Behavior:**
- Field exists in schema: `map.radius?: number`
- Present in data (e.g., `"radius": 20`)
- **NOT** used by `LocationMarker.tsx` - uses fixed `r = 6` or `r = 7`

**How It Should Work:**
```typescript
// LocationMarker should use:
const r = location.map.radius ?? 6
```

**Decision**: ✅ **Consume in UI**

Per-location radius makes sense for:
- Large locations (Hawkins Lab) vs small locations (telephone poles)
- Visual hierarchy on the map
- Flexibility for contributors to adjust marker sizes

**Action Items:**
1. Update `LocationMarker.tsx` to read `location.map.radius ?? 6`
2. Document in `.github/copilot-instructions.md` that contributors can set custom radii
3. Test with varied radius values to ensure visual balance

---

### 3. `map-layout.json` - Entire File

**Status**: ❌ Validated but never consumed

**Current Behavior:**
- File exists and is validated in `src/data/catalog.ts`
- Defines: `canvasWidth`, `canvasHeight`, `svgPath`, `defaultTheme`, `regions`
- **NOT** used by `HawkinsMap.tsx` - hardcodes `map.svg` path

**How It Should Work:**
```typescript
// HawkinsMap should import and use:
import { mapLayout } from '../../data/catalog'
<img src={`${import.meta.env.BASE_URL}${mapLayout.svgPath}`} />
```

**Decision**: ✅ **Consume in UI** (if using map-layout) OR 🗑️ **Remove** (if staying hardcoded)

**Recommendation**: Consume it. Benefits:
- Allows swapping base maps without code changes
- `regions` field enables future hover info zones
- `canvasWidth`/`canvasHeight` useful for aspect ratio locking
- `defaultTheme` could drive initial visual state

**Action Items:**
1. Update `HawkinsMap.tsx` to use `mapLayout.svgPath`
2. Consider using `mapLayout.canvasWidth/Height` for SVG viewBox calculation
3. Export `mapLayout` from catalog (currently suppressed with ts-ignore)
4. Remove the `@ts-expect-error` comment once consumed

---

### 4. Character `homeLocationId`

**Status**: ✅ Present and potentially useful

**Current Behavior:**
- Field exists: `homeLocationId: string`
- Populated in all character entries
- **NOT** currently used for rendering

**Potential Use Cases:**
- Default character location when no moment-state override
- "Where is X normally?" info in InfoCard
- Timeline scrubbing fallback positions

**Decision**: ✅ **Keep for now** (may be used in future features)

No action needed. This is a reasonable metadata field even if not actively rendered.

---

### 5. Episode `season` and `episode` Numbers

**Status**: ✅ Used by Timeline

**Current Behavior:**
- Used by `Timeline.tsx` to format episode labels (e.g., "S01E01")
- Essential for display

**Decision**: ✅ **Keep** (actively consumed)

---

### 6. Character/Location `tags` Arrays

**Status**: ✅ Used by InfoCard

**Current Behavior:**
- Rendered as pills in `InfoCard.tsx`
- Useful metadata for contributors and users

**Decision**: ✅ **Keep** (actively consumed)

---

## Summary Table

| Field | File | Status | Action |
|-------|------|--------|--------|
| `nextMomentId` | moments.json | ❌ Unused | 🗑️ Remove from schema |
| `map.radius` | locations.json | ⚠️ Partial | ✅ Consume in LocationMarker |
| `mapLayout.*` | map-layout.json | ❌ Unused | ✅ Consume in HawkinsMap (or remove file) |
| `homeLocationId` | characters.json | ⚠️ Unused | ✅ Keep (potential future use) |
| `season`/`episode` | episodes.json | ✅ Used | ✅ Keep |
| `tags` | characters.json, locations.json | ✅ Used | ✅ Keep |

---

## Implementation Priority

### High Priority (Breaking Schema Changes)
1. ✅ **Remove `nextMomentId`** - Eliminates dual navigation approach confusion
2. ✅ **Consume `map.radius`** - Makes per-location sizing work as documented

### Medium Priority (Enhancement)
3. ✅ **Consume `mapLayout`** - Enables data-driven base map configuration

### Low Priority (No Action)
4. ✅ **Keep `homeLocationId`** - Reserved for future features

---

## Migration Notes

### Removing `nextMomentId`

**Before:**
```json
{
  "id": "s01e01-cold-open",
  "nextMomentId": "s01e01-search-begins",
  ...
}
```

**After:**
```json
{
  "id": "s01e01-cold-open",
  ...
}
```

Timeline will continue to work identically since it never used this field.

### Consuming `map.radius`

**Before (LocationMarker.tsx):**
```typescript
const r = isSelected ? 7 : 6
```

**After:**
```typescript
const baseRadius = location.map.radius ?? 6
const r = isSelected ? baseRadius + 1 : baseRadius
```

Existing locations without explicit radius will default to 6 (current behavior).

### Consuming `mapLayout`

**Before (HawkinsMap.tsx):**
```typescript
<img src={`${import.meta.env.BASE_URL}map.svg`} />
```

**After:**
```typescript
import { mapLayout } from '../../data/catalog'
<img src={`${import.meta.env.BASE_URL}${mapLayout.svgPath}`} />
```

Current `map-layout.json` has `"svgPath": "map.svg"`, so behavior is identical.

---

## Testing Checklist

After implementing changes:

- [ ] Build passes without TypeScript errors
- [ ] Timeline navigation still works correctly
- [ ] Location markers render with varied sizes if radius specified
- [ ] Map image loads from `mapLayout.svgPath`
- [ ] No console errors or warnings
- [ ] Visual regression test passes (markers, animations, layout)

---

## Future Considerations

### Potential New Fields

As the project scales to S1-S5, consider adding:

1. **`moments.duration`** - How long to display moment in auto-play mode (currently hardcoded 6s)
2. **`locations.mapIconType`** - Custom marker shapes (pin, circle, building icon, etc.)
3. **`characterStates.emote`** - Emotional state overlays on markers (scared, angry, etc.)
4. **`momentStates.cameraTarget`** - Already in schema but not yet implemented

These should only be added when there's a concrete UI implementation plan.
