import React, {FC, ReactEventHandler, useEffect, useMemo, useRef, useState} from 'react';
import './App.css';
import { HashRouter, Routes, Route } from "react-router";
import { Home } from './pages/Home';
import {ImportRip} from './pages/ImportRip'
import { RipVideo } from './pages/Rip'
import { ViewRip } from './pages/ViewRip'

function App() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rip/:hash" element={<RipVideo />} />
      <Route path="/import-rip" element={<ImportRip />} />
      <Route path="/view-rip/:hash" element={<ViewRip />} />
    </Routes>
  </HashRouter>
}

export default App;
