# Simple Examples

This directory contains simple, focused examples that use the actual built library.

## � Quick Start

```bash
npm run example
```

This will build the library and start a local server at `http://localhost:8080`

## � Examples

### `index.html` - Overview Page
- Navigate between all examples
- Quick start guide
- Feature overview

### `parent.html` + `child.html` - Window Communication
**Parent Side (Request):**
```javascript
import { createChannel } from '/dist/index.mjs';

const greetingChannel = createChannel('/greeting');
await greetingChannel.request({ name: 'John' }, childWindow);
```

**Child Side (Handler):**
```javascript
import { createChannel } from '/dist/index.mjs';

const greetingChannel = createChannel('/greeting');
greetingChannel.handle(async (request) => {
  alert(`Hello, ${request.name}!`);
});
```

### `iframe-simple.html` + `iframe-content.html` - Iframe Communication
Same API, works with iframes:
```javascript
const messageChannel = createChannel('/message');
await messageChannel.request({ text: 'Hello!' }, iframe.contentWindow);
```

### `test-library.html` - Library Test
Verifies the built library is working correctly.

## 🎯 Key Points

1. **Uses actual built library** - All examples import from `/dist/index.mjs`
2. **Simple patterns** - Just like your code snippets
3. **Two sides** - Request side and Handler side
4. **Real TypeScript** - Full type safety when using TypeScript

## 💡 Your Usage Pattern

Your examples match this library perfectly:

```typescript
// Your code:
export const addClothingSizeInfo = windowMessage.createChannel<
  ClothingSizeInfoType,
  void
>("/clothingSizeInfo/add")

// Request side:
addClothingSizeInfo
  .request(type, iframeRef.current?.contentWindow)
  .then(() => onComplete())

// Handler side:
addClothingSizeInfo.handle(async (request) => {
  switch (request) {
    case ClothingSizeInfoType.Men:
      await createSizeInfo(menInternationalSizeInfo)
      break
  }
})
```

That's exactly how this library works! 🎉
