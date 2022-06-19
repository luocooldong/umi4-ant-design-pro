// 前后缀拦截
const addfix = (url: any, options: any = {}) => {
  const { prefix, suffix } = options;
  if (prefix) {
    url = `${prefix}${url}`;
  }
  if (suffix) {
    url = `${url}${suffix}`;
  }
  return {
    url,
    options,
  };
};

export default addfix;
