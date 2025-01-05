import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

const TimeInput = ({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  isEditing,
  onStartEdit,
  onEndEdit,
}: {
  minutes: string;
  seconds: string;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
}) => {
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const handleMinutesChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (parseInt(numbers) > 99) {
      onMinutesChange("99");
      secondsRef.current?.focus();
      secondsRef.current?.select();
    } else {
      onMinutesChange(numbers.slice(0, 2));
      if (numbers.length >= 2) {
        secondsRef.current?.focus();
        secondsRef.current?.select();
      }
    }
  };

  const handleSecondsChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (parseInt(numbers) >= 60) {
      onSecondsChange("59");
    } else {
      onSecondsChange(numbers);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "minutes" | "seconds"
  ) => {
    if (e.key === "Enter") {
      const newMinutes = minutes.padStart(2, "0");
      const newSeconds = seconds.padStart(2, "0");
      onMinutesChange(newMinutes);
      onSecondsChange(newSeconds);
      onEndEdit();
    } else if (e.key === "ArrowRight" && type === "minutes") {
      secondsRef.current?.focus();
      secondsRef.current?.select();
    } else if (e.key === "ArrowLeft" && type === "seconds") {
      minutesRef.current?.focus();
      minutesRef.current?.select();
    }
  };

  if (!isEditing) {
    return (
      <div
        className="text-2xl cursor-pointer hover:text-primary flex items-center"
        onClick={onStartEdit}
      >
        {minutes.padStart(2, "0")}:{seconds.padStart(2, "0")}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Input
        ref={minutesRef}
        type="text"
        value={minutes}
        onChange={(e) => handleMinutesChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "minutes")}
        className="text-2xl w-14 text-center p-1"
        autoFocus
      />
      <span className="text-2xl">:</span>
      <Input
        ref={secondsRef}
        type="text"
        value={seconds}
        onChange={(e) => handleSecondsChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "seconds")}
        className="text-2xl w-14 text-center p-1"
      />
    </div>
  );
};

function Timer() {
  const initialTime = 5 * 60;
  const [configuredTime, setConfiguredTime] = useState<number>(initialTime);
  const [timeLeft, setTimeLeft] = useState<number>(configuredTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editMinutes, setEditMinutes] = useState<string>("05");
  const [editSeconds, setEditSeconds] = useState<string>("00");
  const [audio] = useState<HTMLAudioElement>(new Audio("/notification.mp3"));
  const workerRef = useRef<Worker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createNewTimerWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current?.terminate();
      workerRef.current = null;
    }
    workerRef.current = new Worker(
      new URL("../workers/timerWorker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = setOnMessageForTimerWorker;
  }, [audio, configuredTime]);

  const setOnMessageForTimerWorker = useCallback((e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
      case "TICK":
        setTimeLeft(payload.timeLeft as number);
        break;
      case "COMPLETED":
        setTimeLeft(configuredTime);
        audio.pause();
        audio.currentTime = 0;
        audio.play();
        break;
    }
  }, [audio, configuredTime]);
  
  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.onmessage = setOnMessageForTimerWorker;
  }, [audio, configuredTime]);

  useEffect(() => {
    createNewTimerWorker();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isEditing
      ) {
        handleEndEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, editMinutes, editSeconds]);
  
  const toggleTimer = useCallback(() => {
    if (!workerRef.current) return;

    if (isRunning) {
      createNewTimerWorker();
    } else {
      workerRef.current.postMessage({
        type: "START",
        payload: { timeLeft },
      });
    }
    setIsRunning(!isRunning);
  }, [isRunning, timeLeft]);

  const resetTimer = useCallback(() => {
    createNewTimerWorker();
    setTimeLeft(configuredTime);
    setIsRunning(false);
  }, [configuredTime]);

  const formatTime = (
    seconds: number
  ): { minutes: string; seconds: string } => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const handleStartEdit = () => {
    if (!isRunning) {
      const { minutes, seconds } = formatTime(configuredTime);
      setEditMinutes(minutes);
      setEditSeconds(seconds);
      setIsEditing(true);
    }
  };

  const handleEndEdit = useCallback(() => {
    const minutes = parseInt(editMinutes || "0");
    const seconds = parseInt(editSeconds || "0");
    const newTime = minutes * 60 + seconds;
    setConfiguredTime(newTime);
    if (!isRunning) {
      setTimeLeft(newTime);
      // No need to send RESET here, just update the states
    }
    setIsEditing(false);
  }, [editMinutes, editSeconds]);

  const currentTime = formatTime(timeLeft);
  const displayTime = formatTime(configuredTime);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-2" ref={containerRef}>
            <div className="text-6xl font-mono">
              {currentTime.minutes}:{currentTime.seconds}
            </div>
            <span className="text-2xl text-muted-foreground">/</span>
            <TimeInput
              minutes={isEditing ? editMinutes : displayTime.minutes}
              seconds={isEditing ? editSeconds : displayTime.seconds}
              onMinutesChange={setEditMinutes}
              onSecondsChange={setEditSeconds}
              isEditing={isEditing}
              onStartEdit={handleStartEdit}
              onEndEdit={handleEndEdit}
            />
          </div>
          <div className="flex space-x-4">
            <Button onClick={toggleTimer} size="lg" className="w-24">
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="w-24"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Timer;
