import { useState } from 'react'
import './App.css'
import Result from './Result'
import ExecResult from './ExecResult'
import ExecInput from './ExecInput'
import AccountManager from './AccountManager'
import Home from './Home'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage-accounts" element={<AccountManager />} />
        <Route path="/result" element={<ExecResult />} />
      </Routes>
    </Router>
  );
}

export default App;