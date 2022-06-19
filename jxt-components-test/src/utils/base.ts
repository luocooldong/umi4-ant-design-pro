
//@ts-nocheck
interface URL {
  [key: string]:
    | string
    | {
        [key: string]: string;
      };
  SAAS_API: string;
  NET_API: string;
  BA_API: string;
  ZST_API: string;
  USER_API: string;
  CLASS_HOURS_API: string;
  KAOSHI_API: string;
  JXEDT_PAY_API: string;
  ROBOT_API: string;
  WECHAT_CONFIG: {
    SCH_APPID: string;
    COACH_APPID: string;
  };
}

// const ONLINE_BASE_URL: URL = {
//     SAAS_API: '//saas.jxedt.com',
//     NET_API: '//jxtapi.jxedt.com',
//     USER_API: '//user.jxedt.com',
//     ZST_API: '//zstapp.jxedt.com'
// }
//
// const DEV_BASE_URL: URL = {
//     SAAS_API: '//jxedtsaas.58v5.cn',
//     NET_API: '//jiacloudplatformapitest.58v5.cn',
//     USER_API: '//user.jxedt.com',
//     ZST_API: '//test.mp.zst.58v5.cn'
// }

const BASE_URL: URL = {
    SAAS_API: '//saas.jxedt.com',
    NET_API: '//jxtapi.jxedt.com',
    USER_API: '//user.jxedt.com',
    ZST_API: '//zstapp.jxedt.com',
    CLASS_HOURS_API: '//jxedt-timing.jxedt.com',
    KAOSHI_API: '//kaoshiapi.jxedt.com',
    JXEDT_PAY_API: '//jxedtpay.58.com',
    WECHAT_CONFIG: {
        SCH_APPID: process.env.UMI_ENV === 'production' ? 'wx042daef372348d7a' : 'wxcaea6ea225e8783b',
        COACH_APPID: process.env.UMI_ENV === 'production' ? 'wxabfe85d9135afeb9' : 'wxcaea6ea225e8783b'
    }
}
// const BASE_URL: URL = {
//   SAAS_API: process.env.UMI_ENV === 'production' ? '//saas.jxedt.com' : '//jxedtsaas.58v5.cn',
//   // SAAS_API: process.env.UMI_ENV === 'production' ? '//saas.jxedt.com' : process.env.UMI_ENV === 'test' ? '//jxedtsaas.58v5.cn' : '//jxedtsaas.58v5.cn',
//   //获取配置是否开启计时权限
//   BA_API: process.env.UMI_ENV == 'production' ? '//jxtguns.58v5.cn' : '//jxt-manage.58v5.cn',
//   NET_API:
//     process.env.UMI_ENV === 'production'
//       ? '//jxtapi.jxedt.com'
//       : '//jiacloudplatformapitest.58v5.cn',
//   USER_API: '//user.jxedt.com',
//   ZST_API: process.env.UMI_ENV === 'production' ? '//zstapp.jxedt.com' : '//test.mp.zst.58v5.cn',
//   CLASS_HOURS_API:
//     process.env.UMI_ENV === 'production' ? '//jxedt-timing.jxedt.com' : '//jxedt-timing.58v5.cn',
//   KAOSHI_API:
//     process.env.UMI_ENV === 'production' ? '//kaoshiapi.jxedt.com' : '//kaoshijxedttest.58v5.cn',
//   JXEDT_PAY_API:
//     process.env.UMI_ENV === 'production' ? '//jxedtpay.58.com' : '//jxedtpaytest.58v5.cn',
//   WECHAT_CONFIG: {
//     SCH_APPID: process.env.UMI_ENV === 'production' ? 'wx042daef372348d7a' : 'wxcaea6ea225e8783b',
//     COACH_APPID: process.env.UMI_ENV === 'production' ? 'wxabfe85d9135afeb9' : 'wxcaea6ea225e8783b',
//   },
//   ROBOT_API: process.env.UMI_ENV === 'production' ? '//kaoshiapi.jxedt.com' : '//kaoshijxedttest.58v5.cn', // 机器人域名
//   NODE_ENV: process.env.UMI_ENV === 'production' ? 'online' : 'qa',
// };

// export default process.env.UMI_ENV === 'production' ? ONLINE_BASE_URL : DEV_BASE_URL
export default BASE_URL;
