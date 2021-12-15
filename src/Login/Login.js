import React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from 'react-router-dom';
import styles from './styles.css';

const Login = (props) => {

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loginError, setLoginError] = useState('');
    const { login } = useAuth();
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoginError('');

            await login(email, password);
            history.push("/");
        }
        catch {
            setLoginError('Sign in failed');
        }
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
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <div className="username-div">
                            <input required id="email-input" spellCheck="false" type="text" placeholder="email" onChange={(e) => userTyping('email', e)} />
                            <i className="far fa-envelope"></i>
                        </div>
                        <div>
                            <input required id="password-input" spellCheck="false" type="password" placeholder="password" onChange={(e) => userTyping('password', e)} />
                            <i className="fas fa-key" style={{marginBottom: "15px"}}></i>
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