const keyWallet = "👛 Wallet";
const keyRules = "📌 Rules";
const check = "Check";
module.exports = {
  step1: "1. Follow Chanel Telegram BNU (1 point)",
  step2: "2. Join Group Telegram BNU (1 point)",
  step3: "3. Follow, Retweet, Like Twitter BNU (1 point)",
  enterUser:  "Bind your twitter account",
  check,
  keyPoint: "🅿️ Points",
  keyWallet,
  keyRules,
  desRules: 'The rule',
  keyHelp: "❓ HELP",
  desHelp: 'The Help',
  startStep: `👇 Please complete the following tasks/, click on [${check}] to enter the next step:`,
  validTwiiter: "Invalid twitter account please submit your twitter username with @:",
  duplicateTw: "Twitter account is already in use. Please enter another account!",
  accTwOk: (acc) => {
    return  `*${acc} ✅* \n\nYou have successfully bind your twitter account with BNU Bot.
Press 👆 *${check}* to check completed tasks.`
  },

  validWallet: "Invalid wallet address, please try againd:",

  walletOk: (address) => {
    return `*${address} ✅* \n\nYou have successfully bind your wallet address.
You can check again by click keyboard *${keyWallet}*.
See more information or need help, click keyboard *${keyRules}*.`
  },

  done: (id) => {
    return `🎉 Congratulations for completing all the tasks.
\n💵 Set your wallet address to receive rewards at *${keyWallet}*.
\n👥 You can earn points by inviting other users to BNU Bot.
\n👏 For each person you invite, you will get 1 point.
\n⚠️ Only users who have never started BNU Bot before are valid.
\n🔗 Your referral link：https://t.me/AbcdTest12345bot?start=${id}`
  },
  enterTw: "If you are done, enter your twitter account username so we can check it out.\nSend you twitter account starting with @:",
  unfinish: "You have unfinished task(s). Please complete task(s) and press Check.",
  addressWl: (address) => {
    return `Your wallet address: *${address}*`;
  },
  sendAddress: `*⚠️ Please enter it correctly as you are only allowed to enter once.
\n👛 Send your BEP20 (BSC) address:*`,
  enterCaptcha: "Please enter the verification code:",
}