/* Fixed classroom content. Source and review status: docs/教学内容核对.md.
 * Monetary values are integer jiao. No live AI, network calls or persistence.
 */
(function (root) {
  'use strict';

  function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }

  function requireTenths(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new TypeError('金额必须为非负整数角。');
    }
    return value;
  }

  var content = {
    fruits: [
      { id: 'apple', name: '苹果', unit: '袋', prices: { original: 23, special: 21, member: 19 } },
      { id: 'orange', name: '橙子', unit: '袋', prices: { original: 18, special: 16, member: 15 } },
      { id: 'pear', name: '梨', unit: '袋', prices: { original: 36, special: 32, member: 30 } }
    ],
    presets: [
      { id: 'original', label: '原价' },
      { id: 'special', label: '今日特价' },
      { id: 'member', label: '会员价' }
    ],
    tasks: {
      1: {
        title: '说清价钱',
        subtitle: '把价格、单位条和元角联系起来',
        opening: '欢迎来水果铺！先看看这张价格牌，你能说说 {price} 元表示多少钱吗？',
        hint: '先看有几个完整的 1 元，再看不足 1 元的部分。',
        answer: '{price} 元是 {whole} 元 {tenths} 角，也就是 {whole} 个 1 元加 {tenths} 个 0.1 元。每条单位条代表 1 元，十等分后每小格是 0.1 元，也就是 1 角。',
        questions: {
          basic: [
            {
              q: '0.1 元是多少角？',
              hint: '看看 1 元的单位条被平均分成了多少份，再想想元和角的关系。',
              answer: '1 元等于 10 角，平均分成 10 份后，每份是 0.1 元，也就是 1 角。'
            },
            {
              q: '{price} 元里有几个 1 元、几个 0.1 元？',
              hint: '先数完整的单位条，再数不足 1 元的涂色小格。',
              answer: '有 {whole} 个 1 元和 {tenths} 个 0.1 元，合起来是 {price} 元。'
            },
            {
              q: '这个价钱中，不足 1 元的部分对应几小格？表示多少元？',
              hint: '先找到每一小格代表的金额，再说涂色部分的金额。',
              answer: '每小格是 0.1 元，不足 1 元的部分对应 {tenths} 小格，是 0.{tenths} 元，也就是 {tenths} 角。'
            }
          ],
          apply: [
            {
              q: '你能把 {price} 元说给一位顾客听吗？',
              hint: '可以一边指单位条，一边从整元部分说起。',
              answer: '这袋水果的价格是 {whole} 元 {tenths} 角，写成小数就是 {price} 元。请指着对应的单位条说明。'
            },
            {
              q: '怎样用单位条说明 0.{tenths} 元的含义？',
              hint: '先说整条代表什么，再说每小格代表什么。',
              answer: '整条代表 1 元，平均分成 10 份，每份是 0.1 元。不足 1 元的部分是 {tenths} 份，即 0.{tenths} 元，也就是 {tenths} 角。读金额时要把角与分的单位说清楚。'
            }
          ],
          extend: [
            {
              q: '价格牌上的小数在生活里有什么用？',
              hint: '想想顾客看完价格牌后，能够知道或决定什么。',
              answer: '价格牌让顾客知道商品的价钱，可以帮助准备付款或比较价格。请结合自己的经历说明。'
            },
            {
              q: '你在哪里见过这样的价格？知道价钱能帮你做什么？',
              hint: '回想一次买东西的经历，把看到的数和用途一起说出来。',
              answer: '可以说出商店、超市或其他真实情境中的小数价格，并说明它怎样帮助了解价钱、准备付款或作出选择。不同经历由老师听取和点评。'
            }
          ]
        }
      },
      2: {
        title: '帮我选一家',
        subtitle: '比较同样水果的价格，并说出理由',
        opening: '两家店卖的是同品种、同品质、同样一袋苹果。你想选哪一家？先说说理由。',
        hint: '先比整元部分，再比角的部分。请把选择的理由说完整。',
        answer: '两家店的整元部分都是 2 元。3 角比 8 角少，所以 2.3 元小于 2.8 元。买同样一袋苹果，选 2.3 元这家可以少花 5 角钱。',
        questions: {
          basic: [
            {
              q: '2.3 元中的“2”和“3”分别表示什么？',
              hint: '把元和角分别说清楚，可以回想刚才的单位条。',
              answer: '“2”表示 2 个 1 元，“3”表示 3 个 0.1 元，也就是 3 角。'
            },
            {
              q: '这两个价钱有什么相同的部分？有什么不同的部分？',
              hint: '先看整元部分，再看不足 1 元的部分。',
              answer: '整元部分都是 2 元；角的部分分别是 3 角和 8 角。'
            }
          ],
          apply: [
            {
              q: '2.3 元和 2.8 元，哪家便宜？你是怎么比出来的？',
              hint: '同样的苹果，先比较整元，再比较角的部分。',
              answer: '2.3 元这家便宜。两个价钱都是 2 元多，3 角比 8 角少，因此 2.3 元小于 2.8 元。'
            },
            {
              q: '选便宜的这家，能省多少钱？',
              hint: '整元部分相同，想一想角的部分相差多少，回答时带上单位。',
              answer: '8 角比 3 角多 5 角，所以买同样一袋苹果可以省 5 角钱。'
            }
          ],
          extend: [
            {
              q: '购物时，小数能帮我们做什么决定？',
              hint: '把价钱和刚才的选择联系起来说。',
              answer: '在商品品种、品质和数量相同的条件下，小数价格能帮助比较价钱、选择购买地点。'
            },
            {
              q: '为什么比较前要确认两袋苹果是同样的？',
              hint: '看看两家店出售的东西和份量是否一致。',
              answer: '比较同种、同量、同质量的商品，才能在这个任务中仅依据价钱判断哪家便宜。'
            }
          ]
        }
      },
      3: {
        title: '把小数带回家',
        subtitle: '认识 0.7 米，再写一个自己的生活例子',
        opening: '店主想准备一段 0.7 米的丝带。看这条 1 米长的图示，你会从哪里剪？',
        hint: '先看整条表示多长、平均分成多少份，再找出需要的部分。',
        answer: '1 米平均分成 10 份，每份是 0.1 米。0.7 米是 7 个 0.1 米，也就是十分之七米。元表示金额，米表示长度，不能把元与米直接比较大小。',
        questions: {
          basic: [
            {
              q: '1 米平均分成 10 份，每份是多少米？',
              hint: '想一想十等分图中一小格与整条的关系。',
              answer: '每份是十分之一米，写成小数是 0.1 米。'
            },
            {
              q: '0.7 米对应图上的几小格？这些小格表示多少米？',
              hint: '先确认每小格的长度，再把需要的小格指出来。',
              answer: '对应 7 小格。每小格是 0.1 米，7 小格合起来是 0.7 米。'
            }
          ],
          apply: [
            {
              q: '0.7 米有多长？你能在图上指出来吗？',
              hint: '从起点开始，沿着十等分的图示寻找剪的位置。',
              answer: '从起点数到第 7 小格的末端，这一段长 0.7 米。'
            },
            {
              q: '知道丝带是 0.7 米，能帮助准备材料的人做什么？',
              hint: '想想准备丝带时，需要知道哪一项信息。',
              answer: '它说明需要的长度，可以帮助量出并剪取相应的一段丝带。'
            }
          ],
          extend: [
            {
              q: '生活中你还在哪里见过小数？这个数有什么用？',
              hint: '想一想除了买东西，小数还会出现在哪里。把数、单位和用途说清楚。',
              answer: '可以从身高、长度或价签等真实经历中举例，并说明小数帮助了解、测量或判断什么。例子由老师听取和点评。'
            },
            {
              q: '除了买东西，小数还可以表示什么？',
              hint: '看看丝带，再回想生活中需要测量的事物。',
              answer: '小数也可以表示长度，例如以米为单位表示丝带长度或身高。金额与长度的单位不同，不能把元与米直接比较大小。'
            }
          ]
        }
      }
    },
    fallback: '这个问题我们先问问老师，或者看看图示。'
  };

  root.FRUIT_CONTENT = deepFreeze(content);
  root.DecimalMath = Object.freeze({
    price: function (value) {
      requireTenths(value);
      return Math.floor(value / 10) + '.' + (value % 10);
    },
    decompose: function (value) {
      requireTenths(value);
      return { whole: Math.floor(value / 10), tenths: value % 10 };
    },
    comparison: function () {
      return { left: 23, right: 28, difference: 5 };
    },
    escapeHTML: function (value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
