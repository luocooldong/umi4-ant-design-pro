/**
 * 当执行 “取消请求” 操作时会抛出 Cancel 对象作为异常
 *
 * @class
 * @param {string} [message] The message.
 */
class Cancel {
  message: string;
  constructor(message: string) {
    this.message = message;
  }

  static __CANCEL__ = true;

  toString() {
    return this.message ? `Cancel: ${this.message}` : 'Cancel';
  }
}

export default Cancel;
