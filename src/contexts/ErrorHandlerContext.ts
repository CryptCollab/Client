import { createContext } from "react";
interface ErrorContextType {
    errors: string[];
    setErrors: React.Dispatch<React.SetStateAction<string[]>>
}
export const ErrorHandlerContext = createContext<ErrorContextType>({ errors: [], setErrors: () => { console.warn("Default Context Value is being used"); } });

export default ErrorHandlerContext;