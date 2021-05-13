require('dotenv').config();
const listText = require('./listText');

const { TwitterClient } = require('twitter-api-client');
const { TwitterApi } = require('twitter-api-v2');

const tw = new TwitterApi(process.env.TW_BEARER_TOKEN);
const roClient = tw.readOnly;

const twitterClient = new TwitterClient({
  apiKey: process.env.TW_KEY,
  apiSecret: process.env.TW_SECRET,
  accessToken: process.env.TW_ACCESS_TOKEN,
  accessTokenSecret: process.env.TW_SECRET_ACCESS,
  disableCache: true,
  ttl: 120,
});

const idPage = process.env.TW_ID_PAGE
const idPost = process.env.TW_ID_POST

async function checkTwitter(usernameCheck) {
  const check = {
    isFollowed: 0,
    isReTweet: 0,
    isLiked: 0
  }

  try {
    const user = await roClient.v2.userByUsername(usernameCheck);
    const [retws, followers, listLikes ] = await Promise.all([
      twitterClient.tweets.statusesRetweetsById({ id: idPost }),
      twitterClient.accountsAndUsers.followersIds({user_id: idPage, stringify_ids: true}),
      twitterClient.tweets.favoritesList({screen_name: usernameCheck})
    ]);

    // check follow
    for (let index = 0; index < followers.ids.length; index++) {
      if (followers.ids[index] == user.data.id) {
        check.isFollowed = 1
        break;
      }
    }
    if (!check.isFollowed) return { status: false, message: listText.twNotFollow}

    // check retweet
    for (let index = 0; index < retws.length; index++) {
      if (retws[index].user.id_str == user.data.id) {
        check.isReTweet = 1;
        break;
      }
    }
    if (!check.isReTweet) return { status: false, message: listText.twNotReTweet}

    // check like
    for (let index = 0; index < listLikes.length; index++) {
      if (listLikes[index].id_str == idPost) {
        check.isLiked = 1
        break;
      }
    }
    if (!check.isLiked) return { status: false, message: listText.twNotLike}
    return { status: true, message: 'Done mission'}
  } catch (error) {
    console.log('Error Telegram: ', error);
    const message = error && error.code && error.code == 404
      ? 'Not found user, please bind again username twiiter'
      : 'Something errors' 
    return { status: false, message }
  }
}
module.exports = checkTwitter;