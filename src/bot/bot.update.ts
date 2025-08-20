import { Update, Start, Ctx, Hears, On } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { MyContext } from 'src/helpers/sesion';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateUserHTML } from './CVS/html_file';

@Update()
export class BotUpdate {
  private readonly ADMIN_CHAT_ID = (process.env.ADMIN_ID || '')
    .split(',')
    .map((id) => Number(id));
  private readonly FILE_FORMAT = (process.env.FILE_FORMAT || '')
    .split(',')
    .map((format) => format.trim());
  constructor(
    private readonly botService: BotService,
    private readonly prisma: PrismaService,
  ) {}
  @Start()
  async start(@Ctx() ctx: MyContext) {
    if (ctx.from?.id && this.ADMIN_CHAT_ID.includes(ctx.from.id)) {
      ctx.reply(
        `Assalomu alaykum hurmatli admin botga xush kelibsiz`,
        Markup.keyboard([
          ["Foydalanuvchilarni ko'rish"],
          ['Excel file'],
          ['HTML file'],
        ]).resize(),
      );
    } else {
      ctx.reply(
        `Assalomu alaykum hurmatli foydalanuvchi`,
        Markup.keyboard([
          ["Ro'yxatdan o'tish", 'Sozlamalar'],
          ["Mening ma'lumotlarim"],
        ]).resize(),
      );
      ctx.session.formData = {
        tel_1: null,
        tel_2: null,
        addres_doyimiy: null,
        addres_hozir: null,
        username: null,
        fullName: null,
        age: null,
        yonalish: null,
        daraja: null,
        rezumey_link: null,
        portfoly_link: null,
        ish_holati: null,
        till: [],
        universitet: null,
      };
      ctx.session.IsUpdate = {
        telefon_1: null,
        telefon_2: null,
        ish_holati: null,
        daraja: null,
        portfoly: null,
        rezyumey: null,
        home_1: null,
        home_2: null,
        universitet: null,
        yonalish: null,
        age: null,
        ism: null,
        til: null,
        AA: null,
      };
    }
  }
  @Hears('Excel file')
  onAdminAlldata(@Ctx() ctx: MyContext) {
    return this.botService.allUsers(ctx);
  }
  @Hears("Foydalanuvchilarni ko'rish")
  onFoydalanuvchilar(@Ctx() ctx: MyContext) {
    return this.botService.AllUsers(ctx);
  }
  @Hears('HTML file')
  async onHtml(@Ctx() ctx: MyContext) {
    const users = await this.prisma.users.findMany();

    if (!users.length) {
      return ctx.reply("Foydalanuvchilar ro'yxati bo'sh");
    }
    const filePath = await generateUserHTML(users, ctx);
    await ctx.replyWithDocument({ source: filePath, filename: 'users.html' });
  }

  @On('callback_query')
  async onCallbackQuery(ctx: MyContext) {
    if (!(ctx.callbackQuery && 'data' in ctx.callbackQuery)) return;

    const data = ctx.callbackQuery.data;

    if (data.startsWith('users_page_')) {
      const page = Number(data.split('_').pop());
      await this.botService.AllUsers(ctx, page);
      await ctx.answerCbQuery();
    }
  }

