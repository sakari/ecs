import React, { useState } from 'react';
import './App.css';
import * as ecs from '@sakari/ecs';
import * as router from 'react-router-dom';
import * as movers from './apps/movers/movers';
import * as arrows from './apps/arrows';

function App() {
  return (
    <router.BrowserRouter>
      <div>
        <nav>
        <ul>
          <li><router.Link to="/movers">moving performance test</router.Link></li>
          <li><router.Link to="/arrows">references</router.Link></li>
        </ul>
        </nav>
      </div>
      <router.Switch>
        <router.Route path="/movers"><movers.App /></router.Route>
        <router.Route path="/arrows"><arrows.App /></router.Route>
      </router.Switch>
    </router.BrowserRouter>
  );
}

export default App;
