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
      throw new TypeError('Amounts must be non-negative whole numbers of jiao.');
    }
    return value;
  }

  var content = {
    "fruits": [
      {
        "id": "apple",
        "name": "Apples",
        "unit": "bag",
        "prices": {
          "original": 23
        }
      }
    ],
    "presets": [
      {
        "id": "original",
        "label": "Original price"
      }
    ],
    "transfer": {
      "fruitId": "orange",
      "name": "Oranges",
      "unit": "bag",
      "amount": 18
    },
    "tasks": {
      "1": {
        "title": "Explain the price",
        "subtitle": "Connect the price, unit bars, yuan and jiao",
        "opening": "Welcome to the fruit shop! Look at this price tag. Can you explain how much {price} yuan is?",
        "hint": "First count the whole yuan. Then look at the part smaller than 1 yuan.",
        "answer": "{price} yuan is {whole} yuan and {tenths} jiao: {whole} lots of 1 yuan plus {tenths} lots of 0.1 yuan. Each unit bar represents 1 yuan. It has ten equal cells, so each cell is 0.1 yuan, or 1 jiao.",
        "questions": {
          "basic": [
            {
              "q": "How many jiao is 0.1 yuan?",
              "hint": "Look at how many equal parts make up the 1-yuan bar. Think about yuan and jiao.",
              "answer": "1 yuan equals 10 jiao. Dividing it into 10 equal parts gives 0.1 yuan, or 1 jiao, in each part."
            },
            {
              "q": "How many lots of 1 yuan and 0.1 yuan make {price} yuan?",
              "hint": "Count the whole bars first. Then count the shaded cells in the part smaller than 1 yuan.",
              "answer": "There are {whole} lots of 1 yuan and {tenths} lots of 0.1 yuan. Together, they make {price} yuan."
            },
            {
              "q": "How many cells show the part smaller than 1 yuan? How much money is that?",
              "hint": "Find the value of one cell. Then explain the value of the shaded part.",
              "answer": "Each cell is 0.1 yuan. The part smaller than 1 yuan has {tenths} cells. It is 0.{tenths} yuan, or {tenths} jiao."
            }
          ],
          "apply": [
            {
              "q": "Can you explain {price} yuan to a customer?",
              "hint": "Point to the bars as you explain. Start with the whole yuan.",
              "answer": "This bag of fruit costs {whole} yuan and {tenths} jiao. Written as a decimal, that is {price} yuan. Point to the matching bars as you explain."
            },
            {
              "q": "How do the unit bars show 0.{tenths} yuan?",
              "hint": "Explain what the whole bar represents, then what one cell represents.",
              "answer": "The whole bar is 1 yuan. It has 10 equal parts, each worth 0.1 yuan. The part smaller than 1 yuan has {tenths} parts: 0.{tenths} yuan, or {tenths} jiao. Say the money unit clearly so that jiao and fen are not confused."
            }
          ],
          "extend": [
            {
              "q": "How are decimals on price tags useful in daily life?",
              "hint": "What can a customer find out or decide after reading a price tag?",
              "answer": "A price tag tells customers how much an item costs. It helps them prepare payment or compare prices. Explain using your own experience."
            },
            {
              "q": "Where have you seen a price like this? How does knowing the price help you?",
              "hint": "Think of a time you went shopping. Say the number you saw and how it helped.",
              "answer": "Give a decimal price you have seen in a shop, supermarket or another real place. Explain how it helped you understand the cost, prepare payment or make a choice. Your teacher will discuss your example with you."
            }
          ]
        }
      },
      "2": {
        "title": "Choose a shop",
        "subtitle": "Compare prices for the same fruit and explain your choice",
        "opening": "Both shops sell the same variety and quality of apples, with the same amount in each bag. Which shop would you choose? Explain your reason first.",
        "hint": "Compare the whole yuan first, then the jiao. Explain why you chose that shop.",
        "answer": "Both prices have 2 whole yuan. 3 jiao is less than 8 jiao, so 2.3 yuan is less than 2.8 yuan. For the same bag of apples, choosing the shop charging 2.3 yuan saves 5 jiao.",
        "questions": {
          "basic": [
            {
              "q": "What do the “2” and “3” in 2.3 yuan each represent?",
              "hint": "Explain the yuan and jiao separately. Think back to the unit bars.",
              "answer": "The “2” means 2 lots of 1 yuan. The “3” means 3 lots of 0.1 yuan, or 3 jiao."
            },
            {
              "q": "What is the same about these two prices? What is different?",
              "hint": "Look at the whole yuan first, then the part smaller than 1 yuan.",
              "answer": "Both prices have 2 whole yuan. The jiao parts are 3 jiao and 8 jiao."
            }
          ],
          "apply": [
            {
              "q": "Which is cheaper: 2.3 yuan or 2.8 yuan? How did you compare them?",
              "hint": "For the same apples, compare the whole yuan first, then the jiao.",
              "answer": "The shop charging 2.3 yuan is cheaper. Both prices are a little more than 2 yuan. 3 jiao is less than 8 jiao, so 2.3 yuan is less than 2.8 yuan."
            },
            {
              "q": "How much can you save by choosing the cheaper shop?",
              "hint": "The whole yuan parts are the same. Find the difference between the jiao parts, and include the unit.",
              "answer": "8 jiao is 5 jiao more than 3 jiao. You can save 5 jiao on the same bag of apples."
            }
          ],
          "extend": [
            {
              "q": "What decisions can decimals help us make when shopping?",
              "hint": "Connect the prices with the choice you just made.",
              "answer": "When the variety, quality and amount are the same, decimal prices help us compare costs and choose where to buy."
            },
            {
              "q": "Why should we check that the two bags of apples are the same before comparing prices?",
              "hint": "Check what each shop sells and how much is in each bag.",
              "answer": "When the variety, amount and quality are the same, we can use just the price to decide which shop is cheaper in this task."
            }
          ]
        }
      },
      "3": {
        "title": "Decimals in daily life",
        "subtitle": "Explore 0.7 metres, then write your own everyday example",
        "opening": "Mr Lin needs 0.7 metres of ribbon. Look at this 1-metre strip. Where would you cut it?",
        "hint": "Check the length of the whole strip and how many equal parts it has. Then find the part you need.",
        "answer": "1 metre divided into 10 equal parts gives 0.1 metres in each part. 0.7 metres is 7 lots of 0.1 metres, or seven tenths of a metre. Yuan measures money and metres measure length. We cannot compare them directly.",
        "questions": {
          "basic": [
            {
              "q": "If 1 metre is divided into 10 equal parts, how long is each part?",
              "hint": "Think about how one cell relates to the whole strip with ten equal parts.",
              "answer": "Each part is one tenth of a metre, written as 0.1 metres."
            },
            {
              "q": "How many cells show 0.7 metres? What length do they represent?",
              "hint": "Check the length of one cell first. Then point to the cells you need.",
              "answer": "7 cells show this length. Each cell is 0.1 metres, so 7 cells make 0.7 metres."
            }
          ],
          "apply": [
            {
              "q": "How long is 0.7 metres? Can you point to it on the strip?",
              "hint": "Start at zero and use the ten equal parts to find where to cut.",
              "answer": "Count from the start to the end of the seventh cell. This length is 0.7 metres."
            },
            {
              "q": "How does knowing the ribbon length is 0.7 metres help someone prepare it?",
              "hint": "What do you need to know when preparing a piece of ribbon?",
              "answer": "It tells you the length you need, so you can measure and cut the right piece of ribbon."
            }
          ],
          "extend": [
            {
              "q": "Where else have you seen a decimal in daily life? How was it useful?",
              "hint": "Think beyond shopping. Explain the number, its unit and how it helped you.",
              "answer": "Give a real example, such as a height, a length or a price. Explain what the decimal helped you understand, measure or decide. Your teacher will discuss your example with you."
            },
            {
              "q": "What can decimals show besides prices?",
              "hint": "Look at the ribbon. Think of things you measure in daily life.",
              "answer": "Decimals can also show length, such as the length of a ribbon or a height in metres. Money and length use different units, so we cannot compare yuan and metres directly."
            }
          ]
        }
      }
    },
    "practice": {
      "shuffleDefault": false,
      "groups": [
        {
          "id": "A",
          "title": "Parts of a price",
          "review": "One unit bar is 1 yuan. Each cell is 0.1 yuan. Look at the whole yuan first, then the jiao."
        },
        {
          "id": "B",
          "title": "Comparing prices",
          "review": "Compare bags of apples with the same variety, quality and amount. Compare whole yuan first, then jiao. 2.3 yuan is 5 jiao less than 2.8 yuan."
        },
        {
          "id": "C",
          "title": "Length and daily life",
          "review": "0.7 metres is 7 lots of 0.1 metres. In your everyday example, explain the quantity, unit and purpose."
        }
      ],
      "questions": [
        {
          "id": "A1",
          "group": "A",
          "prompt": "How many jiao is 0.1 yuan?",
          "options": [
            {
              "id": "a",
              "text": "0.1 jiao"
            },
            {
              "id": "b",
              "text": "1 jiao"
            },
            {
              "id": "c",
              "text": "10 jiao"
            }
          ],
          "correctId": "b",
          "hint": "Think about 1 yuan divided into 10 equal parts. How does each part relate to jiao?",
          "explanation": "1 yuan equals 10 jiao. Dividing it into 10 equal parts gives 0.1 yuan, or 1 jiao, in each part."
        },
        {
          "id": "A2",
          "group": "A",
          "prompt": "How many lots of 1 yuan and 0.1 yuan make 2.3 yuan?",
          "options": [
            {
              "id": "a",
              "text": "2 lots of 1 yuan and 3 lots of 0.1 yuan"
            },
            {
              "id": "b",
              "text": "3 lots of 1 yuan and 2 lots of 0.1 yuan"
            },
            {
              "id": "c",
              "text": "2 lots of 1 yuan and 8 lots of 0.1 yuan"
            }
          ],
          "correctId": "a",
          "hint": "First count the whole yuan. Then look at the part smaller than 1 yuan.",
          "explanation": "2.3 yuan is 2 yuan and 3 jiao: 2 lots of 1 yuan plus 3 lots of 0.1 yuan."
        },
        {
          "id": "A3",
          "group": "A",
          "prompt": "What does the “3” in 2.3 yuan represent?",
          "options": [
            {
              "id": "a",
              "text": "3 fen"
            },
            {
              "id": "b",
              "text": "3 yuan"
            },
            {
              "id": "c",
              "text": "3 lots of 0.1 yuan, or 3 jiao"
            }
          ],
          "correctId": "c",
          "hint": "The “3” is after the decimal point. What does each cell in the part smaller than 1 yuan represent?",
          "explanation": "The “3” after the decimal point means 3 lots of 0.1 yuan, or 3 jiao."
        },
        {
          "id": "A4",
          "group": "A",
          "prompt": "How many cells are shaded? How much money do they represent?",
          "diagram": {
            "type": "money",
            "amount": 3
          },
          "options": [
            {
              "id": "a",
              "text": "3 cells, 0.3 yuan"
            },
            {
              "id": "b",
              "text": "7 cells, 0.7 yuan"
            },
            {
              "id": "c",
              "text": "3 cells, 0.1 yuan"
            }
          ],
          "correctId": "a",
          "hint": "Count only the shaded cells. Then think about the value of each cell.",
          "explanation": "The whole bar is 1 yuan, divided into 10 equal cells. Each cell is 0.1 yuan. Three shaded cells show 3 lots of 0.1 yuan, or 0.3 yuan."
        },
        {
          "id": "B1",
          "group": "B",
          "prompt": "For the same bag of apples, which is cheaper: 2.3 yuan or 2.8 yuan?",
          "options": [
            {
              "id": "a",
              "text": "2.8 yuan"
            },
            {
              "id": "b",
              "text": "They cost the same"
            },
            {
              "id": "c",
              "text": "2.3 yuan"
            }
          ],
          "correctId": "c",
          "hint": "Both prices have the same number of whole yuan. Look at the jiao next.",
          "explanation": "Both prices are a little more than 2 yuan. 3 jiao is less than 8 jiao, so the shop charging 2.3 yuan is cheaper."
        },
        {
          "id": "B2",
          "group": "B",
          "prompt": "For the same bag of apples, how much do you save by paying 2.3 yuan instead of 2.8 yuan?",
          "options": [
            {
              "id": "a",
              "text": "3 jiao"
            },
            {
              "id": "b",
              "text": "5 jiao"
            },
            {
              "id": "c",
              "text": "8 jiao"
            }
          ],
          "correctId": "b",
          "hint": "The whole yuan parts are the same. Find the difference between the jiao parts.",
          "explanation": "Both prices have 2 whole yuan. 8 jiao is 5 jiao more than 3 jiao, so choosing the shop charging 2.3 yuan saves 5 jiao."
        },
        {
          "id": "B3",
          "group": "B",
          "prompt": "What must we check before comparing the two fruit prices?",
          "options": [
            {
              "id": "a",
              "text": "The same variety, quality and amount of fruit in each bag"
            },
            {
              "id": "b",
              "text": "The bags are the same colour"
            },
            {
              "id": "c",
              "text": "The shop signs are the same size"
            }
          ],
          "correctId": "a",
          "hint": "Can we compare what the two shops sell fairly?",
          "explanation": "Check that both bags have the same variety, quality and amount of fruit. Then we can choose using only the price in this task."
        },
        {
          "id": "C1",
          "group": "C",
          "prompt": "How many lots of 0.1 metres make 0.7 metres?",
          "options": [
            {
              "id": "a",
              "text": "1"
            },
            {
              "id": "b",
              "text": "10"
            },
            {
              "id": "c",
              "text": "7"
            }
          ],
          "correctId": "c",
          "hint": "Think of the 1-metre ribbon divided into ten equal parts. Each cell is 0.1 metres.",
          "explanation": "0.7 metres is 7 lots of 0.1 metres. It covers 7 cells of the 1-metre strip divided into ten equal parts."
        },
        {
          "id": "C2",
          "group": "C",
          "prompt": "Which statement is correct?",
          "options": [
            {
              "id": "a",
              "text": "Yuan measures money and metres measure length. We cannot compare them directly."
            },
            {
              "id": "b",
              "text": "2.3 yuan is greater than 0.7 metres."
            },
            {
              "id": "c",
              "text": "We can directly compare different units as long as the numbers are decimals."
            }
          ],
          "correctId": "a",
          "hint": "Look at the units first. Do the two numbers describe the same kind of quantity?",
          "explanation": "Yuan measures money and metres measure length. We cannot directly compare the numbers when they describe different kinds of quantity."
        },
        {
          "id": "C3",
          "group": "C",
          "prompt": "Which everyday example explains the quantity, unit and purpose?",
          "options": [
            {
              "id": "a",
              "text": "I saw 0.7 written on a ribbon."
            },
            {
              "id": "b",
              "text": "I bought a bag of apples."
            },
            {
              "id": "c",
              "text": "0.7 metres is a decimal."
            },
            {
              "id": "d",
              "text": "I need 0.7 metres of ribbon for a bow. Knowing the length helps me cut the right piece."
            }
          ],
          "correctId": "d",
          "hint": "Find the quantity and unit first. Then check whether the example explains how the number helps.",
          "explanation": "“0.7 metres” gives the ribbon length. “Cut the right piece” explains its purpose. The quantity, unit and purpose are all clear."
        }
      ]
    },
    "fallback": "Let us ask the teacher or look at the diagram together."
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
    validTransfer: function (value) {
      return Number.isSafeInteger(value) && value > 0 && value % 10 !== 0;
    },
    composition: function (value) {
      requireTenths(value);
      var whole = Math.floor(value / 10), tenths = value % 10;
      if (tenths === 0) return 'Exactly ' + whole + ' yuan, with no part smaller than 1 yuan.';
      var price = whole + '.' + tenths;
      if (whole === 0) return price + ' yuan is ' + tenths + ' jiao: ' + tenths + (tenths === 1 ? ' lot' : ' lots') + ' of 0.1 yuan.';
      return price + ' yuan is ' + whole + ' yuan and ' + tenths + ' jiao: ' + whole + (whole === 1 ? ' lot' : ' lots') + ' of 1 yuan plus ' + tenths + (tenths === 1 ? ' lot' : ' lots') + ' of 0.1 yuan.';
    },
    escapeHTML: function (value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
