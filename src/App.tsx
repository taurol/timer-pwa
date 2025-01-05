import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Timer from "./pages/Timer";

function App() {
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isPWA ? <Navigate to="/timer" /> : <Home />} />
        <Route
          path="/timer"
          element={isPWA ? <Timer /> : <Navigate to="/" />}
          //element={<Timer />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
