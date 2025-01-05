export interface TimerState {
    isRunning: boolean;
    timeLeft: number;
    lastUpdate: number;
  }
  
  export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }