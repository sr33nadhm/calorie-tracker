import Dashboard from "pages/Dashboard";
import Home from "pages/Home";
import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  const [user, setUser] = useState({});

  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route exact={true} strict index element={<Home setUser={setUser} />} />
          <Route exact={true} strict path="dashboard" element={<Dashboard user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
