require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const {
  getInfoMem,
  getIDTwitter,
  createMember,
  updateMember,
  getStepInputCurrent,
  checkUniqueTwitter,
  getWalletAddress,
  getPointRef,
  STEP_USERNAME,
  STEP_WALLET,
  STEP_NONE
} = require('./model');

const listText = require('./listText');
const { checkTwitter, getIdByUsername } = require('./twitter');

const token = process.env.TOKEN;
const linkPostTwiiter = process.env.POST_TWEETER;
const linkChanelTele = process.env.LINK_CHANEL;
const linkGroupTele = process.env.LINK_GROUP;

const IDChanelTele = process.env.ID_CHANEL
const IDGroupTele = process.env.ID_GROUP;

const EVENT_CHECK_MISSION = 'check_mission';
const EVENT_USERNAME = 'username_twitter';

const bot = new TelegramBot(token, { polling: true });

const keyboards = {
  main: {
    inline_keyboard: [
      [{ 'text': listText.step1, "url": linkChanelTele }],
      [{ 'text': listText.step2, "url": linkGroupTele }],
      [{ 'text': listText.step3, "url": linkPostTwiiter }],
      [{ 'text': listText.enterUser, 'callback_data': EVENT_USERNAME }],
      [{ 'text': listText.check, 'callback_data': EVENT_CHECK_MISSION }],
    ],
  },
  done: {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [listText.keyPoint, listText.keyWallet],
        [listText.keyRules, listText.keyHelp],
      ]
    },
    parse_mode: "Markdown"
  }
};

bot.onText(/\/start/, async (msg) => {
  if (msg.from.is_bot) {
    return;
  }
  const ref = msg.text.replace("/start", "").trim();
  const result = await createMember({ ...msg.from, ref, captcha: '' });
  if (result === 'done') {
    return bot.sendMessage(msg.chat.id, listText.done(msg.from.id), keyboards.done);
  }
  return bot.sendMessage(msg.chat.id, listText.startStep, { reply_markup: keyboards.main });
})

// validate enter text username and wallet
bot.onText(/\.*/, async (msg) => {
  const step = await getStepInputCurrent(msg.from.id);
  if (step === STEP_NONE) return;
  if (step === STEP_USERNAME) {
    if (msg.text[0] !== "@") {
      return bot.sendMessage(msg.chat.id, listText.validTwiiter);
    }
    const idTw = await getIdByUsername(msg.text.substr(1));
    if (!idTw) return bot.sendMessage(msg.chat.id, listText.notFoundTw);
    const isDuplicate = await checkUniqueTwitter(msg.text);
    if (isDuplicate) return bot.sendMessage(msg.chat.id, listText.duplicateTw);

    await bot.sendMessage(
      msg.chat.id,
      listText.accTwOk(msg.text),
      { parse_mode: "Markdown" }
    )
    await updateMember(
      msg.from.id,
      { step_input: STEP_NONE, username_twitter: msg.text, id_twitter: idTw }
    );
    return;
  }
  if (step === STEP_WALLET) {
    if (!(/^(0x){1}[0-9a-fA-F]{40}$/i.test(msg.text))) {
      return bot.sendMessage(msg.chat.id, listText.validWallet)
    }
    await bot.sendMessage(msg.chat.id, listText.walletOk(msg.text), keyboards.done)
    await updateMember(
      msg.from.id,
      { step_input: STEP_NONE, wallet_address: msg.text }
    );
    return;
  }
});

const checkFollowChanel = async (userId) => {
  try {
    const result = await bot.getChatMember(IDChanelTele, userId);
    if (result.status !== 'kicked' && result.status !== "left") return { status: true, message: '' };
    return { status: false, message: listText.teleNotFollow };
  } catch (error) {
    return { status: false, message: listText.teleNotFollow };
  }
}

const checkJoinGr = async (userId) => {
  try {
    const result = await bot.getChatMember(IDGroupTele, userId);
    if (result.status !== 'kicked' && result.status !== "left") return { status: true, message: '' };
    return { status: false, message: listText.teleNotJoin };
  } catch (error) {
    return { status: false, message: listText.teleNotJoin };
  }
}

const checkStepTwitter = async (userId) => {
  const idTw = await getIDTwitter(userId);
  if (!idTw) return { status: false, message: listText.twNotUser };
  return checkTwitter(idTw);
}

