Auto Arrange
====
#### Rete.js plugin

```js
import AutoArrangePlugin from 'rete-auto-arrange-plugin';

editor.use(AutoArrangePlugin, { margin: {x: 50, y: 50 }, depth: 0 }); // depth - max depth for arrange (0 - unlimited)

editor.arrange(node);
```