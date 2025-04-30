import { useState } from 'react'
import './App.css'
import Result from './Result'
import ExecResult from './ExecResult'
import ExecInput from './ExecInput'
import AccountManager from './AccountManager'
import Home from './Home'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home_Designed from './Home_Designed'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage-accounts" element={<AccountManager />} />
        <Route path="/results" element={<ExecResult />} />
      </Routes>
    </Router>
  );
}

export default App;