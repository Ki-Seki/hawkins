# Image Optimization Strategy

## Current State (2026-04-28)

### Issue
The `thumbnail` field in `characters.json` currently points to the same image as the `image` field. This causes:
- Large images (5-6MB PNGs) being loaded for small 26-30px diameter circular markers on the map
- Increased bandwidth usage and slower page load times
- Higher memory consumption for rendering multiple character markers

### Example from `characters.json`
```json
{
  "id": "eleven",
  "image": "images/characters/eleven.png",
  "thumbnail": "images/characters/eleven.png"  // ❌ Same as image
}
```

## Recommended Solution

### 1. Create Actual Thumbnails

Generate true thumbnail images optimized for marker display:

**Target Specs:**
- **Format**: WebP (recommended) or optimized PNG
- **Dimensions**: 96-160px width (2-3x the display size for Retina displays)
- **Quality**: 75-85% (balance between quality and file size)
- **File size target**: < 20KB per thumbnail

**Naming Convention:**
```
images/characters/eleven.png        → Full-size card image
images/characters/eleven-thumb.webp → Thumbnail for map marker
```

### 2. Update JSON Schema

Update character entries to use separate thumbnail paths:

```json
{
  "id": "eleven",
  "image": "images/characters/eleven.png",
  "thumbnail": "images/characters/eleven-thumb.webp"
}
```

### 3. Generation Process

**Using ImageMagick (CLI):**
```bash
# Convert to WebP thumbnail
magick images/characters/eleven.png \
  -resize 128x128^ \
  -gravity center \
  -extent 128x128 \
  -quality 80 \
  images/characters/eleven-thumb.webp

# Or batch process all characters
for img in images/characters/*.png; do
  magick "$img" \
    -resize 128x128^ \
    -gravity center \
    -extent 128x128 \
    -quality 80 \
    "${img%.png}-thumb.webp"
done
```

**Using Sharp (Node.js):**
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateThumbnails() {
  const charactersDir = 'public/images/characters';
  const files = fs.readdirSync(charactersDir)
    .filter(f => f.endsWith('.png') && !f.includes('-thumb'));

  for (const file of files) {
    const inputPath = path.join(charactersDir, file);
    const outputPath = path.join(
      charactersDir,
      file.replace('.png', '-thumb.webp')
    );

    await sharp(inputPath)
      .resize(128, 128, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generateThumbnails();
```

### 4. Update Component Logic

The `CharacterMarker` component already handles this correctly:
- Reads `character.thumbnail` for the marker display
- Falls back to initials if thumbnail is missing or fails to load
- Uses `character.image` in `InfoCard` for the full-size display

No code changes needed once thumbnails are generated and JSON is updated.

## Font Optimization (Bonus)

### Current Issue
Fonts are loaded as OTF files, which are larger than modern formats.

### Recommendation
Convert OTF fonts to WOFF2 for better compression:

```bash
# Using woff2_compress
woff2_compress public/fonts/ITCBenguiatStdBookCn.OTF

# Or using pyftsubset (with subset if only specific glyphs needed)
pyftsubset ITCBenguiatStdBookCn.OTF \
  --output-file=ITCBenguiatStdBookCn.woff2 \
  --flavor=woff2 \
  --layout-features=* \
  --unicodes=U+0020-007E,U+00A0-00FF
```

Update `@font-face` declarations in `index.css`:
```css
@font-face {
  font-family: 'ITC Benguiat Std';
  src: url('/fonts/ITCBenguiatStdBookCn.woff2') format('woff2'),
       url('/fonts/ITCBenguiatStdBookCn.OTF') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## Expected Impact

### Before Optimization
- 8 characters × 5MB per PNG = ~40MB total for character images
- First load requires downloading full images for all visible markers
- Initial page load: ~2-3s on typical broadband

### After Optimization
- 8 characters × 15KB per WebP thumbnail = ~120KB for thumbnails
- Full images only loaded when InfoCard opens
- Initial page load: ~0.5-1s on typical broadband
- **~99% reduction in character image payload for initial render**

## Implementation Checklist

- [ ] Generate WebP thumbnails for all characters (128×128px, 80% quality)
- [ ] Update `src/data/characters.json` with thumbnail paths
- [ ] Test map markers render correctly with new thumbnails
- [ ] Verify InfoCard still shows full-size images
- [ ] Convert OTF fonts to WOFF2 (optional but recommended)
- [ ] Update font-face declarations if WOFF2 conversion is done
- [ ] Measure and document page load improvement

## Validation

After implementation, verify:
1. **DevTools Network Tab**: Check that map only loads thumbnails (~15-20KB each)
2. **Visual Quality**: Thumbnails should look sharp on Retina displays
3. **InfoCard**: Full images load only when card opens
4. **Fallback**: Initials display if thumbnail fails to load

## References

- [WebP Documentation](https://developers.google.com/speed/webp)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [WOFF2 Font Format](https://www.w3.org/TR/WOFF2/)
- [Google Fonts Technical Considerations](https://developers.google.com/fonts/docs/technical_considerations)
