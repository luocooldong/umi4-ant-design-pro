'use strict';
import Cancel from './cancel';

/**
 * 通过 CancelToken 来取消请求操作
 *
 * @class
 * @param {Function} executor The executor function.
 */
class CancelToken {
  promise: any;
  constructor(executor: any) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise: any;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    let token: any = this;
    executor(function cancel(message: any) {
      if (token.reason) {
        // 取消操作已被调用过
        return;
      }

      token.reason = new Cancel(message);
      resolvePromise(token.reason);
    });
  }

  throwIfRequested() {
    let token: any = this;
    if (token.reason) {
      throw token.reason;
    }
  }

  static source() {
    var cancel;
    var token = new CancelToken(function executor(c: any) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel,
    };
  }
}

export default CancelToken;
