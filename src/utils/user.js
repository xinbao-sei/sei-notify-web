import { utils } from 'suid';

const { sessionStorage, localStorage } = utils.storage;
const { CONST_GLOBAL } = utils.constants;
const { CURRENT_USER, TOKEN_KEY, CURRENT_LOCALE, AUTH, POLICY, } = CONST_GLOBAL;

/** 用户信息保存到session */
export const setCurrentUser = user => {
  sessionStorage.set(CURRENT_USER, user);
};

/** 获取当前用户信息 */
export const getCurrentUser = () => sessionStorage.get(CURRENT_USER);

export const getCurrentLocale = () => window.top.__portal__ ? localStorage.get(CURRENT_LOCALE) : window.localStorage.getItem(CURRENT_LOCALE);

export const setCurrentAuth = auths => sessionStorage.set(AUTH, auths);
export const setCurrentPolicy = policy => sessionStorage.set(POLICY, policy);

export const setCurrentLocale = locale => {
  localStorage.set(CURRENT_LOCALE, locale);
};

/** sid保存到session */
export const setSessionId = sid => {
  sessionStorage.set(TOKEN_KEY, sid);
};

/** 获取当前sid */
export const getSessionId = () => sessionStorage.get(TOKEN_KEY);

/** 根据键清空 */
export const clearUserInfo = () => sessionStorage.clear([CURRENT_USER, TOKEN_KEY]);
