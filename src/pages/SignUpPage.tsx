import { Link } from 'react-router-dom'
import styles from '../styles/app.module.css'


export default function Login() {
    return (
        <div className={styles.main}>
            Registration Page<br />
            <form>
                <label htmlFor="usernameInputBox">Username: </label>
                <input id="usernameInputBox" type="text" name="usernameInputBox" /><br />
                <label htmlFor="passwordInputBox">Password: </label>
                <input id="passwordInputBox" type="password" name="passwordInputBox" /><br />
                <input id="submitButton" type="submit" value="Login" /><br />
            </form><br />
            <span>Already registered? Login <Link to="/login">here</Link></span>

        </div>
    )
}
