const { RuleTester } = require('eslint');
const rule = require('./index');

RuleTester.setDefaultConfig({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: require('@babel/eslint-parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      requireConfigFile: false,
      babelOptions: {
        presets: [require.resolve('@babel/preset-react')],
      },
    },
  },
});

const ruleTester = new RuleTester();

ruleTester.run('order', rule, {
  valid: [
    {
      code: `
        const useState = () => [0, () => {}];
        const useEffect = () => {};
        const useCustom = () => true;
        function Good() {
          const [a, setA] = useState(0);
          const b = useCustom();
          const c = a + 1;
          const handle = () => {};
          useEffect(() => {}, [a]);
          if (!b) return null;
          return <div>{c}</div>;
        }
      `
    },
    {
      code: `
        const useState = () => [0, () => {}];
        const useEffect = () => {};
        const useCustom = () => true;
        const GoodArrow = () => {
          const [a, setA] = useState(0);
          const b = useCustom();
          const c = a + 1;
          function handle() {}
          useEffect(() => {}, [a]);
          if (!b) return null;
          return <div>{c}</div>;
        }
      `
    }
  ],
  invalid: [
    {
      code: `
        const useState = () => [0, () => {}];
        const useEffect = () => {};
        const useCustom = () => true;
        function Bad() {
          const b = useCustom();
          const [a, setA] = useState(0);
          const c = a + 1;
          useEffect(() => {}, [a]);
          const handle = () => {};
          if (!b) return null;
          return <div>{c}</div>;
        }
      `,
      errors: [{ messageId: 'order' }]
    },
    {
      code: `
        const useState = () => [0, () => {}];
        const useEffect = () => {};
        const useCustom = () => true;
        const BadArrow = () => {
          const b = useCustom();
          const [a, setA] = useState(0);
          const c = a + 1;
          useEffect(() => {}, [a]);
          function handle() {}
          if (!b) return null;
          return <div>{c}</div>;
        }
      `,
      errors: [{ messageId: 'order' }]
    }
  ]
}); 