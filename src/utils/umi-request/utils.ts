/**
 * 实现一个简单的Map cache, 稍后可以挪到 utils中, 提供session local map三种前端cache方式.
 *
 * 1. 可直接存储对象 2. 内存无5M限制 3.缺点是刷新就没了, 看反馈后期完善.
 */
import { parse, stringify } from 'qs';

export class MapCache {
  cache: any;
  timer: any;
  maxCache: any;
  constructor(options: any) {
    this.cache = new Map();
    this.timer = {};
    this.extendOptions(options);
  }

  extendOptions(options: any) {
    this.maxCache = options.maxCache || 0;
  }

  get(key: any) {
    return this.cache.get(JSON.stringify(key));
  }

  set(key: any, value: any, ttl = 60000) {
    // 如果超过最大缓存数, 删除头部的第一个缓存.
    if (this.maxCache > 0 && this.cache.size >= this.maxCache) {
      const deleteKey = [...this.cache.keys()][0];
      this.cache.delete(deleteKey);
      if (this.timer[deleteKey]) {
        clearTimeout(this.timer[deleteKey]);
      }
    }
    const cacheKey = JSON.stringify(key);
    this.cache.set(cacheKey, value);
    if (ttl > 0) {
      this.timer[cacheKey] = setTimeout(() => {
        this.cache.delete(cacheKey);
        delete this.timer[cacheKey];
      }, ttl);
    }
  }

  delete(key: any) {
    const cacheKey = JSON.stringify(key);
    delete this.timer[cacheKey];
    return this.cache.delete(cacheKey);
  }

  clear() {
    this.timer = {};
    return this.cache.clear();
  }
}

/** 请求异常 */
export class RequestError extends Error {
  request: any;
  type: any;
  constructor(text: any, request: any, type = 'RequestError') {
    super(text);
    this.name = 'RequestError';
    this.request = request;
    this.type = type;
  }
}

/** 响应异常 */
export class ResponseError extends Error {
  data: any;
  response: any;
  request: any;
  type: any;
  constructor(response: any, text: any, data: any, request: any, type = 'ResponseError') {
    super(text || response.statusText);
    this.name = 'ResponseError';
    this.data = data;
    this.response = response;
    this.request = request;
    this.type = type;
  }
}

/** http://gitlab.alipay-inc.com/KBSJ/gxt/blob/release_gxt_S8928905_20180531/src/util/request.js#L63 支持gbk */
export function readerGBK(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file, 'GBK'); // setup GBK decoding
  });
}

/** 安全的JSON.parse */
export function safeJsonParse(
  data: any,
  throwErrIfParseFail = false,
  response = null,
  request = null,
) {
  try {
    return JSON.parse(data);
  } catch (e) {
    if (throwErrIfParseFail) {
      throw new ResponseError(response, 'JSON.parse fail', data, request, 'ParseError');
    }
  } // eslint-disable-line no-empty
  return data;
}

export function timeout2Throw(msec: any, timeoutMessage: any, request: any) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new RequestError(timeoutMessage || `timeout of ${msec}ms exceeded`, request, 'Timeout'),
      );
    }, msec);
  });
}

// If request options contain 'cancelToken', reject request when token has been canceled
export function cancel2Throw(opt: any) {
  return new Promise((_, reject) => {
    if (opt.cancelToken) {
      opt.cancelToken.promise.then((cancel: any) => {
        reject(cancel);
      });
    }
  });
}

const toString = Object.prototype.toString;

// Check env is browser or node
export function getEnv() {
  let env;
  // Only Node.JS has a process variable that is of [[Class]] process
  if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    env = 'NODE';
  }
  if (typeof XMLHttpRequest !== 'undefined') {
    env = 'BROWSER';
  }
  return env;
}

export function isArray(val: any) {
  return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]';
}

export function isURLSearchParams(val: any) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

export function isDate(val: any) {
  return typeof val === 'object' && Object.prototype.toString.call(val) === '[object Date]';
}

export function isObject(val: any) {
  return val !== null && typeof val === 'object';
}

export function forEach2ObjArr(target: any, callback: any) {
  if (!target) return;

  if (typeof target !== 'object') {
    target = [target];
  }

  if (isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      callback.call(null, target[i], i, target);
    }
  } else {
    for (let key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        callback.call(null, target[key], key, target);
      }
    }
  }
}

export function getParamObject(val: any) {
  if (isURLSearchParams(val)) {
    return parse(val.toString(), { strictNullHandling: true });
  }
  if (typeof val === 'string') {
    return [val];
  }
  return val;
}

export function reqStringify(val: any) {
  return stringify(val, { arrayFormat: 'repeat', strictNullHandling: true });
}

export function mergeRequestOptions(options: any, options2Merge: any) {
  return {
    ...options,
    ...options2Merge,
    headers: {
      ...options.headers,
      ...options2Merge.headers,
    },
    params: {
      ...getParamObject(options.params),
      ...getParamObject(options2Merge.params),
    },
    method: (options2Merge.method || options.method || 'get').toLowerCase(),
  };
}
