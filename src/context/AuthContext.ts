import { createContext } from "react";
export const AuthContext = createContext<AuthContextType>({ userData: null, setUserData: () => { console.warn("Default Context Value is being used") } });

export default AuthContext;