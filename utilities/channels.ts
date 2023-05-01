export interface IChannel {
  push: (newItem) => void;
  pull: () => Promise<any>;
}

export const channelFactory = () => {
  const _arrayBufferBuffer = [];
  const pullResolveQueue = [];

  return {
    push: (newItem) => {
      if (pullResolveQueue.length > 0) {
        const pull = pullResolveQueue.pop();
        pull(newItem);
      } else {
        _arrayBufferBuffer.push(newItem);
      }
    },
    pull: () =>
      new Promise((res, rej) => {
        if (_arrayBufferBuffer.length > 0) {
          res(_arrayBufferBuffer.pop());
        }
        pullResolveQueue.push(res);
      }),
    clear: () => {
      _arrayBufferBuffer.length = 0;
      pullResolveQueue.length = 0;
    },
  };
};
