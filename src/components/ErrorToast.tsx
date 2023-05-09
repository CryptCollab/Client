import { useEffect, useState } from "react";
import Toast from "react-bootstrap/Toast";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(relativeTime);
type ErrorToastProps = {
    error: string,
    index: number,
    closeHandler: (index: number) => void
}

export default function ErrorToast(props: ErrorToastProps) {
	const [show, setShow] = useState(true);
	const [currentTime] = useState(Date.now());
	const [relativeTime, setRelativeTime] = useState(dayjs(Date.now()).fromNow());
    
	//this timer is used to update the relative time every minute
	const [timer] = useState(
		setInterval(() => {
			setRelativeTime(dayjs(currentTime).fromNow());
		}, 30 * 1000)
	);

	const handleClose = () => {
		setShow(false);
		props.closeHandler(props.index);
	};
	useEffect(() => {
		return () => {
			clearInterval(timer);
		};
	}, []);


	return (
		<Toast show={show} onClose={handleClose} >
			<Toast.Header>
				<strong className="me-auto">⚠️ Error!</strong>
				<small>{relativeTime}</small>
			</Toast.Header>
			<Toast.Body>{props.error}</Toast.Body>
		</Toast>
	);
}
