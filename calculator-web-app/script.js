const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.getElementById("keypad");

let expression = "";
let justCalculated = false;
let hasError = false;

function render() {
  expressionDisplay.textContent = expression;
  resultDisplay.textContent = hasError ? "Error" : (expression || "0");
}

function isOperator(char) {
  return ["+", "-", "*", "/"].includes(char);
}

function appendValue(value) {
  if (hasError) clearAll();
  if (justCalculated && /[0-9.]/.test(value)) expression = "";
  justCalculated = false;

  const last = expression.slice(-1);
  if (isOperator(value)) {
    if (!expression && value !== "-") return;
    if (isOperator(last)) expression = expression.slice(0, -1);
    expression += value;
    render();
    return;
  }
  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) return;
    if (!currentNumber) expression += "0";
  }
  expression += value;
  render();
}

function clearAll() {
  expression = "";
  justCalculated = false;
  hasError = false;
  render();
}

function backspace() {
  if (hasError || justCalculated) return clearAll();
  expression = expression.slice(0, -1);
  render();
}

function safeEvaluate(source) {
  // Accept only numeric literals, arithmetic operators and decimal points.
  if (!source || !/^[0-9.+*/\-]+$/.test(source)) throw new Error("Invalid expression");
  if (/[+\-*/.]$/.test(source) || /[*/]{2,}/.test(source)) throw new Error("Incomplete expression");

  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)|[+\-*/]/g);
  if (!tokens || tokens.join("") !== source) throw new Error("Invalid syntax");

  // Convert to Reverse Polish Notation (shunting-yard) instead of eval().
  const output = [];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  let expectNumber = true;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      if (!expectNumber) throw new Error("Invalid syntax");
      output.push(Number(token));
      expectNumber = false;
    } else {
      if (expectNumber) {
        if (token === "-" && (i === 0 || isOperator(tokens[i - 1]))) {
          // Unary minus is handled by combining it with the following number.
          const next = tokens[i + 1];
          if (!next || !/^(?:\d+\.?\d*|\.\d+)$/.test(next)) throw new Error("Invalid syntax");
          output.push(-Number(next));
          i++;
          expectNumber = false;
          continue;
        }
        throw new Error("Invalid syntax");
      }
      while (operators.length && precedence[operators.at(-1)] >= precedence[token]) {
        output.push(operators.pop());
      }
      operators.push(token);
      expectNumber = true;
    }
  }
  if (expectNumber) throw new Error("Invalid syntax");
  while (operators.length) output.push(operators.pop());

  const stack = [];
  for (const token of output) {
    if (typeof token === "number") stack.push(token);
    else {
      if (stack.length < 2) throw new Error("Invalid syntax");
      const b = stack.pop();
      const a = stack.pop();
      if (token === "/" && b === 0) throw new Error("Cannot divide by zero");
      const value = token === "+" ? a + b : token === "-" ? a - b : token === "*" ? a * b : a / b;
      stack.push(value);
    }
  }
  if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error("Invalid result");
  return stack[0];
}

function calculate() {
  if (!expression) return;
  try {
    const original = expression;
    const answer = safeEvaluate(expression);
    expression = String(Number(answer.toPrecision(12)));
    expressionDisplay.textContent = `${original} =`;
    resultDisplay.textContent = expression;
    justCalculated = true;
    hasError = false;
  } catch (error) {
    expressionDisplay.textContent = error.message;
    resultDisplay.textContent = "Error";
    hasError = true;
    justCalculated = false;
  }
}

function changeSign() {
  if (!expression || hasError) return;
  const match = expression.match(/(\d*\.?\d+)$/);
  if (!match) return;
  const start = match.index;
  const before = expression.slice(0, start);
  const number = match[0];
  if (before.endsWith("-") && (before.length === 1 || isOperator(before.at(-2)))) {
    expression = before.slice(0, -1) + number;
  } else {
    expression = before + (before.endsWith("-") ? "" : "-") + number;
  }
  render();
}

function percent() {
  if (!expression || hasError) return;
  const match = expression.match(/(\d*\.?\d+)$/);
  if (!match) return;
  const value = Number(match[0]) / 100;
  expression = expression.slice(0, match.index) + String(value);
  render();
}

function handleAction(action) {
  if (action === "clear") clearAll();
  else if (action === "backspace") backspace();
  else if (action === "equals") calculate();
  else if (action === "sign") changeSign();
  else if (action === "percent") percent();
}

keypad.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.value !== undefined) appendValue(button.dataset.value);
  else if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener("keydown", event => {
  if (/^[0-9.]$/.test(event.key)) {
    event.preventDefault();
    appendValue(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    event.preventDefault();
    appendValue(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (event.key === "Escape" || event.key === "Delete") {
    event.preventDefault();
    clearAll();
  } else if (event.key === "%") {
    event.preventDefault();
    percent();
  }
});

render();