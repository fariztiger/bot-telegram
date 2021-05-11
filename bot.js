require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;

const linkPostTwiiter = process.env.POST_TWEETER;
const linkChanelTele = process.env.LINK_CHANEL;
const linkGroupTele = process.env.LINK_GROUP;

const IDChanelTele = process.env.ID_CHANEL
const IDGroupTele = process.env.ID_GROUP;

const {
  getInfoMem,
  getUsernameTwiiter,
  createMember,
  updateMember,
  getStepInputCurrent,
  checkUsernameTwiiter,
  getWalletAddress,
  getPointRef,
  STEP_USERNAME,
  STEP_WALLET,
  STEP_CAPTCHA,
  STEP_NONE
} = require('./model');

const listText = require('./listText');

const bot = new TelegramBot(token, {
  polling: true
});

const EVENT_CHECK_MISSION = 'check_mission';
const EVENT_USERNAME = 'username_twitter';
const EVENT_REFRESH_CAPTCHA = 'refresh_captcha';

const keyboards = {
  main: {
    inline_keyboard: [
      [{'text': listText.step1, "url": linkChanelTele}],
      [{'text': listText.step2, "url": linkGroupTele}],
      [{'text': listText.step3, "url": linkPostTwiiter}],
      [{'text': listText.enterUser, 'callback_data': EVENT_USERNAME}],
      [{'text': listText.check, 'callback_data': EVENT_CHECK_MISSION}],
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
  const result = await createMember({...msg.from, ref, captcha: ''});
  if (result === 'done') {
    return bot.sendMessage(msg.chat.id, listText.done(msg.from.id), keyboards.done);
  }
  return bot.sendMessage(msg.chat.id, listText.startStep, {reply_markup: keyboards.main});
})

// validate enter text username and wallet
bot.onText(/\.*/, async (msg) => {
  const step = await getStepInputCurrent(msg.from.id);
  if (step === STEP_NONE) return;
  if (step === STEP_USERNAME) {
    if (msg.text[0] !== "@") {
      return bot.sendMessage(msg.chat.id, listText.validTwiiter);
    }
    const isDuplicate = await checkUsernameTwiiter(msg.text);
    if (isDuplicate) {
      return bot.sendMessage(msg.chat.id, listText.duplicateTw);
    }
    await bot.sendMessage(
      msg.chat.id,
      listText.accTwOk(msg.text),
      {parse_mode: "Markdown"}
    )
    await updateMember(
      msg.from.id,
      {step_input: STEP_NONE, username_twitter: msg.text}
    );
    return;
  }
  if (step === STEP_WALLET) {
    if (!(/^(0x){1}[0-9a-fA-F]{40}$/i.test(msg.text))) {
      return bot.sendMessage(msg.chat.id,listText.validWallet)
    }
    await bot.sendMessage(msg.chat.id, listText.walletOk(msg.text), keyboards.done)
    await updateMember(
      msg.from.id,
      {step_input: STEP_NONE, wallet_address: msg.text}
    );
    return;
  }
});

const checkFollowChanel = async (userId) => {
  try {
    const result = await bot.getChatMember(IDChanelTele, userId);
    if (result.status !== 'kicked' && result.status !== "left") return true;
    return false;
  } catch (error) {
    return false;
  }
}

const checkJoinGr = async (userId) => {
  try {
    const result = await bot.getChatMember(IDGroupTele, userId);
    if (result.status !== 'kicked' && result.status !== "left") return true;
    return false;
  } catch (error) {
    return false;
  }
}

const checkTwiiter = async (userId) => {
  return await getUsernameTwiiter(userId);
}

async function checkStep(userId, msg) {
  const listStepDone = {
    0: await checkFollowChanel(userId),
    1: await checkJoinGr(userId),
    2: await checkTwiiter(userId),
  };

  const tempStep = {
    inline_keyboard: [
      [{'text': listText.step1, "url": linkChanelTele}],
      [{'text': listText.step2, "url": linkGroupTele}],
      [{'text': listText.step3, "url": linkPostTwiiter}],
      [{'text': listText.enterUser, 'callback_data': EVENT_USERNAME}],
      [{'text': listText.check, 'callback_data': EVENT_CHECK_MISSION}],
    ]
  };

  let allDone = 1;
  Object.keys(listStepDone).forEach((step) => {
    if (listStepDone[step]) {
      tempStep.inline_keyboard[step][0].text += ' ✅'
    } else {
      allDone = 0;
      tempStep.inline_keyboard[step][0].text += ' ❌'
    }
  })
  bot.editMessageReplyMarkup(tempStep, {chat_id: msg.chat.id, message_id: msg.message_id})
  return allDone;
}

bot.on("callback_query", async (callbackQuery) => {
  const { id, message, data, from } = callbackQuery;
  if (data === EVENT_CHECK_MISSION) {
    const isDone = await checkStep(from.id, message);
    if (!isDone) {
      return bot.answerCallbackQuery(id, {text: listText.unfinish});
    }
    await updateMember(from.id, {is_done: 1});
    return bot.sendMessage(message.chat.id, listText.done(from.id), keyboards.done);
  }
  if (data === EVENT_USERNAME) {
    bot.sendMessage(message.chat.id, listText.enterTw);
    await updateMember(from.id, {step_input: STEP_USERNAME});
    bot.answerCallbackQuery(id);
    return;
  }
  if (data = EVENT_REFRESH_CAPTCHA) {}
});

// =============== list event keyboard
bot.onText(new RegExp(listText.keyPoint), async (msg) => {
  const listStepDone = {
    0: await checkFollowChanel(msg.from.id),
    1: await checkJoinGr(msg.from.id),
    2: await checkTwiiter(msg.from.id),
  };
  let taskPoint = 0;
  Object.keys(listStepDone).forEach((key) => {
    if (listStepDone[key]) taskPoint+=1;
  })
  const refPoint = await getPointRef(msg.from.id);
  const info = await getInfoMem(msg.from.id);

  const textWl = info.wallet_address.length
    ? `*${info.wallet_address}`
    : `(Not found, click *${listText.keyWallet}* to set your wallet)`
  return bot.sendMessage(
    msg.chat.id,
    `User ID = ${info.id_telegram}
\nTask  Points = ${taskPoint}
Referral Points = ${refPoint}
*Total Points = ${taskPoint+refPoint}*
\nBEP20 (BSC) Address = ${textWl}
Twitter = *${info.username_twitter}*
Referral link = https://t.me/BSCS\\_Reward\\_Bot?start=${info.id_telegram}
ℹ️ For each person you invite and he/she completed tasks, you will get 1 referral point.`,
    {parse_mode: 'Markdown'}
  );
})
bot.onText(new RegExp(listText.keyHelp), async (msg) => {
  return bot.sendMessage(msg.chat.id, listText.desHelp,{parse_mode: 'Markdown'});
})
bot.onText(new RegExp(listText.keyRules), async (msg) => {
    return bot.sendMessage(msg.chat.id, listText.desRules,{parse_mode: 'Markdown'});
})
bot.onText(new RegExp(listText.keyWallet), async (msg) => {
  const wallet = await getWalletAddress(msg.from.id);
  if (!wallet) {
    await bot.sendMessage(msg.chat.id, listText.sendAddress, { parse_mode: 'Markdown'});
    await updateMember(msg.from.id, {step_input: STEP_WALLET});
    return;
  }
  await bot.sendMessage(msg.chat.id, listText.addressWl(wallet), {parse_mode: 'Markdown'});
  await updateMember(msg.from.id, {step_input: STEP_NONE});
})