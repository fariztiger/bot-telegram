const keyWallet = "👛 Wallet";
const keyRules = "📌 Rules";
const check = "Check";
module.exports = {
  step1: "1. Follow Chanel ByteNext Announcement (1 point)",
  step2: "2. Join Group ByteNext Official [ENG] (1 point)",
  step3: "3. Follow, Retweet, Like Twitter ByteNext (1 point)",
  enterUser:  "Bind your twitter account before check for step 3",
  check,
  keyPoint: "🅿️ Points",
  keyWallet,
  keyRules,
  desRules: `Competition on introducing ByteNext community with a reward of up to 2000$ BNU!
To celebrate the breakthrough development of the community, ByteNext launches a campaign on community introduction to thank for the community's support.
Please follow the steps below to get the reward:
\n1) All participants (including those invited by others) have to complete 3 tasks in order to join the campaign.
Those invited by others also have to complete 3 tasks so that inviters can get points.
2) Please connect your Twitter Username to our Bot so that we can confirm your status!
3) Rewards are given based on your points, which means that the more points you get, the more valuable reward you gain.
4) Points that users gained in previous campaigns will be added to ensure equality for everyone.
5) The reward will be sent within one week after the campaign ends. Please stay patient!
\nTime: 3pm UTC, May ..... to June ......
\n(This activity is just related to ByteNext Official [ENG])
\n📢 How to win:
1) Find @BNU_Reward_Bot in Telegram and enter/start to start the bot and follow the guidance;
2) After you connect your #BNU BEP20 (unchangeable) with (@BNU_Reward_Bot), the only introduction link will come out immediately;
3) You can require or invite your friends to join by clicking your only introduction link;
4) Those you invite can get points after completing 3 tasks and they have to active in ByteNext Official [ENG] of ByteNext. Fake or inactive accounts cannot get rewards.
\n⚠️NOTE:
▫️ Every friends are not accepted.
▫️ All participants have to meet the requirement on the number of #BNU cards.
▫️ Those who are invited need to be active in https://t.me/ByteNextOfficial.
▫️ Rewards will be sent within 1 week after the campaign ends.`,
  keyHelp: "📨 Contact",
  desHelp: `All contact information:
Website: https://bytenext.io/
Twitter: https://twitter.com/Bytenextio
Medium: https://bytenext.medium.com/
Telegram Channel: https://t.me/ByteNextAnnouncement
Chat with us: https://t.me/ByteNextOfficial`,
  startStep: `👇 Please complete the following tasks/, click on [${check}] to enter the next step:`,
  validTwiiter: "Invalid twitter account please submit your twitter username with @:",
  duplicateTw: "Twitter account is already in use. Please enter another account!",
  accTwOk: (acc) => {
    return  `*${acc} ✅* \n\nYou have successfully bind your twitter account with BNU Reward Bot.
Press 👆 *${check}* to check completed tasks.`
  },
  validWallet: "Invalid wallet address, please try again:",
  walletOk: (address) => {
    return `*${address} ✅* \n\nYou have successfully bind your wallet address.
You can check again by click keyboard *${keyWallet}*.
See more information or need help, click keyboard *${keyRules}*.`
  },
  done: (id) => {
    return `🎉 Congratulations for completing all the tasks.
\n💵 Set your wallet address to receive rewards at *${keyWallet}*.
\n👥 You can earn points by inviting other users to BNU Reward Bot.
\n👏 For each person you invite, you will get 1 point.
\n⚠️ Only users who have never started BNU Reward Bot before are valid.
\n🔗 Your referral link：https://t.me/BNU\\_Reward\\_Bot?start=${id}`
  },
  enterTw: "If you are done step 3, enter twitter username so we can check it out.\nSend you twitter account starting with @:",
  addressWl: (address) => {
    return `Your wallet BEP20 (BSC) address: *${address}*`;
  },
  sendAddress: `*⚠️ Please enter it correctly as you are only allowed to enter once.
\n👛 Send your BEP20 (BSC) address:*`,
  twNotFollow: "You haven't followed page twitter",
  twNotReTweet: "You haven't retweet post twitter",
  twNotLike: "You haven't like post twitter",
  twNotUser: "You must bind username twitter",
  teleNotFollow: "You haven't follow chanel telegram",
  teleNotJoin: "You haven't join group telegram",
}