async function checkStep(userId, msg) {
  const listStepDone = {
    0: await checkFollowChanel(userId),
    1: await checkJoinGr(userId)
  };
  if (listStepDone[0].status && listStepDone[1].status) {
    listStepDone[2] = await checkStepTwitter(userId);
  }

  const tempStep = {
    inline_keyboard: [
      [{ 'text': listText.step1, "url": linkChanelTele }],
      [{ 'text': listText.step2, "url": linkGroupTele }],
      [{ 'text': listText.step3, "url": linkPostTwiiter }],
      [{ 'text': listText.enterUser, 'callback_data': EVENT_USERNAME }],
      [{ 'text': listText.check, 'callback_data': EVENT_CHECK_MISSION }],
    ]
  };

  const result = { status: true, message: ''};
  Object.keys(listStepDone).forEach((step) => {
    if (listStepDone[step].status) {
      tempStep.inline_keyboard[step][0].text += ' ✅'
    } else {
      tempStep.inline_keyboard[step][0].text += ' ❌'
      if (result.status) {
        result.status = listStepDone[step].status;
        result.message = listStepDone[step].message;
      }
    }
  })
  bot.editMessageReplyMarkup(tempStep, { chat_id: msg.chat.id, message_id: msg.message_id })
  return result;
}

bot.on("callback_query", async (callbackQuery) => {
  const { id, message, data, from } = callbackQuery;
  const msg = { chat: { id: message.chat.id }, from}
  const info = await findOrCreate(msg);
  if (!info) return;
  if (info.is_done) {
    bot.answerCallbackQuery(id);
    return bot.sendMessage(message.chat.id, listText.done(from.id), keyboards.done);
  }
  if (data === EVENT_CHECK_MISSION) {
    const result = await checkStep(from.id, message);
    if (!result.status) {
      return bot.answerCallbackQuery(id, { text: result.message });
    }
    await updateMember(from.id, { is_done: 1 });
    return bot.sendMessage(message.chat.id, listText.done(from.id), keyboards.done);
  }
  if (data === EVENT_USERNAME) {
    bot.sendMessage(message.chat.id, listText.enterTw);
    await updateMember(from.id, { step_input: STEP_USERNAME });
    bot.answerCallbackQuery(id);
    return;
  }
});

// =============== list event keyboard
bot.onText(new RegExp(listText.keyPoint), async (msg) => {
  const info = await findOrCreate(msg);
  if (!info) return;
  if (info.step_input != STEP_NONE) {
    await updateMember(msg.from.id, { step_input: STEP_NONE });
  }
  const listStepDone = {
    0: await checkFollowChanel(msg.from.id),
    1: await checkJoinGr(msg.from.id),
    // 2: await checkStepTwitter(msg.from.id),
    2: { status: true },
  };
  let taskPoint = 0;
  Object.keys(listStepDone).forEach((key) => {
    if (listStepDone[key].status) taskPoint += 1;
  })
  const refPoint = await getPointRef(msg.from.id);

  const textWl = info.wallet_address
    ? `*${info.wallet_address}*`
    : `(Not found, click *${listText.keyWallet}* to set your wallet)`
  return bot.sendMessage(
    msg.chat.id,
    `User ID = ${info.id_telegram}
\nTask  Points = ${taskPoint}
Referral Points = ${refPoint}
*Total Points = ${taskPoint + refPoint}*
\nBEP20 (BSC) Address = ${textWl}
Twitter = *${info.username_twitter}*
Referral link = https://t.me/BNU\\_Reward\\_Bot?start=${info.id_telegram}
ℹ️ For each person you invite and he/she completed tasks, you will get 1 referral point.`,
    keyboards.done
  );
})
bot.onText(new RegExp(listText.keyHelp), async (msg) => {
  const info = await findOrCreate(msg);
  if (!info) return;
  if (info.step_input != STEP_NONE) {
    await updateMember(msg.from.id, { step_input: STEP_NONE });
  }
  return bot.sendMessage(msg.chat.id, listText.desHelp, keyboards.done);
})
bot.onText(new RegExp(listText.keyRules), async (msg) => {
  const info = await findOrCreate(msg);
  if (!info) return;
  if (info.step_input != STEP_NONE) {
    await updateMember(msg.from.id, { step_input: STEP_NONE });
  }
  return bot.sendMessage(msg.chat.id, listText.desRules, keyboards.done);
})
bot.onText(new RegExp(listText.keyWallet), async (msg) => {
  const info = await findOrCreate(msg);
  if (!info) return;
  const wallet = await getWalletAddress(msg.from.id);
  if (!wallet) {
    await bot.sendMessage(msg.chat.id, listText.sendAddress, { parse_mode: 'Markdown' });
    await updateMember(msg.from.id, { step_input: STEP_WALLET });
    return;
  }
  await bot.sendMessage(msg.chat.id, listText.addressWl(wallet), keyboards.done);
  await updateMember(msg.from.id, { step_input: STEP_NONE });
})

async function findOrCreate(msg) {
  const info = await getInfoMem(msg.from.id);
  if (!info) {
    createMember({ ...msg.from, ref: '', captcha: '' });
    await bot.sendMessage(msg.chat.id, listText.startStep, { reply_markup: keyboards.main });
    return false;
  }
  return info;
}