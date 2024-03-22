import { useEffect } from "react";
import { useLoadingContext } from "react-router-loading";



export default function useLoadingDone() {
	const loadingContext = useLoadingContext();

	const loadingDone = () => {
		loadingContext.done();
	};
	return loadingDone;
}
