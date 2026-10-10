import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const BADGE_WIDTH = 322;
const BADGE_HEIGHT = 104;
const badgeLeft = Math.round((WIDTH - BADGE_WIDTH) / 2);
const badgeTop = HEIGHT - BADGE_HEIGHT - 24;

const badge = Buffer.from(`<svg width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" viewBox="0 0 322 104" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="10" width="306" height="88" rx="22" fill="#06291f" fill-opacity=".38"/>
  <rect x="2" y="2" width="306" height="88" rx="22" fill="#ffffff" fill-opacity=".97"/>
  <rect x="3" y="3" width="304" height="86" rx="21" fill="none" stroke="#e9eee8" stroke-width="2"/>
</svg>`);

export async function brandedSocialImage(source: Buffer, logo: Buffer): Promise<Buffer> {
  const sourceMeta = await sharp(source).metadata();
  if (!sourceMeta.width || !sourceMeta.height) throw new Error('Fotografía inválida.');

  const resizedLogo = await sharp(logo).resize({ width: 250, height: 70, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const logoWidth = logoMeta.width ?? 250;
  const logoHeight = logoMeta.height ?? 63;
  const brandLayer = [
    { input: badge, left: badgeLeft, top: badgeTop },
    { input: resizedLogo, left: badgeLeft + 2 + Math.round((306 - logoWidth) / 2), top: badgeTop + 2 + Math.round((88 - logoHeight) / 2) },
  ];

  if (sourceMeta.width / sourceMeta.height < 1.2) {
    // Un fondo creado con la propia foto evita franjas vacías sin cortar el producto.
    const background = await sharp(source).resize(WIDTH, HEIGHT, { fit: 'cover' }).blur(28).modulate({ brightness: .7 }).toBuffer();
    const foreground = await sharp(source).resize(WIDTH, HEIGHT, { fit: 'inside' }).toBuffer();
    return sharp(background).composite([{ input: foreground, gravity: 'centre' }, ...brandLayer]).jpeg({ quality: 84, progressive: true }).toBuffer();
  }

  return sharp(source).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' }).composite(brandLayer).jpeg({ quality: 84, progressive: true }).toBuffer();
}
