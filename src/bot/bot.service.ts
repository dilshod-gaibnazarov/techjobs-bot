import { Injectable } from '@nestjs/common';
import { MyContext } from 'src/helpers/sesion';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendUsersCSV } from './CVS';
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Markup } from 'telegraf';

@Injectable()
export class BotService {
  constructor(private readonly prisma: PrismaService) {}
  async create(ctx: MyContext) {
    const {
      tel_1,
      tel_2,
      addres_doyimiy,
      addres_hozir,
      username,
      fullName,
      age,
      yonalish,
      daraja,
      rezumey_link,
      portfoly_link,
      ish_holati,
      till,
      universitet,
    } = ctx.session.formData;
    const chat_id = String(ctx.from?.id);

    if (
      tel_1 &&
      tel_2 &&
      addres_doyimiy &&
      addres_hozir &&
      username &&
      fullName &&
      age &&
      yonalish &&
      daraja &&
      rezumey_link &&
      portfoly_link &&
      ish_holati &&
      till &&
      universitet &&
      chat_id
    ) {
      try {
        await this.prisma.users.create({
          data: {
            tel_1,
            tel_2,
            addres_doyimiy,
            addres_hozir,
            username,
            fullName,
            age,
            yonalish,
            daraja,
            rezumey_link,
            portfoly_link,
            ish_holati,
            till,
            universitet,
            chat_id,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
  async update(ctx: MyContext) {
    const {
      telefon_1,
      telefon_2,
      daraja,
      portfoly,
      rezyumey,
      ish_holati,
      home_1,
      home_2,
      yonalish,
      til,
      age,
      universitet,
      ism,
    } = ctx.session.Update;
    const chat_id = String(ctx.from?.id);

    if (
      telefon_1 ||
      telefon_2 ||
      daraja ||
      portfoly ||
      rezyumey ||
      ish_holati ||
      home_1 ||
      home_2 ||
      yonalish ||
      til ||
      age ||
      universitet ||
      ism
    ) {
      try {
        const user = await this.prisma.users.findUnique({ where: { chat_id } });

        if (!user) {
          ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
          return;
        }
        const data = await this.prisma.users.update({
          where: { chat_id: chat_id },
          data: {
            ...(telefon_1 && { tel_1: telefon_1 }),
            ...(telefon_2 && { tel_2: telefon_2 }),
            ...(daraja && { daraja }),
            ...(portfoly && { portfoly_link: portfoly }),
            ...(rezyumey && { rezyumey_link: rezyumey }),
            ...(ish_holati && { ish_holati: ish_holati }),
            ...(home_1 && { addres_doyimiy: home_1 }),
            ...(home_2 && { addres_hozir: home_2 }),
            ...(yonalish && { yonalish: yonalish }),
            ...(age && { age: age }),
            ...(til && { till: til }),
            ...(universitet && { universitet: universitet }),
            ...(ism && { fullName: ism }),
          },
        });
        ctx.reply(
          "Ma'lumotlar muvaffaqiyatli yangilandi ✅",
          Markup.keyboard([
            ["Ro'yxatdan o'tish", 'Sozlamalar'],
            ["Mening ma'lumotlarim"],
          ])
            .resize()
            .oneTime(),
        );
        ctx.session.Update = {
          telefon_1: null,
          telefon_2: null,
          daraja: null,
          portfoly: null,
          rezyumey: null,
          ish_holati: null,
          home_1: null,
          home_2: null,
          yonalish: null,
          til: [],
          age: null,
          universitet: null,
          ism: null,
        };
      } catch (error) {
        console.log(error);
      }
    }
  }

  async mydata(ctx: MyContext) {
    const chat_id = String(ctx.from?.id);
    try {
      const mydata = await this.prisma.users.findUnique({ where: { chat_id } });
      if (!mydata) {
        await ctx.reply("Sizning ma'lumotlaringiz topilmadi");
        return;
      }

      const info = `
👤 To'liq ism: ${mydata.fullName || "Ko'rsatilmagan"}\n
🎓 Ta'lim dargoh: ${mydata.universitet || "Ko'rsatilmagan"}\n
📚 Yo'nalish: ${mydata.yonalish || "Ko'rsatilmagan"}\n
💼 Daraja: ${mydata.daraja || "Ko'rsatilmagan"}\n
📞 Telefon 1: ${mydata.tel_1 || "Ko'rsatilmagan"}\n
📞 Telefon 2: ${mydata.tel_2 || "Ko'rsatilmagan"}\n
🌐 Tillar: ${Array.isArray(mydata.till) ? mydata.till.join(', ') : "Ko'rsatilmagan"}\n
🏠 Doimiy manzil: ${mydata.addres_doyimiy || "Ko'rsatilmagan"}\n
🏢 Hozirgi manzil: ${mydata.addres_hozir || "Ko'rsatilmagan"}\n
⚙️ Ish holati: ${mydata.ish_holati || "Ko'rsatilmagan"}\n
💼 Portfolio ${mydata.portfoly_link || "Ko'rsatilmagan"}\n
🎂 Yosh: ${mydata.age || "Ko'rsatilmagan"}\n
`;

      await ctx.reply(info);
      await ctx.replyWithDocument(mydata.rezumey_link, {
        caption: '📎 Resume',
      });
    } catch (error) {
      console.error(error);
    }
  }

  async allUsers(ctx: MyContext) {
    try {
      const data = await this.prisma.users.findMany();
      if (!data.length) {
        ctx.reply("Ma'lumotlar topilmadi");
        return;
      }
      sendUsersCSV(ctx, data);
    } catch (error) {}
  }
  async AllUsers(ctx: MyContext, page = 1) {
    try {
      const pageSize = 2;
      const skip = (page - 1) * pageSize;

      const users = await this.prisma.users.findMany({
        skip,
        take: pageSize,
      });

      if (!users.length) {
        await ctx.reply('Ma’lumotlar topilmadi');
        return;
      }

      for (const mydata of users) {
        let message = `📋 <b>Foydalanuvchi ma’lumotlari:</b>\n\n`;
        message += `👤 <b>To'liq ism:</b> ${mydata.fullName || "Ko'rsatilmagan"}\n`;
        message += `🎓 <b>Ta'lim dargoh:</b> ${mydata.universitet || "Ko'rsatilmagan"}\n`;
        message += `📚 <b>Yo'nalish:</b> ${mydata.yonalish || "Ko'rsatilmagan"}\n`;
        message += `💼 <b>Daraja:</b> ${mydata.daraja || "Ko'rsatilmagan"}\n`;
        message += `📞 <b>Telefon 1:</b> ${mydata.tel_1 || "Ko'rsatilmagan"}\n`;
        message += `📞 <b>Telefon 2:</b> ${mydata.tel_2 || "Ko'rsatilmagan"}\n`;
        message += `🌐 <b>Tillar:</b> ${Array.isArray(mydata.till.length) ? mydata.till.join(', ') : "Ko'rsatilmagan"}\n`;
        message += `🏠 <b>Doimiy manzil:</b> ${mydata.addres_doyimiy || "Ko'rsatilmagan"}\n`;
        message += `🏢 <b>Hozirgi manzil:</b> ${mydata.addres_hozir || "Ko'rsatilmagan"}\n`;
        message += ` 💼<b>Portfolio havolasi</b> ${mydata.portfoly_link || "Ko'rsatilmagan"}\n`;
        message += `⚙️ <b>Ish holati:</b> ${mydata.ish_holati || "Ko'rsatilmagan"}\n`;
        message += `🎂 <b>Yosh:</b> ${mydata.age || "Ko'rsatilmagan"}\n`;
        await ctx.reply(message, { parse_mode: 'HTML' });

        if (mydata.rezumey_link) {
          await ctx.replyWithDocument(mydata.rezumey_link, {
            caption: '📎 Resume',
          });
        }

        await ctx.reply('-----------------------------------');
      }

      const keyboard: InlineKeyboardButton[] = [];
      if (page > 1) {
        keyboard.push({
          text: '⬅️ Oldingi',
          callback_data: `users_page_${page - 1}`,
        });
      }
      if (users.length === pageSize) {
        keyboard.push({
          text: 'Keyingi ➡️',
          callback_data: `users_page_${page + 1}`,
        });
      }

      if (keyboard.length) {
        await ctx.reply(`Sahifa: ${page}`, {
          reply_markup: {
            inline_keyboard: [keyboard],
          },
        });
      }
    } catch (error) {
      console.error(error);
      await ctx.reply('Xatolik yuz berdi');
    }
  }
}
