title: 手写 Promise
top: true
cover: true
toc: true
mathjax: true
date: 2019-11-28 14:24:42
password:
summary: 简单介绍 promise 的实现。
tags:
- promise
- 手写
categories: javascript
---

如果你还没用过 promise，看一看用一用[阮一峰老师的es6](http://es6.ruanyifeng.com/#docs/promise)。
本 Promise 基于 [Promise/A+规范](https://promisesaplus.com/) 实现，这里是小弟译的 [【译】Promise/A+规范](http://sunxuedong.com/2019/12/03/translate-promise-a-plus-specifications)。
## promise 简介
>1.promise 是有状态的。分别为：pending（等待态）、fulfilled（完成态）和rejected（失败态）。
>2.promise 有 `then` 方法，并且可以根据 promise 的状态相应的调用回调函数。
>3.`then` 方法支持链式调用。

## promise 的状态

1.描述：
    promise 必须是三种状态之一：pending（等待态）、fulfilled（完成态）或 rejected（拒绝态）。通过调用 resolve 函数或 reject 函数来改变 promise 的状态。
``` js
// 最终我们可以这样调用
new Promise2((resolve, reject) => {
    // do something...
    resolve('xxx')
})
```

2.实现：
``` js
class Promise2 {
    constructor (executor) {
        this.state = 'pending'
        const resolve = value => {
            if (this.state !== 'pending') {
                return false
            }
            this.value = value
            this.state = 'fulfilled'
        }
        const reject = reason => {
            if (this.state !== 'pending') {
                return false
            }
            this.reason = reason
            this.state = 'rejected'
        }
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
}
```

## 添加 `then` 方法
1.描述：主要思想就是发布与订阅。说白了就是把回调函数存到数组里，等满足一定条件再遍历执行一遍，下面接着上一步👆的代码写。
``` js
new Promise2((resolve, reject) => {
    setTimeout(resolve.bind(null, 'xxx'))
}).then(val => console.log(val))
```
2.实现：
``` js
class Promise2 {
    constructor (executor) {
        this.state = 'pending'
        // 存放 onResolved 回调函数的数组
        this.onResolvedCallbacks = []
        // 存放 onRejected 回调函数的数组
        this.onRejectedCallbacks = []
        const resolve = value => {
            if (this.state !== 'pending') {
                return false
            }
            this.value = value
            this.state = 'fulfilled'
            // 等状态变成 fulfilled 后，遍历执行回调函数
            this.onResolvedCallbacks.forEach(fn => fn())
        }
        const reject = reason => {
            if (this.state !== 'pending') {
                return false
            }
            this.reason = reason
            this.state = 'rejected'
            // 等状态变成 rejected 后，遍历执行回调函数
            this.onRejectedCallbacks.forEach(fn => fn())
        }
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    then (onFulfilled, onRejected) {
        const state = this.state
        switch (this.state) {
            case 'pending':
                // 如果当前 promise 状态还是 pending，则将回调函数放在对应的数组里
                this.onResolvedCallbacks.push(onFulfilled)
                this.onRejectedCallbacks.push(onRejected)
                break
            case 'fulfilled':
                onFulfilled(this.value)
                break
            case 'rejected':
                onRejected(this.reason)
                break
        }
    }
}
```

## `then` 方法的链式调用

1.描述：使 `then` 方法能够链式调用，首先then方法返回的肯定是一个 promise 对象，如果 `then` 方法的回调函数里返回的也是个 promise 对象，那么最终返回这个 promise 对象 resolve 传入的值或 `then` 方法里 return 的值，举几个例子如：
``` js
new Promise(resolve => resolve())
  .then(() => new Promise(resolve => resolve('xxx')))
  .then(data => console.log(data))
  // xxx
```
如：
``` js
new Promise(resolve => resolve())
  .then(
      () => new Promise(resolve => 
        resolve(new Promise((resolve, reject) => {
          resolve('yyy')
        }))
      )
  )
  .then(data => console.log(data))
  // yyy
```
> 总之，在一顿 promise 瞎乱嵌套时，肯定得返回最后一个 promise resolve 或 reject 的值。

2.实现：
``` js
class Promise2 {
    constructor (executor) {
        this.state = 'pending'
        // 存放 onResolved 回调函数的数组
        this.onResolvedCallbacks = []
        // 存放 onRejected 回调函数的数组
        this.onRejectedCallbacks = []
        const resolve = value => {
            if (this.state !== 'pending') {
                return false
            }
            this.value = value
            this.state = 'fulfilled'
            // 等状态变成 fulfilled 后，遍历执行回调函数
            this.onResolvedCallbacks.forEach(fn => fn())
        }
        const reject = reason => {
            if (this.state !== 'pending') {
                return false
            }
            this.reason = reason
            this.state = 'rejected'
            // 等状态变成 rejected 后，遍历执行回调函数
            this.onRejectedCallbacks.forEach(fn => fn())
        }
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    then (onFulfilled, onRejected) {
        const promise2 = new Promise2 ((resolve, reject) => {
            const state = this.state
            switch (this.state) {
                case 'pending':
                    // 如果当前 promise 状态还是 pending，则将回调函数放在对应的数组里
                    this.onResolvedCallbacks.push(() => {
                      x = onFulfilled(this.value)
                      resolvePromise(promise2, x, resolve, reject)
                    })
                    this.onRejectedCallbacks.push(() => {
                      x = onRejected(this.reason)
                      resolvePromise(promise2, x, resolve, reject)
                    })
                    break
                case 'fulfilled':
                    x = onFulfilled(this.value)
                    resolvePromise(promise2, x, resolve, reject)
                    break
                case 'rejected':
                    x = onRejected(this.reason)
                    resolvePromise(promise2, x, resolve, reject)
                    break
            }
        })
        return promise2
    }
}
/**
 * @func resolvePromise
 * @desc resolvePromise基于Promise/A+递归处理promise嵌套的函数。
 * @desc resolvePromise方法进行递归，如果resolve的值是仍是个promise对象，则递归。
 * @desc 直到resolve是个非promise的值才会停止递归。
 * @param {object} promise2 - then方法返回的根promise对象
 * @param {any} x - then方法回调函数返回的值，分为两类：1.promise对象；2.非promise对象（包括基本数据类型）
 * @param {function} resolve - 闭包引用，then方法中声明promise2时传入的resolve
 * @param {function} reject - 闭包引用，then方法中声明promise2时传入的reject
 */
function resolvePromise (promise2, x, resolve, reject) {
  if(x === promise2){
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  let called
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') { 
        then.call(x, y => {
          if (called) return false
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
```























