const knex = require('knex')(exportConfig());
function exportConfig() {
  return require('./knexfile')
}

const STEP_NONE = 0;
const STEP_USERNAME = 1;
const STEP_WALLET = 2;
const STEP_CAPTCHA = 3;

module.exports = {
  getInfoMem,
  createMember,
  getUsernameTwiiter,
  updateMember,
  getStepInputCurrent,
  checkUsernameTwiiter,
  getWalletAddress,
  getPointRef,
  STEP_USERNAME,
  STEP_WALLET,
  STEP_CAPTCHA,
  STEP_NONE
}

async function getInfoMem(id) {
  return knex.select()
    .from('members')
    .where('id_telegram', id)
    .first();
}

async function createMember(params) {
  const member = await knex.select()
    .from('members')
    .where('id_telegram', params.id)
    .first();
  if (member && member.is_done) {
    return 'done';
  }
  if (member) {
    return 'old';
  }
  return knex('members').insert({
    id_telegram: params.id,
    username_telegram: params.username,
    first_name: params.first_name,
    last_name: params.last_name,
    ref: params.ref,
    captcha: params.captcha
  })
}

async function updateMember(memId, obj) {
  return knex('members')
      .where('id_telegram', memId)
      .update(obj)
}

async function getStepInputCurrent(memId) {
  const member = await knex('members').select()
      .where('id_telegram', memId)
      .first();
  if (member) return member.step_input;
  return false;
}

async function getUsernameTwiiter(memId) {
  const member = await knex.select()
    .from('members')
    .where('id_telegram', memId)
    .first();
  if (member && member.username_twitter) return member.username_twitter;
  return false;
}

async function getWalletAddress(memId) {
  const member = await knex.select()
    .from('members')
    .where('id_telegram', memId)
    .first();
  if (member && member.wallet_address) return member.wallet_address;
  return false;
}

async function checkUsernameTwiiter(username) {
  const member = await knex.select()
    .from('members')
    .where('username_twitter', username)
    .first();
  return member;
}

async function getPointRef(userId) {
  const result = await knex.count('id as number')
    .from('members')
    .where('ref', userId)
    .andWhere('is_done', 1)
    .first();
  return result.number;
}