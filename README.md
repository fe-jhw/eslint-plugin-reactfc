# eslint-plugin-reactfc

An ESLint plugin that enforces the order of hooks, methods, and rendering logic inside React functional components.

## What does this plugin do?
This plugin enforces a consistent order for code blocks inside React functional components. It helps maintain readability and best practices by ensuring that hooks, variables, methods, effects, and rendering logic always appear in a predictable order.

### Enforced Order
1. `useState` hooks (state management)
2. Custom hook calls
3. Other variables or computed values
4. Methods (functions inside the component)
5. `useEffect` hooks (side effects)
6. Conditional rendering logic (if applicable)
7. JSX return (rendered output)

## Installation
```bash
npm install --save-dev eslint-plugin-reactfc
```

## Usage
Add the following to your `.eslintrc.js` or `.eslintrc.json`:

```json
{
  "plugins": ["reactfc"],
  "rules": {
    "reactfc/order": "warn"
  }
}
```

## Rule Details
This rule checks the order of code blocks inside React functional components. The expected order is:

1. `useState` hooks
2. Custom hooks (functions starting with `use` except `useState`/`useEffect`)
3. Variables and computed values
4. Methods (function declarations or function expressions assigned to variables)
5. `useEffect` hooks
6. Conditional rendering (if statements that return JSX)
7. The final `return` statement with JSX

If any block is out of order, a warning or error will be reported.

## Example
**Correct:**
```jsx
function MyComponent() {
  const [count, setCount] = useState(0); // 1. useState
  const data = useMyCustomHook();        // 2. custom hook
  const doubled = count * 2;             // 3. computed value
  const handleClick = () => {};          // 4. method
  useEffect(() => {}, [count]);          // 5. useEffect
  if (!data) return null;                // 6. conditional rendering
  return <div>{doubled}</div>;           // 7. JSX return
}
```

**Incorrect:**
```jsx
function MyComponent() {
  const data = useMyCustomHook();
  const [count, setCount] = useState(0); // useState should come first
  const doubled = count * 2;
  useEffect(() => {}, [count]);
  const handleClick = () => {}; // method should come before useEffect
  if (!data) return null;
  return <div>{doubled}</div>;
}
```

## Development & Testing
- All rules are in `index.js`.
- Tests are in `order-rule.test.js` and use [Jest](https://jestjs.io/) and ESLint's [RuleTester](https://eslint.org/docs/latest/developer-guide/working-with-rules#rule-tester).
- To run tests:

```bash
npm test
```

## Contributing
Feel free to open issues or pull requests for bug fixes, new features, or improvements.

## License
MIT 