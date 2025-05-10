// @ts-check
/**
 * @fileoverview ESLint rule to enforce the order of hooks, methods, and rendering logic inside React functional components.
 */

'use strict';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const orderRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the order of useState, custom hooks, variables/computed values, methods, useEffect, conditional rendering, and JSX return in React functional components.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      order: "The '{{current}}' block is before a '{{shouldBeAfter}}' block. '{{current}}' should come after all '{{shouldBeAfter}}' blocks.\nExpected order: {{expectedOrder}}."
    }
  },
  create(context) {
    // Order definition
    const ORDER = [
      'useState',      // 1. useState
      'customHook',    // 2. custom hooks
      'variable',      // 3. variables/computed values
      'handler',       // 4. methods
      'useEffect',     // 5. useEffect
      'conditional',   // 6. conditional rendering
      'return',        // 7. JSX return
    ];
    const ORDER_LABELS = {
      useState: 'useState',
      customHook: 'custom hook',
      variable: 'variable/computed value',
      handler: 'handler/method',
      useEffect: 'useEffect',
      conditional: 'conditional rendering',
      return: 'JSX return',
    };

    // Node type classification function
    function getBlockType(node) {
      // useState
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        node.declarations[0].init &&
        node.declarations[0].init.type === 'CallExpression' &&
        node.declarations[0].init.callee.name === 'useState'
      ) {
        return 'useState';
      }
      // custom hooks (starts with use, except useState/useEffect)
      if (
        node.type === 'VariableDeclaration' &&
        node.declarations.length === 1 &&
        node.declarations[0].init &&
        node.declarations[0].init.type === 'CallExpression' &&
        /^use[A-Z]/.test(node.declarations[0].init.callee.name || '') &&
        !['useState', 'useEffect'].includes(node.declarations[0].init.callee.name)
      ) {
        return 'customHook';
      }
      // useEffect
      if (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'CallExpression' &&
        node.expression.callee.name === 'useEffect'
      ) {
        return 'useEffect';
      }
      // methods (function declarations or functions assigned to variables)
      if (
        (node.type === 'FunctionDeclaration') ||
        (node.type === 'VariableDeclaration' &&
          node.declarations.length === 1 &&
          node.declarations[0].init &&
          (node.declarations[0].init.type === 'ArrowFunctionExpression' || node.declarations[0].init.type === 'FunctionExpression'))
      ) {
        return 'handler';
      }
      // conditional rendering (if statement + return statement inside)
      if (
        node.type === 'IfStatement' &&
        node.consequent && (
          (node.consequent.type === 'BlockStatement' && node.consequent.body.some(
            s => s.type === 'ReturnStatement' && s.argument && (s.argument.type === 'JSXElement' || s.argument.type === 'JSXFragment')
          )) ||
          (node.consequent.type === 'ReturnStatement' && node.consequent.argument && (node.consequent.argument.type === 'JSXElement' || node.consequent.argument.type === 'JSXFragment'))
        )
      ) {
        return 'conditional';
      }
      // JSX return (return statement + JSX)
      if (
        node.type === 'ReturnStatement' &&
        node.argument &&
        (node.argument.type === 'JSXElement' || node.argument.type === 'JSXFragment')
      ) {
        return 'return';
      }
      // other variables/computed values
      if (node.type === 'VariableDeclaration') {
        return 'variable';
      }
      return null;
    }

    // Check the order inside functional component
    function checkOrder(node, body) {
      const found = [];
      for (const stmt of body) {
        const type = getBlockType(stmt);
        if (!type) continue;
        found.push({type, node: stmt});
      }
      let lastIdx = -1;
      for (let i = 0; i < found.length; i++) {
        const {type, node: n} = found[i];
        const idx = ORDER.indexOf(type);
        if (idx === -1) continue;
        if (idx < lastIdx) {
          // Find the previous block that should be after this one
          for (let j = i - 1; j >= 0; j--) {
            const prevType = found[j].type;
            const prevIdx = ORDER.indexOf(prevType);
            if (prevIdx > idx) {
              context.report({
                node: n,
                messageId: 'order',
                data: {
                  current: ORDER_LABELS[type],
                  shouldBeAfter: ORDER_LABELS[prevType],
                  expectedOrder: ORDER.map(k => ORDER_LABELS[k]).join(' → ')
                }
              });
              break;
            }
          }
          break;
        }
        lastIdx = idx;
      }
    }

    return {
      FunctionDeclaration(node) {
        if (!/^[A-Z]/.test(node.id.name)) return;
        if (!node.body || !node.body.body) return;
        checkOrder(node, node.body.body);
      },
      VariableDeclaration(node) {
        // const MyComponent = () => {} support
        for (const decl of node.declarations) {
          if (
            decl.init &&
            (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression') &&
            decl.id &&
            decl.id.type === 'Identifier' &&
            /^[A-Z]/.test(decl.id.name || '')
          ) {
            if (
              decl.init.body &&
              decl.init.body.type === 'BlockStatement' &&
              decl.init.body.body
            ) {
              checkOrder(node, decl.init.body.body);
            }
          }
        }
      }
    };
  }
};

module.exports = {
  rules: {
    order: orderRule
  }
}; 