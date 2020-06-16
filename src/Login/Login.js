import React, { useState } from 'react';
import styles from './styles.css';

const firebase = require('firebase');

const Login = (props) => {

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loginError, setLoginError] = useState('');

    const submitLogin = async (e) => {
        e.preventDefault();

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((cred) => {
                props.history.push('/home', { name: cred.user.email });
            }, err => {
                setLoginError('Server Error')
                console.log(err);
            })
    }
    
    const userTyping = (type, e) => {
        switch (type){
            case 'email':
                setEmail(e.target.value);
                break;

            case 'password': 
                setPassword(e.target.value);
                break;

            default:
                break;
        }
    }

    return (
        <div className="container">
            <div className="login-box">
                <h2>The Pigeon Koop</h2>
                <div className="form-container">
                    <form onSubmit={(e) => submitLogin(e)}>
                        <div className="username-div">
                            <input required id="email-input" spellCheck="false" type="text" placeholder="email" onChange={(e) => userTyping('email', e)} />
                            <i className="far fa-envelope"></i>
                        </div>
                        <div>
                            <input required id="password-input" spellCheck="false" type="password" placeholder="password" onChange={(e) => userTyping('password', e)} />
                            <i className="fas fa-key"></i>
                        </div>
                        {
                            loginError ? 
                                <div className='error-div'>Incorrect Credentials!</div> :
                                    null
                         }
                        <div className="button-div">
                            <button type="submit">SUBMIT</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;