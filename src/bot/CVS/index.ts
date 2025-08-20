import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { MyContext } from 'src/helpers/sesion';

export async function sendUsersCSV(ctx: MyContext, users: any[]) {
  const header =
    [
      'F.I.SH',
      'Telegram username',
      'Telefon 1',
      'Telefon 2',
      "Ta'lim dargoh",
      "Yo'nalish",
      'Daraja',
      'Tillar',
      'Doimiy manzil',
      'Hozirgi manzil',
      'Resume',
      'Portfolio',
      'Ish holati',
      'Yosh',
    ].join(',') + '\n';

  const rows = users.map((u) => {
    const tillString = Array.isArray(u.till) ? u.till.join('; ') : '';

    const clean = (str: string) =>
      str ? `"${str.replace(/"/g, '""')}"` : '""';

    return [
      clean(u.fullName || ''),
      clean(u.username || ''),
      clean(u.tel_1 || ''),
      clean(u.tel_2 || ''),
      clean(u.universitet || ''),
      clean(u.yonalish || ''),
      clean(u.daraja || ''),
      clean(tillString),
      clean(u.addres_doyimiy || ''),
      clean(u.addres_hozir || ''),
      clean(u.rezumey_link || ''),
      clean(u.portfoly_link || ''),
      clean(u.ish_holati || ''),
      clean(String(u.age) || ''),
    ].join(',');
  });

  const csvContent = header + rows.join('\n');

  const filePath = join(__dirname, 'users.csv');

  writeFileSync(filePath, csvContent, 'utf8');

  await ctx.replyWithDocument({ source: filePath, filename: 'users.csv' });

  unlinkSync(filePath);
}
