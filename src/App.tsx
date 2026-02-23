import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Gate from "@/pages/Gate";
import Dashboard from "@/pages/Dashboard";
import Course from "@/pages/Course";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/unit/:courseUid" element={<Course />} />
      </Routes>
    </Router>
  );
}
