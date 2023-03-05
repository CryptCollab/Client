import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from '../styles/app.module.css'
import useAuth from '../hooks/useAuth';

export default function Login() {
    const user = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // login user and store user data in redux store
    // redirect to requested page
    const handleLoginClick = () => {
        user.loginUser({});
        const redirectURL: string = searchParams.get('redirectURL') ?? "/dashboard";
        console.log(redirectURL)
        navigate(redirectURL)
    }

    return (
        <div className={styles.main}>
            Welcome back! Please login to continue<br />
            <form onSubmit={event => event.preventDefault()}>
                <label htmlFor="usernameInputBox">Username: </label>
                <input id="usernameInputBox" type="text" name="usernameInputBox" /><br />
                <label htmlFor="passwordInputBox">Password: </label>
                <input id="passwordInputBox" type="password" name="passwordInputBox" /><br />
                <input id="submitButton" onClick={handleLoginClick} type="submit" value="Login" /><br />
            </form><br />
            <span> New User? Sign up <Link to="/register">here</Link></span>
        </div>
    )
}
