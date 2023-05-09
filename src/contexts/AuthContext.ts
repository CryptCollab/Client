import { createContext } from "react";
interface AuthContextType {
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
}
export const AuthContext = createContext<AuthContextType>({ userData: null, setUserData: () => { console.warn("Default Context Value is being used"); } });

export default AuthContext;