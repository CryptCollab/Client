import { useEffect } from "react";
import { useLoadingContext } from "react-router-loading";



export default function useLoadingDone() {
    const loadingContext = useLoadingContext();

    useEffect(() => {
        console.log("useLoadingDone");
        loadingContext.done();
    }, []);

}
