/// <reference types="vite/client" />
declare module "react-router-loading"
interface UserData {
    email: string;
    userName: string;
    userID: string;
    accessToken: string;
};
interface AuthContextType {
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
}

