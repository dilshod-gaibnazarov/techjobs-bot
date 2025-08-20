import * as fs from 'fs';
import { join } from 'path';
import { MyContext } from 'src/helpers/sesion';

export async function fileURL(fileid: string, ctx: MyContext) {
  const file = await ctx.telegram.getFile(fileid);
  return `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
}

export async function generateUserHTML(users: any[], ctx: MyContext) {
  const rows = await Promise.all(
    users.map(async (item) => {
      const resumeUrl = item.rezumey_link
        ? await fileURL(item.rezumey_link, ctx)
        : null;

      return `
        <tr>
          <td>${item.id}</td>
          <td>${item.chat_id}</td>
          <td>${item.fullName}</td>
          <td>${item.age ?? '-'}</td>
          <td>${item.tel_1}</td>
          <td>${item.tel_2 ?? '-'}</td>
          <td>${item.username}</td>
          <td>${item.addres_doyimiy}</td>
          <td>${item.addres_hozir}</td>
          <td>${item.universitet}</td>
          <td>${item.yonalish}</td>
          <td>${item.daraja}</td>
          <td>${item.ish_holati}</td>
          <td class="till">
            ${Array.isArray(item.till) ? item.till.join(', ') : (item.till ?? '-')}
          </td>
          <td>
            ${item.portfoly_link ? `<a href="${item.portfoly_link?.startsWith('http') ? item.portfoly_link : `https://t.me/${item.portfoly_link}`}" target="_blank">Portfolio</a>` : '-'}
          </td>
          <td>
            ${resumeUrl ? `<a href="${resumeUrl}" target="_blank">Resume</a>` : '-'}
          </td>
        </tr>
      `;
    }),
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <link rel="icon" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSMrpcMKUuEB1NpeWP4wrfXNvs2ovEPuQVGQ&s"/>
        <title>Foydalanuvchilar</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { 
            max-width: 100%; 
            overflow-x: auto; 
            border: 1px solid #ccc; 
            border-radius: 8px;
            padding: 15px;
            background: #fff;
          }
          .till {
            min-width: 200px;
          }
          table { border-collapse: collapse; width: 100%; min-width: 1200px; }
          th, td { border: 1px solid #ddd; padding:20px; text-align: left; }
          th { background-color: #f2f2f2; white-space: nowrap; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          a { color: blue; text-decoration: underline; }
        </style>
      </head>
      <body>
        <h2>Foydalanuvchilar ro'yxati</h2>
        <div class="container">
          <table>
            <tr>
              <th>ID</th>
              <th>Telegram ID</th>
              <th>F.I.SH</th>
              <th>Yosh</th>
              <th>Telefon 1</th>
              <th>Telefon 2</th>
              <th>Telegram username</th>
              <th>Doimiy manzil</th>
              <th>Hozirgi manzil</th>
              <th>Ta'lim dargoh</th>
              <th>Yo'nalish</th>
              <th>Daraja</th>
              <th>Ish holati</th>
              <th class="till">Tillar</th>
              <th>Portfolio</th>
              <th>Resume</th>
            </tr>
            ${rows.join('')}
          </table>
        </div>
      </body>
    </html>
  `;

  const dirPath = join(process.cwd(), 'public');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = join(dirPath, 'users.html');
  fs.writeFileSync(filePath, html, 'utf8');

  return filePath;
}
