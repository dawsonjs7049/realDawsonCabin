import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './Login/Login';
import Home from './Home/Home';
const firebase = require('firebase');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAyc3VrOy8Jh4N6VVaC5ItbUas1KbaSJCY",
  authDomain: "cabinsite-e8b6b.firebaseapp.com",
  databaseURL: "https://cabinsite-e8b6b.firebaseio.com",
  projectId: "cabinsite-e8b6b",
  storageBucket: "cabinsite-e8b6b.appspot.com",
  messagingSenderId: "950596908057",
  appId: "1:950596908057:web:6d74fe15aa56b69d5da688",
  measurementId: "G-G35VNWGXGR"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const routing = (
  <Router>
    <div id='routing-container'>
      <Route path="/" exact component={Login} />
      <Route path='/login' component={Login}></Route>
      <Route path='/home' component={Home}></Route>
    </div>
  </Router>
)

ReactDOM.render(routing,document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
