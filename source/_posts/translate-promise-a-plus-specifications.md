---
title: 【译】Promise/A+规范
top: true
cover: true
toc: true
mathjax: true
date: 2019-12-03 13:46:51
password:
summary: 小弟翻译的 Promise/A+ 规范，若有出入，请大哥大姐们帮忙斧正~
tags: 
- 规范
- 译文
- promise
categories: 
- javascript
---

> 原文：https://promisesaplus.com

<div class="promisesa">Promises/A+</div>

**Promises/A+是一个开放标准，一个规定了如何互相嵌套使用 JavaScript promises 的开放标准—由实现者制定和使用。**

一个 *promise* 代表异步操作的最终结果。与 promise 交互的主要方法是使用它的 `then` 方法，该方法注册回调函数来接收 promise 最终的 value 或者 promise 不能正常完成（fulfill）的 reason。

本规范详细描述了 `then` 方法的行为，给所有遵循 Promises/A+ 规范实现的 promise 提供一份实现基础。所以，可以认为本规范是非常稳定的。尽管 promise/A+ 组织可能偶尔会对这个规范做向后兼容的小修改以解决新发现的边界问题，只有在仔细考虑、讨论和测试之后，我们才会集成大型的或向后不兼容的变更。

从历史上看，Promises/A+ 澄清了早期 [Promises/A](http://wiki.commonjs.org/wiki/Promises/A) 提议的行为条款，扩展它以覆盖 *事实* 行为，并删除未指定或有问题的部分。

最后，Promises/A+ 规范的核心不会去演示如何创建、完成（fulfill）或者拒绝（reject）promises 对象，选择将重点放在提供一个互相嵌套的then方法上。未来在相关规范的工作中可能会涉及这些主题。
## 术语
1. “promise” 是一个具有 `then` 方法的对象或函数，该 `then` 方法的行为符合这个规范。
2. “thenable” 是一个定义了 `then` 方法的对象或函数。
3. “value” 是任何合法的 JavaScript 值（包括 `undefined`、thenable 或 promise）。
4. “exception” 是使用 `throw` 语句抛出的一个值。
5. “reason” 是一个值，它指示了一个 promise 为什么被拒绝（rejected）。

## 要求
### promise 的状态
promise 必须是三种状态之一：pending（等待态）、fulfilled（完成态）或 rejected（拒绝态）。

1. 处于 pending，promise：
    1. 可以过渡到 fulfilled 或 或rejected 状态。

2. 处于 fulfilled，promise：
    1. 一定不能过渡到任何其他状态。
    2. 必须有一个不变的 value。

3. 处于 rejected，promise：
    1. 一定不能过渡到任何其他状态。
    2. 必须有一个不变的 reason。

这里说的 “不变” 是指，不变的引用（即 `===`），但并不意味着深度不变。

### `then` 方法
一个 promise 必须提供一个 `then` 方法来访问它当前或最终的 value 或 reason。
一个 promise 的 `then` 方法接受两个参数：
``` js
promise.then(onFulfilled, onRejected)
```

1. `onFulfilled` 和 `onRejected` 都是可选参数：
    1. 如果 `onFulfilled` 不是一个函数，它必须被忽略。
    2. 如果 `onRejected` 不是一个函数，它必须被忽略。

2. 如果 `onFulfilled` 是一个函数：
    1. 它必须在 `promise` fulfilled 后被调用，`promise` 的 value 是它的第一个参数。
    2. 它一定不能在 `promise` fulfilled 之后调用。
    3. 它不能被调用超过一次。

3. 如果 `onRejected` 是一个函数：
    1. 它必须在 `promise` rejected 后被调用，`promise` 的 reason 是它的第一个参数。
    2. 它一定不能在 `promise` rejected 之后调用。
    3. 它不能被调用超过一次。

4. `onFulfilled` 或 `onRejected` 只有在 [执行上下文](https://es5.github.io/#x10.3) 堆栈仅包含平台代码时才可被调用<a id="ref-3-1" href="#3-1" rel="footnote"><sup>[3.1]</sup></a>。

5. `onFulfilled` 和 `onRejected` 必须被作为函数调用（即没有 `this` 值）。<a id="ref-3-2" href="#3-2" rel="footnote"><sup>[3.2]</sup></a>

6. `then` 方法可以被同一个 promise 对象调用多次。
    1. 如果/当 `promise` 执行完成后，所有相应的 `onFulfilled` 回调函数，必须按照对 `then` 的原始调用的顺序执行。
    2. 如果/当 `promise` 执行被拒绝后，所有相应的 `onRejected` 回调函数，必须按照对 `then` 的原始调用的顺序执行。

7. `then` 必须返回一个 promise 对象 <a id="ref-3-3" href="#3-3" rel="footnote"><sup>[3.3]</sup></a>
``` js
promise2 = promise1.then(onFulfilled, onRejected);   
```
    1. 如果 `onFulfilled` 或者 `onRejected` 中任何一个返回一个值 `x` ，运行 Promise Resolution Procedure `[[Resolve]](promise2, x)`。
    2. 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e`，`promise2` 必须以 `e` 作为被拒绝执行的原因。
    3. 如果 `onFulfilled` 不是函数，并且 `promise1` 执行完成，`promise2` 必须用和 `promise1` 相同的 value 达到完成态。
    4. 如果 `onRejected` 不是函数，并且 `promise1` 执行被拒绝，`promise2` 必须用和 `promise1` 相同的 reason 达到拒绝态。

### Promise Resolution Procedure（PRP）
**Promise Resolution Procedure（promise 解决过程）** 是一个以 promise 和一个值作为输入参数的抽象操作，
我们将其表示为 `[[Resolve]](promise, x)`。如果 `x` 是一个 thenable 的对象（即一个拥有 then 方法的函数或对象），假设 `x` 的行为至少有点像 `promise`，那么 PRP 试图使 `promise` 采用 `x` 的状态；否则用 `x` 的值来完成 `promise`。

这种对 thenable 的处理允许 promise 实现相互操作，只要他们公开一个 Promises/A+ 兼容的 `then` 方法即可。它也允许对那些不符合 Promises/A+ 的 `then` 方法进行"吸收"。

要运行 `[[Resolve]](promise, x)`，需通过以下步骤：
1. 如果 `promise` 和 `x` 引用同一对象[^1]，以 `TypeError` 为原因拒绝 promise。
2. 如果 `x` 是一个 promise 对象，则 采用 `x` 的状态 <a id="ref-3-4" href="#3-4" rel="footnote"><sup>[3.4]</sup></a>。
    1. 如果 `x` 处于 pending，`promise` 必须保持 pending 直到 `x` 变成 fulfilled 或 rejected。
    2. 如果/当 `x` 处于 fulfilled，使用相同的 value 完成 `promise`。
    3. 如果/当 `x` 处于 rejected，使用相同的 reason 拒绝 `promise`。
3. 此外，如果 `x` 是一个对象或函数：
    1. 把 `x.then` 赋值给 `then`。<a id="ref-3-5" href="#3-5" rel="footnote"><sup>[3.5]</sup></a>
    2. 如果取属性 `x.then` 的值时意外抛出错误 `e`，则使用 `e` 作为原因拒绝 `promise`。
    3. 如果 `then` 是一个函数，则以 `x` 作为 `this` 对其调用，以 `resolvePromise` 作为第一个参数，`rejectPromise` 作为第二个参数，其中:
        1. 如果/当以值 `y` 为参数调用 `resolvePromise` 时，则运行 `[[Resolve]](promise, y)`。
        2. 如果/当以原因 `r` 为参数调用 `rejectPromise` 时，则使用 `r` 拒绝 `promise`。
        3. 如果 `resolvePromise` 和 `rejectPromise` 都被调用，或者被使用相同的参数调用了多次，则首次调用将被优先采用，任何其它调用将被忽略。
        4. 如果调用 `then` 抛出异常 `e`：
            1. 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略该异常。
            2. 否则，使用 `e` 为原因拒绝 `promise`。
    4. 如果 `then` 不是函数，以 `x` 为值完成 `promise`。
4. 如果 `x` 不是对象或者函数，以 `x` 为值完成 `promise`。

如果使用参与循环 thenable 链的 thenable 来 resolve promise[^2]，由于 `[[Resolve]](promise, thenable)` 的递归性质最终导致再次调用 `[[Resolve]](promise, thenable)`，按照上面的算法将会导致无限递归。本规范鼓励但不要求实现检测这种递归，并以 `TypeError` 作为原因拒绝 `promise`<a id="ref-3-6" href="#3-6" rel="footnote"><sup>[3.6]</sup></a>。
## 注释
<p id="3-1">
    <span style="float: left;">3.1. </span>
    <p style="margin-left: 32px;">
        这里“平台代码”是指引擎、环境以及 promise 的实现代码。
        实际上，这个要求确保了 <code>onFulfilled</code> 和 <code>onRejected</code> 异步执行，
        即在调用 <code>then</code> 方法的那个事件循环之后的新执行栈中执行。
        这个可以通过"宏任务（macro-task）"机制如 <a href="https://html.spec.whatwg.org/multipage/webappapis.html#timers"><code>setTimeout</code></a> 或者 <a href="https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html#processingmodel"><code>setImmediate</code></a>
        或者"微任务（micro-task）"机制如 <a href="https://dom.spec.whatwg.org/#interface-mutationobserver"><code>MutationObserver</code></a> 或者 <a href="https://nodejs.org/api/process.html#process_process_nexttick_callback"><code>process.nextTick</code></a> 来实现。
        因为 promise 的实现被当作是平台代码，
        所以它本身可能会包含一个任务调度队列或者 "trampoline" 来调用处理程序。
        <a href="#ref-3-1" rev="footnote"> ↩</a>
    </p>
</p>
<p id="3-2">
    <span style="float: left;">3.2. </span>
    <p style="margin-left: 32px;">
        也就是说，<code>this</code> 的值，在严格模式下为 <code>undefined</code>；
        在宽松模式下为 global 对象。
        <a href="#ref-3-2" rev="footnote"> ↩</a>
    </p>
</p>
<p id="3-3">
    <span style="float: left;">3.3. </span>
    <p style="margin-left: 32px;">
        实现可能允许 <code>promise2 === promise1</code>，前提是实现满足所有需求。每个实现都应该记录它是否能够生成 <code>promise2 === promise1</code>，以及在什么条件下生成。
        <a href="#ref-3-3" rev="footnote"> ↩</a>
    </p>
</p>
<p id="3-4">
    <span style="float: left;">3.4. </span>
    <p style="margin-left: 32px;">
        通常，只有当 <code>x</code> 来自当前实现，我们才知道它是一个真正的 promise 对象。
        此条款允许使用特定实现中的方法来采用符合规范的 promise 对象的状态。
        <a href="#ref-3-4" rev="footnote"> ↩</a>
    </p>
</p>
<p id="3-5">
    <span style="float: left;">3.5. </span>
    <p style="margin-left: 32px;">
        这个过程首先存储对 <code>x.then</code> 的引用，然后测试该引用，然后调用该引用，
        避免了对 <code>x.then</code> 的多次访问。
        这一步骤中，我们首先会存储一个指向 x.then 的引用，然后测试该调用，之后调用该引用，
        这一系列过程为了防止对 <code>x.then</code> 属性的多处访问。
        这些预防措施对于确保访问器属性的一致性非常重要，因为访问器属性的值可能在检索之间发生变化
        <sup id="fnref:3">
            <a href="#fn:3" rel="footnote">
            <span class="hint--top hint--error hint--medium hint--rounded hint--bounce" aria-label="ES5 的 getter 特性可能会产生副作用。">
                [3]
            </span>
            </a>
        </sup>。
        <a href="#ref-3-5" rev="footnote"> ↩</a>
    </p>
</p>
<p id="3-6">
    <span style="float: left;">3.6. </span>
    <p style="margin-left: 32px;">
        本规范的实现 <em>不应该</em> 随意限制 thenable 链的深度，并假设在这个限制之外递归是无限的。
        只有真正的循环递归才应导致一个 <code>TypeError</code>；如果一条无限长链上的 thenable 对象各不相同，
        那么无限递归是正确的行为。
        <a href="#ref-3-6" rev="footnote"> ↩</a>
    </p>
</p>

## 译者注
[^1]: 即循环引用。
[^2]: 即调用时类似[[Resolve]](promise, promise)，这样的话这两个实参是同一个 promise 对象，则会导致无限递归。
[^3]: ES5 的 getter 特性可能会产生副作用。