import { useEffect, useRef } from "react";
import styles from "../styles/loader.module.css"
import { LoadingBarRef } from 'react-top-loading-bar'
export default function Loader() {
    const ref: React.Ref<LoadingBarRef> = useRef(null)
    useEffect(() => {
        ref.current?.continuousStart();
        return () => {
            ref.current?.complete();
        }
    }, [])


    return (
        <div className={styles.root}>
            <object data="loader.svg" type="image/svg+xml" />
        </div>
    )

}
