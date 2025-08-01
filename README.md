# Window Message Library

A modern TypeScript library for type-safe, channel-based communication between windows (parent ↔ child, iframe ↔ parent).

## ✨ Features

- 🔒 **Type-safe messaging** - Full TypeScript support with request/response typing
- 🚀 **Channel-based architecture** - Organized communication with named channels
- 🎯 **Promise-based API** - Clean async/await pattern for requests
- 🛡️ **Origin validation** - Built-in security checks
- 🔄 **Automatic setup** - Handles window communication setup automatically
- 📝 **Request/Response pattern** - Structured bi-directional communication
- 🚫 **Error handling** - Comprehensive error handling with stack traces

##  Quick Start

### Installation

```bash
npm install @wuchuheng/window-message
```

### Simple Example

**1. Create a channel:**
```typescript
import { createChannel } from '@wuchuheng/window-message';

const channel = createChannel('/greeting');
```

**2. Send messages (Parent Window):**
```typescript
const childWindow = window.open('child.html');
await channel.request({ name: 'John' }, childWindow);
```

**3. Handle messages (Child Window):**
```typescript
channel.handle(async (request) => {
  alert(`Hello, ${request.name}!`);
});
```

### Try it yourself

```bash
npm run example
```

Visit `http://localhost:8080/examples/` to see live demos.

## 📖 API

### `createChannel<Request, Response>(name)`
Creates a communication channel.

### `channel.request(data, window)`
Send a message and wait for response.

### `channel.handle(callback)`
Handle incoming messages.
