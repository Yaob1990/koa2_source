'use strict';

/**
 * Expose compositor.
 */

module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  // 数组
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
  // for of 循环数组，注意不能用for in
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function(context, next) {
    // last called middleware #
    // 为什么下标是-1？
    let index = -1;
    // 执行下面的dispatch 函数
    return dispatch(0);
    function dispatch(i) {
      // 它对比了「“即将执行的中间件”索引」和「“上一次执行的中间件”的索引」，如果后者大，或者相等，就抛出一个错误，告诉调用者，next函数被执行了多次。
      // 避免一个中间件多次调用next
      // const one = (ctx, next) => {
      //   console.log('1-Start');
      //   next();
      //   next();
      //   console.log('1-End');
      // }
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      // 获取中间件
      let fn = middleware[i];
      // 这里已经数组越界了,这里可以不写next，写了获得的值也是undefined,因为这个promise没有后续的执行
      if (i === middleware.length) fn = next;
      // fn 这里应该是undefined，这里返回
      if (!fn) return Promise.resolve();
      try {
        // next = dispatch.bind(null, i + 1)
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
