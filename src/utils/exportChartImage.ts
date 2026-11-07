/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Turns an on-screen Recharts chart into a PNG with a title, the source and the site name,
 * so a chart can be shared without losing where it came from.
 */

const STYLE_PROPS = [
  'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-family', 'font-weight', 'text-anchor', 'dominant-baseline',
];

function inlineStyles(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source);
  const style = STYLE_PROPS.map((p) => `${p}:${computed.getPropertyValue(p)}`).join(';');
  target.setAttribute('style', `${target.getAttribute('style') ?? ''};${style}`);
  const s = Array.from(source.children);
  const t = Array.from(target.children);
  for (let i = 0; i < s.length && i < t.length; i++) inlineStyles(s[i], t[i]);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface ChartImageOptions {
  title: string;
  subtitle?: string;
  source: string;
  siteName: string;
  filename: string;
}

/** Draws the first <svg> inside `container` onto a PNG and downloads it. Rejects if there is no chart to draw. */
export async function exportChartImage(container: HTMLElement, opts: ChartImageOptions): Promise<void> {
  const svg = container.querySelector('svg.recharts-surface') ?? container.querySelector('svg');
  if (!svg) throw new Error('No chart found to export');

  const rect = svg.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(200, Math.round(rect.height));

  const clone = svg.cloneNode(true) as SVGSVGElement;
  inlineStyles(svg, clone);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not draw the chart'));
      el.src = url;
    });

    const dark = document.documentElement.classList.contains('dark');
    const bg = dark ? '#0f172a' : '#ffffff';
    const fg = dark ? '#f1f5f9' : '#0f172a';
    const muted = dark ? '#94a3b8' : '#64748b';

    const scale = 2;
    const pad = 24;
    const innerWidth = width;
    const measure = document.createElement('canvas').getContext('2d')!;
    measure.font = '600 20px Georgia, serif';
    const titleLines = wrapText(measure, opts.title, innerWidth);
    const headerHeight = pad + titleLines.length * 26 + (opts.subtitle ? 22 : 0) + 8;
    const footerHeight = 44;
    const totalW = innerWidth + pad * 2;
    const totalH = headerHeight + height + footerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = totalW * scale;
    canvas.height = totalH * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, totalW, totalH);

    ctx.fillStyle = fg;
    ctx.font = '600 20px Georgia, serif';
    ctx.textBaseline = 'top';
    titleLines.forEach((l, i) => ctx.fillText(l, pad, pad + i * 26));
    if (opts.subtitle) {
      ctx.fillStyle = muted;
      ctx.font = '13px ui-monospace, Menlo, monospace';
      ctx.fillText(opts.subtitle, pad, pad + titleLines.length * 26 + 2);
    }

    ctx.drawImage(img, pad, headerHeight, width, height);

    ctx.fillStyle = muted;
    ctx.font = '12px ui-monospace, Menlo, monospace';
    ctx.fillText(`Source: ${opts.source}`, pad, headerHeight + height + 10);
    ctx.textAlign = 'right';
    ctx.fillStyle = fg;
    ctx.font = '600 13px Georgia, serif';
    ctx.fillText(`${opts.siteName} · ${window.location.host}`, totalW - pad, headerHeight + height + 10);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not create the image');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = opts.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
