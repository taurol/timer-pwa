let timer: number | null = null;
let configuredTime: number = 0
let timeLeft: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  console.log('Worker received:', type, payload);

  switch (type) {
    case 'START':
      configuredTime = payload.timeLeft;
      timeLeft = payload.timeLeft;
      startTimer();
      break;
  }
};

function startTimer() {
  if (timer) return;
  
  timer = self.setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0) {
      timeLeft = configuredTime
      self.postMessage({ type: 'COMPLETED' });
      return;
    }
    
    self.postMessage({ type: 'TICK', payload: { timeLeft } });
    console.log("timeleft is: ", timeLeft)
  }, 1000);
}
