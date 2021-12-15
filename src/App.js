import React from 'react';
import Login from './Login/Login';
import Home from './Home/Home';
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <PrivateRoute exact path="/" component={Home} />
        </Switch>
      </AuthProvider>
    </Router>
    
  );
}

export default App;