  @Hears("Mening ma'lumotlarim")
  onMydata(@Ctx() ctx: MyContext) {
    return this.botService.mydata(ctx);
  }
  @Hears("Ro'yxatdan o'tish")
  async onger(@Ctx() ctx: MyContext) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { chat_id: String(ctx.from?.id) },
      });
      if (user) {
        ctx.reply("Siz avval ro'yxatdan o'tgansiz");
        return;
      }
      ctx.reply(
        "To'liq ism sharifingizni kiriting",
        Markup.keyboard([['Ortga']]).resize(),
      );
      ctx.session.IsData.fullName = 'name';
    } catch (error) {
      console.log(error);
    }
  }
  @Hears('Sozlamalar')
  onSettings(@Ctx() ctx: MyContext) {
    ctx.reply(
      "Bu bo'limda siz ma'lumotlaringizni o'zgartirishingiz mumkin",
      Markup.keyboard([
        ['Telefon', 'Daraja'],
        ['Portfolio', 'Resume'],
        ['Ish holati', "Ta'lim dargoh"],

        ["To'liq ism", "Yo'nalish"],
        ['Doimiy yashash manzil', 'Hozirgi yashash manzil'],
        ['Tillar', 'Yosh'],
        ['Ortga'],
      ]).resize(),
    );
    ctx.session.IsUpdate.AA = 'AAA';
  }
  @Hears('Ortga')
  onOrtga(@Ctx() ctx: MyContext) {
    ctx.reply(
      'Asosiy sahifa',
      Markup.keyboard([
        ["Ro'yxatdan o'tish", 'Sozlamalar'],
        ["Mening ma'lumotlarim"],
      ]).resize(),
    );
  }
  @Hears('Telefon')
  onTelefon(@Ctx() ctx: MyContext) {
    ctx.session.IsUpdate.telefon_1 = 'telefon_1';
    ctx.reply('Yangi telefon raqamingizni kiriting', {
      reply_markup: {
        keyboard: [[{ text: '📲 Raqamni ulashish', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
  @Hears('Ish holati')
  onStatus(@Ctx() ctx: MyContext) {
    ctx.reply(
      'Hozirdagi ish holatingizni tanlang',
      Markup.keyboard([['Ish qidiryapman', 'Bandman']])
        .resize()
        .oneTime(),
    );
    ctx.session.IsUpdate.ish_holati = 'ish_holati';
  }

  @Hears('Daraja')
  onDaraja(@Ctx() ctx: MyContext) {
    ctx.reply(
      'Tajriba darajangizni tanlang',
      Markup.keyboard([
        ['Intern', 'Junior', 'Strong junior'],
        ['Middle', 'Strong middle', 'Senior'],
        ['Boshqa'],
      ])
        .resize()
        .oneTime(),
    );
    ctx.session.IsUpdate.daraja = 'Daraja';
  }
  @Hears('Portfolio')
  onPortfoly(@Ctx() ctx: MyContext) {
    ctx.reply('Yangi portfolio havolasini kiriting');
    ctx.session.IsUpdate.portfoly = 'Portfolio';
  }
  @Hears('Resume')
  onRezyume(@Ctx() ctx: MyContext) {
    ctx.reply('Yangi resume faylini kiriting');
    ctx.session.IsUpdate.rezyumey = 'Resume';
  }

  @Hears('Orqaga')
  onHome(@Ctx() ctx: MyContext) {
    ctx.reply(
      'Asosiy sahifa',
      Markup.keyboard([
        ["Ro'yxatdan o'tish", 'Sozlamalar'],
        ["Mening ma'lumotlarim"],
      ])
        .resize()
        .oneTime(),
    );
  }
  @On('contact')
  onContakt(@Ctx() ctx: MyContext) {
    if (ctx.session.IsUpdate.telefon_1 == 'telefon_1') {
      if (ctx.message && 'contact' in ctx.message) {
        ctx.session.Update.telefon_1 = ctx.message.contact.phone_number;
        ctx.session.IsUpdate.telefon_1 = null;
        ctx.session.IsUpdate.telefon_2 = 'telefon_2';
        ctx.reply("📞 Yangi qo'shimcha telefon raqamingizni kiriting");
      }
      return;
    }

    if (ctx.session.IsData.tel_1 == 'tel_1') {
      if (ctx.message && 'contact' in ctx.message) {
        ctx.session.formData.tel_1 = ctx.message.contact.phone_number;
        ctx.session.IsData.tel_1 = null;
        ctx.session.IsData.tel_2 = 'tel_2';
        ctx.reply(`📞 Qo'shimcha telefon raqamingizni kiriting`);
      }
      return;
    }
  }

  @On('document')
  async onDocument(@Ctx() ctx: MyContext) {
    if (ctx.session.IsData.rezumey_link === 'rezumey_link') {
      if (
        ctx.message &&
        'document' in ctx.message &&
        ctx.message.document &&
        ctx.message.document.file_name
      ) {
        const fileType =
          ctx.message.document.file_name.split('.').pop()?.toLowerCase() || '';

        if (!this.FILE_FORMAT.includes(fileType)) {
          ctx.reply(
            "❌ Resume noto'g'ri formatda kiritildi.\n\nIltimos, faylni PDF yoki DOC/DOCX formatda yuboring.",
          );
          return;
        }
        ctx.session.formData.rezumey_link = ctx.message.document.file_id;
        ctx.session.IsData.rezumey_link = null;
        ctx.session.IsData.portfoly_link = 'portfoly_link';
        ctx.reply('Portfolio havolasini kiriting');
        return;
      }
    }

    if (ctx.session.IsUpdate.rezyumey === 'Resume') {
      if (
        ctx.message &&
        'document' in ctx.message &&
        ctx.message.document &&
        ctx.message.document.file_name
      ) {
        const fileType =
          ctx.message.document.file_name.split('.').pop()?.toLowerCase() || '';
        if (!this.FILE_FORMAT.includes(fileType)) {
          ctx.reply(
            "❌ Resume noto'g'ri formatda kiritildi.\n\nIltimos, faylni PDF yoki DOC/DOCX formatda yuboring.",
          );
          return;
        }
        ctx.session.Update.rezyumey = ctx.message.document.file_id;
        ctx.session.IsUpdate.rezyumey = null;
        return this.botService.update(ctx);
      }
    }
  }

  @On('text')
  async onTest(@Ctx() ctx: MyContext) {
    if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message.text;

      if (ctx.session.IsUpdate.daraja === 'Daraja') {
        if (text === 'Boshqa') {
          ctx.reply("Tajriba darajangizni qo'lda kiriting");
        } else {
          ctx.session.Update.daraja = text;
          ctx.session.IsUpdate.daraja = null;
          return this.botService.update(ctx);
        }
      }
      if (ctx.session.IsUpdate.ish_holati === 'ish_holati') {
        ctx.session.Update.ish_holati = text;
        ctx.session.IsUpdate.ish_holati = null;
        return this.botService.update(ctx);
      }
      if (ctx.session.IsUpdate.portfoly == 'Portfolio') {
        ctx.session.Update.portfoly = text;
        ctx.session.IsUpdate.portfoly = null;
        return this.botService.update(ctx);
      }
    }

    if (ctx.session.IsUpdate.AA == 'AAA') {
      if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text;

        if (text === "Ta'lim dargoh") {
          ctx.reply(
            "O'qigan ta'lim dargohingizni tanlang",
            Markup.keyboard([
              ['Najot talim', 'Mohirdev'],
              ['PDP', 'Boshqa'],
            ])
              .oneTime()
              .resize(),
          );
          ctx.session.IsUpdate.universitet = "Ta'lim dargoh";
          return;
        }
        if (ctx.session.IsUpdate.universitet === "Ta'lim dargoh") {
          if (text == 'Boshqa') {
            ctx.reply("Ta'lim dargoh nomini qo'lda kiriting");
            return;
          }
          ctx.session.Update.universitet = text;
          ctx.session.IsUpdate.universitet = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }
        if (ctx.session.IsUpdate.telefon_2 == 'telefon_2') {
          ctx.session.Update.telefon_2 = text;
          ctx.session.IsUpdate.telefon_2 = null;
          return this.botService.update(ctx);
        }

        if (text === "To'liq ism") {
          ctx.reply("Ism sharifingizni to'liq kiriting");
          ctx.session.IsUpdate.ism = 'ism';
          return;
        }
        if (ctx.session.IsUpdate.ism === 'ism') {
          ctx.session.Update.ism = text;
          ctx.session.IsUpdate.ism = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }
        if (text === "Yo'nalish") {
          ctx.reply(
            "Yo'nalishingizni tanlang",
            Markup.keyboard([
              ['Dasturlash'],
              ['Grafik dizayn'],
              ['Marketing'],
              ['Boshqa'],
            ])
              .resize()
              .oneTime(),
          );
          ctx.session.IsUpdate.yonalish = 'yonalish';
          return;
        }
        if (ctx.session.IsUpdate.yonalish === 'yonalish') {
          if (text === 'Boshqa') {
            ctx.reply("Yo'nalishingizni qo'lda kiriting");
            return;
          }
          ctx.session.Update.yonalish = text;
          ctx.session.IsUpdate.yonalish = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }
        if (text == 'Doimiy yashash manzil') {
          ctx.reply('Doimiy yashash manzilingizni kiriting');
          ctx.session.IsUpdate.home_1 = 'Doyimiy';
          return;
        }
        if (ctx.session.IsUpdate.home_1 === 'Doyimiy') {
          ctx.session.Update.home_1 = text;
          ctx.session.IsUpdate.home_1 = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }

        if (text == 'Hozirgi yashash manzil') {
          ctx.reply('Hozirgi yashash manzilingizni kiriting');
          ctx.session.IsUpdate.home_2 = 'Hozirgi';
          return;
        }
        if (ctx.session.IsUpdate.home_2 === 'Hozirgi') {
          ctx.session.Update.home_2 = text;
          ctx.session.IsUpdate.home_2 = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }
        if (text === 'Yosh') {
          ctx.reply('Yoshingizni kiriting');
          ctx.session.IsUpdate.age = 'Yosh';
          return;
        }
        if (ctx.session.IsUpdate.age === 'Yosh') {
          ctx.session.Update.age = text;
          ctx.session.IsUpdate.age = null;
          ctx.session.IsUpdate.AA = null;
          return this.botService.update(ctx);
        }
        if (text === 'Tillar') {
          ctx.reply(
            "O'zingiz biladigan tillarni tanlang",
            Markup.keyboard([
              ['Ingliz tili', 'Rus tili'],
              ['Nemis tili', 'Yapon tili'],
              ['Kareys tili', 'Xitoy tili'],
              ['Boshqa', 'Keyingi'],
            ]).resize(),
          );
          ctx.session.IsUpdate.til = 'Tillar';
          return;
        }
        if (ctx.session.IsUpdate.til === 'Tillar') {
          if (!ctx.session.Update.til) {
            ctx.session.Update.til = [];
          }
          if (text === 'Boshqa') {
            ctx.reply("Biladigan tilingizni qo'lda kiriting");
            return;
          }
          if (text === 'Keyingi') {
            ctx.session.IsUpdate.til = null;
            ctx.session.IsUpdate.AA = null;
            return this.botService.update(ctx);
          } else if (!ctx.session.Update.til?.includes(text)) {
            ctx.session.Update.til?.push(text);
            ctx.reply(
              `${text} qo'shildi. Yana til tanlashingiz mumkin yoki "Keyingi" tugmasini bosing`,
              Markup.keyboard([
                ['Ingliz tili', 'Rus tili'],
                ['Nemis tili', 'Yapon tili'],
                ['Kareys tili', 'Xitoy tili'],
                ['Boshqa', 'Keyingi'],
              ]).resize(),
            );
            return;
          } else {
            ctx.reply(`${text}ni tanlab bo'lgansiz`);
            return;
          }
        }
      }
    }

    if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message?.text;

      if (ctx.session.IsData.fullName === 'name') {
        ctx.session.formData.fullName = text;
        ctx.session.formData.username = '@' + ctx.from?.username;
        ctx.session.IsData.fullName = null;
        if (text === 'Ortga') {
          ctx.reply(
            'Asosiy sahifa',
            Markup.keyboard([["Ro'yxatdan o'tish", 'Sozlamalar']])
              .resize()
              .oneTime(),
          );
          return;
        }
        ctx.session.IsData.till = 'Tillar';
        ctx.reply(
          "O'zingiz biladigan tillarni tanlang",
          Markup.keyboard([
            ['Ingliz tili', 'Rus tili'],
            ['Nemis tili', 'Yapon tili'],
            ['Kareys tili', 'Xitoy tili'],
            ['Boshqa', 'Keyingi'],
            ['Ortga'],
          ]).resize(),
        );
        return;
      }
      if (ctx.session.IsData.till === 'Tillar') {
        if (text === 'Ortga') {
          ctx.session.IsData.till = null;
          ctx.session.IsData.fullName = 'name';
          ctx.reply(
            "O'zingiz biladigan tillarni tanlang",
            Markup.keyboard([
              ['Ingliz tili', 'Rus tili'],
              ['Nemis tili', 'Yapon tili'],
              ['Kareys tili', 'Xitoy tili'],
              ['Boshqa', 'Keyingi'],
              ['Ortga'],
            ]).resize(),
          );
          return;
        }
        if (text === 'Keyingi') {
          ctx.session.IsData.till = null;
          ctx.reply(
            'Doimiy yashash manzilingizni kiriting',
            Markup.keyboard([['Ortga']]).resize(),
          );
          ctx.session.IsData.addres_doyimiy = 'doyimiy';
          return;
        }
        if (!ctx.session.formData.till) {
          ctx.session.formData.till = [];
        }

        if (text === 'Boshqa') {
          ctx.reply(
            "Biladigan tilingizni qo'lda kiriting",
            Markup.keyboard([['Ortga']]).resize(),
          );
          return;
        }

        if (!ctx.session.formData.till.includes(text)) {
          ctx.session.formData.till.push(text);
          ctx.reply(
            `${text} qo'shildi. Yana til tanlashingiz mumkin yoki "Keyingi" tugmasini bosing`,
            Markup.keyboard([
              ['Ingliz tili', 'Rus tili'],
              ['Nemis tili', 'Yapon tili'],
              ['Kareys tili', 'Xitoy tili'],
              ['Boshqa', 'Keyingi'],
              ['Ortga'],
            ]).resize(),
          );
          return;
        }
        if (text === 'Keyingi') {
          ctx.session.IsData.till = null;
          ctx.reply(
            'Doimiy yashash manzilingizni kiriting',
            Markup.keyboard([['Ortga']]).resize(),
          );
          ctx.session.IsData.addres_doyimiy = 'doyimiy';
          return;
        } else {
          ctx.reply(`⚠️ ${text} allaqachon tanlangan.`);
          return;
        }
      }
      if (ctx.session.IsData.addres_doyimiy === 'doyimiy') {
        ctx.session.formData.addres_doyimiy = text;
        ctx.session.IsData.addres_doyimiy = null;
        if (text === 'Ortga') {
          ctx.session.IsData.till = 'Tillar';
          ctx.reply(
            "O'zingiz biladigan tillarni tanlang",
            Markup.keyboard([
              ['Ingliz tili', 'Rus tili'],
              ['Nemis tili', 'Yapon tili'],
              ['Kareys tili', 'Xitoy tili'],
              ['Boshqa', 'Keyingi'],
              ['Ortga'],
            ]).resize(),
          );
          return;
        }
        ctx.reply(
          'Hozirgi yashash manzilingizni kiriting',
          Markup.keyboard([['Ortga']]).resize(),
        );
        ctx.session.IsData.addres_hozir = 'hozirgi';
        return;
      }
      if (ctx.session.IsData.addres_hozir === 'hozirgi') {
        ctx.session.formData.addres_hozir = text;
        ctx.session.IsData.addres_hozir = null;
        if (text === 'Ortga') {
          ctx.session.IsData.addres_hozir = null;
          ctx.session.IsData.addres_doyimiy = 'doyimiy';
          ctx.reply(
            'Doimiy yashash manzilingizni kiriting',
            Markup.keyboard([['Ortga']]).resize(),
          );
          return;
        }
        ctx.session.IsData.universitet = "Ta'lim dargoh";
        ctx.reply(
          "O'qigan ta'lim dargohingizni tanlang",
          Markup.keyboard([
            ['Najot talim', 'Mohirdev'],
            ['PDP', 'Boshqa'],
            ['Ortga'],
          ])
            .oneTime()
            .resize(),
        );
        return;
      }
      if (ctx.session.IsData.rezumey_link === 'rezumey_link') {
        if (ctx.message && 'text' in ctx.message) {
          if (ctx.message.text === 'Ortga') {
            ctx.session.IsData.rezumey_link = null;
            ctx.session.IsData.ish_holati = 'ish_holati';
            ctx.reply(
              'Hozirdagi ish holatingizni tanlang',
              Markup.keyboard([['Ish qidiryapman', 'Bandman'], ['Ortga']])
                .resize()
                .oneTime(),
            );
            return;
          }
        }
      }
      if (ctx.session.IsData.portfoly_link === 'portfoly_link') {
        if (ctx.message && 'text' in ctx.message) {
          if (ctx.message.text === 'Ortga') {
            ctx.session.IsData.rezumey_link = 'rezumey_link';
            ctx.session.IsData.portfoly_link = null;
            ctx.reply('Resumeni fayl formatda kiriting');
            return;
          } else {
            ctx.session.IsData.portfoly_link = null;
            ctx.session.formData.portfoly_link = ctx.message.text;
            ctx.session.IsData.rezumey_link = null;
            ctx.session.IsData.tel_1 = 'tel_1';
            ctx.reply('📞 Telefon raqamingizni kiriting', {
              reply_markup: {
                keyboard: [
                  [{ text: '📲 Raqamni ulashish', request_contact: true }],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            });
          }
        }
      }
      if (ctx.session.IsData.tel_2 == 'tel_2') {
        ctx.session.formData.tel_2 = text;
        ctx.session.IsData.tel_2 = null;
        ctx.session.IsData.age = 'age';
        ctx.reply('Yoshingizni kiriting');
        return;
      }

      if (ctx.session.IsData.universitet === "Ta'lim dargoh") {
        if (text === 'Ortga') {
          ctx.session.IsData.universitet = null;
          ctx.session.IsData.addres_hozir = 'hozirgi';
          ctx.reply(
            'Hozirgi yashash manzilingizni kiriting',
            Markup.keyboard([['Ortga']]).resize(),
          );
        } else if (text === 'Boshqa') {
          ctx.reply("O'qigan talim dargohingizni qo'lda kiriting");
        } else {
          ctx.session.formData.universitet = text;
          ctx.session.IsData.universitet = null;
          ctx.session.IsData.yonalish = 'yonalish';
          ctx.reply(
            "Yo'nalishingizni tanlang",
            Markup.keyboard([
              ['Dasturlash'],
              ['Grafik dizayn'],
              ['Marketing'],
              ['Boshqa', 'Ortga'],
            ])
              .resize()
              .oneTime(),
          );
        }
        return;
      }
      if (ctx.session.IsData.yonalish === 'yonalish') {
        if (text === 'Ortga') {
          ctx.session.IsData.yonalish = null;
          ctx.session.IsData.universitet = "Ta'lim dargoh";
          ctx.reply(
            "O'qigan ta'lim dargohingizni tanlang",
            Markup.keyboard([
              ['Najot talim', 'Mohirdev'],
              ['PDP', 'Boshqa'],
              ['Ortga'],
            ])
              .oneTime()
              .resize(),
          );
          return;
        }
        if (text === 'Dasturlash') {
          ctx.reply(
            "Yo'nalishingizni tanlang",
            Markup.keyboard([
              ['Frontend', 'Mobile', 'Frontend Angular'],
              ['Backend NodeJS', 'Backend Java', 'Backend Python'],
              ['Backend Golang', 'Backend .Net', 'Full stack'],
              ['Ortga'],
            ])
              .resize()
              .oneTime(),
          );
        } else if (text === 'Boshqa') {
          ctx.reply("Yo'nalishingizni qo'lda kiriting");
        } else if (text !== 'Ortga') {
          ctx.session.formData.yonalish = text;
          ctx.session.IsData.yonalish = null;
          ctx.session.IsData.daraja = 'Daraja';
          ctx.reply(
            'Tajriba darajangizni tanlang',
            Markup.keyboard([
              ['Intern', 'Junior', 'Strong junior'],
              ['Middle', 'Strong middle', 'Senior'],
              ['Boshqa', 'Ortga'],
            ])
              .resize()
              .oneTime(),
          );
        }
        return;
      }

      if (ctx.session.IsData.daraja === 'Daraja') {
        if (text === 'Ortga') {
          ctx.session.IsData.daraja = null;
          ctx.session.IsData.yonalish = 'yonalish';
          ctx.reply(
            "Yo'nalishingizni tanlang",
            Markup.keyboard([
              ['Dasturlash'],
              ['Grafik dizayn'],
              ['Marketing'],
              ['Boshqa', 'Ortga'],
            ])
              .resize()
              .oneTime(),
          );
        } else {
          if (text === 'Boshqa') {
            ctx.reply("Tajriba darajangizni qo'lda kiriting");
            return;
          } else {
            ctx.session.formData.daraja = text;
            ctx.session.IsData.daraja = null;
            ctx.session.IsData.ish_holati = 'ish_holati';
            ctx.reply(
              'Hozirdagi ish holatingizni tanlang',
              Markup.keyboard([['Ish qidiryapman', 'Bandman'], ['Ortga']])
                .resize()
                .oneTime(),
            );
          }
          return;
        }
      }
      if (
        ctx.session.IsUpdate.portfoly === 'Portfolio' ||
        ctx.session.IsUpdate.rezyumey === 'Resume'
      ) {
        ctx.reply(
          "Portfolio yoki resume noto'g'ri formatda kritildi",
          Markup.keyboard([
            ['Telefon', 'Daraja'],
            ['Portfolio', 'Resume'],
            ['Ish holati'],
          ]).resize(),
        );
        return;
      }
      if (ctx.session.IsData.rezumey_link == 'rezumey_link') {
        ctx.reply(
          "Resume noto'g'ri formatda kiritildi. Iltimos resumeni fayl formatda kiriting",
        );
        return;
      }
      if (ctx.session.IsData.portfoly_link == 'portfoly_link') {
        ctx.reply(
          "Portfolio noto'g'ri formatda kiritildi. Iltimos portfolioni faly formatda kiriting",
        );
        return;
      }
      if (ctx.session.IsData.ish_holati === 'ish_holati') {
        if (text === 'Ortga') {
          ctx.reply(
            'Tajriba darajangizni tanlang',
            Markup.keyboard([
              ['Intern', 'Junior', 'Strong junior'],
              ['Middle', 'Strong middle', 'Senior'],
              ['Boshqa', 'Ortga'],
            ])
              .resize()
              .oneTime(),
          );
          ctx.session.IsData.ish_holati = null;
          ctx.session.IsData.daraja = 'Daraja';
        } else {
          ctx.session.formData.ish_holati = text;
          ctx.session.IsData.ish_holati = null;
          ctx.session.IsData.rezumey_link = 'rezumey_link';
          ctx.reply('Resumeni fayl formatda kiriting');
        }
        return;
      }
      if (ctx.session.IsData.age === 'age') {
        ctx.session.formData.age = text;
        ctx.session.IsData.age = null;
        await this.botService.create(ctx);

        const data = ctx.session.formData;
        let message = `<b>Ma'lumotlaringiz muvaffaqiyatli saqlandi ✅</b>\n\n`;

        if (data.fullName)
          message += `👤 <b>To'liq ism:</b> ${data.fullName}\n\n`;
        if (data.age) message += `🎂 <b>Yosh:</b> ${data.age}\n\n`;
        if (data.tel_1) message += `📞 <b>Telefon 1:</b> ${data.tel_1}\n\n`;
        if (data.tel_2) message += `📱 <b>Telefon 2:</b> ${data.tel_2}\n\n`;
        if (data.username)
          message += `🔖 <b>Telegram username:</b>${data.username}\n\n`;
        if (data.addres_doyimiy)
          message += `🏠 <b>Doimiy manzil:</b> ${data.addres_doyimiy}\n\n`;
        if (data.addres_hozir)
          message += `🏡 <b>Hozirgi manzil:</b> ${data.addres_hozir}\n\n`;
        if (data.universitet)
          message += `🎓 <b>Ta'lim dargoh:</b> ${data.universitet}\n\n`;
        if (data.yonalish)
          message += `🛠 <b>Yo'nalish:</b> ${data.yonalish}\n\n`;
        if (data.daraja) message += `🚀 <b>Daraja:</b> ${data.daraja}\n\n`;
        if (data.ish_holati)
          message += `💼 <b>Ish holati:</b> ${data.ish_holati}\n\n`;
        if (data.portfoly_link)
          message += `💼 <b>Portfolio</b> ${data.portfoly_link}\n\n`;
        if (data.till && data.till.length)
          message += `🌐 <b>Tillar:</b> ${data.till.join(', ')}\n\n`;

        await ctx.reply(message, {
          parse_mode: 'HTML',
        });
        if (data.rezumey_link) {
          await ctx.replyWithDocument(data.rezumey_link, {
            caption: '📎 Resume',
          });
        }
        ctx.reply(
          'Orqaga',
          Markup.keyboard([['Orqaga']])
            .resize()
            .oneTime(),
        );
        ctx.session.formData = {
          tel_1: null,
          tel_2: null,
          addres_doyimiy: null,
          addres_hozir: null,
          username: null,
          fullName: null,
          age: null,
          yonalish: null,
          daraja: null,
          rezumey_link: null,
          portfoly_link: null,
          ish_holati: null,
          till: [],
          universitet: null,
        };
        return;
      }
    }
  }
}
