import assert from 'node:assert/strict';
import { COUNTRIES } from '../data/documentRequirements.ts';
import { clampCrop, fitContain, guideFrame, toSourceCrop } from './cropMath.ts';

const src = { width: 3000, height: 4000 };
const box = { w: 390, h: 600 };
const near = (a: number, b: number, tol = 0.01) => Math.abs(a - b) / b < tol;

for (const c of COUNTRIES) {
  for (const d of c.documents) {
    const aspect = d.outputPx.width / d.outputPx.height;
    const f = guideFrame(d);
    assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= 1 && f.y + f.h <= 1, `${d.id}: guide inside preview`);

    const img = fitContain(src, box);
    assert.ok(img.w <= box.w + 1e-6 && img.h <= box.h + 1e-6, `${d.id}: image fits box`);
    // wild frames (too big, outside, tiny) always end up inside the image with the locked aspect
    for (const raw of [{ x: -50, y: -50, w: 9999 }, { x: 9999, y: 9999, w: 1 }, { x: 100, y: 200, w: 150 }]) {
      const c2 = clampCrop(raw, img, aspect);
      assert.ok(c2.x >= 0 && c2.y >= 0 && c2.x + c2.w <= img.w + 1e-6 && c2.y + c2.w / aspect <= img.h + 1e-6, `${d.id}: clamped`);
      const r = toSourceCrop(c2, img, src, aspect);
      assert.ok(r.originX >= 0 && r.originY >= 0 && r.originX + r.width <= src.width && r.originY + r.height <= src.height, `${d.id}: source crop inside`);
      // crop aspect equals output aspect, so the resize never distorts
      assert.ok(near(r.width / r.height, aspect), `${d.id}: aspect ${r.width / r.height} vs ${aspect}`);
    }
  }
}
console.log('cropMath ok');
