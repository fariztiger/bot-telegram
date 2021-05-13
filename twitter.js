require('dotenv').config();
const listText = require('./listText');

const { TwitterApi } = require('twitter-api-v2');

const tw = new TwitterApi(process.env.TW_BEARER_TOKEN);
const roClient = tw.readOnly;

const idPage = process.env.TW_ID_PAGE
const idPost = process.env.TW_ID_POST

async function getIdByUsername(usernameCheck) {
  try {
    const user = await roClient.v2.userByUsername(usernameCheck);
    return user.data.id;
  } catch (error) {
    return false;
  }
}

async function checkTwitter(userId) {
  const check = {
    isFollowed: 0,
    isReTweet: 0,
    isLiked: 0
  }

  try {
    const [retws, followers, listLikes] = await Promise.all([
      roClient.v1.get(`statuses/retweets/${idPost}.json`),
      roClient.v1.get('followers/ids.json', { user_id: idPage, stringify_ids: true }),
      roClient.v1.get('favorites/list.json', { user_id: userId })
    ]);

    // check follow
    for (let index = 0; index < followers.ids.length; index++) {
      if (followers.ids[index] == userId) {
        check.isFollowed = 1
        break;
      }
    }
    if (!check.isFollowed) return { status: false, message: listText.twNotFollow }

    // // check retweet
    for (let index = 0; index < retws.length; index++) {
      if (retws[index].user.id_str == userId) {
        check.isReTweet = 1;
        break;
      }
    }
    if (!check.isReTweet) return { status: false, message: listText.twNotReTweet }

    // // check like
    for (let index = 0; index < listLikes.length; index++) {
      if (listLikes[index].id_str == idPost) {
        check.isLiked = 1
        break;
      }
    }
    if (!check.isLiked) return { status: false, message: listText.twNotLike }
    return { status: true, message: 'Done mission' }
  } catch (error) {
    console.log('Error Telegram: ', error.message);
    return { status: false, message: 'Something errors' }
  }
}

module.exports = {
  getIdByUsername,
  checkTwitter
}