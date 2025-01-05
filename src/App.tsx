import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Timer from "./pages/Timer";
import { useEffect, useState } from "react";

function App() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(window.matchMedia("(display-mode: standalone)").matches);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isPWA ? <Navigate to="/timer" /> : <Home />} />
        <Route
          path="/timer"
          //element={isPWA ? <Timer /> : <Navigate to="/" />}
          element={<Timer />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
