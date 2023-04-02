import { useNavigate } from "react-router-dom";
import useProtectedAxios from "../hooks/useAxios";




export default function DashBoard() {
	const protectedAxios = useProtectedAxios();
	const navigate = useNavigate();
	const createDocument = async () => {
		const data = await protectedAxios.post("/api/document", {
			userID: "01GWP2QD2CB59BDDT76JWQB0SG",
		});
		console.log(data.data);
		navigate("/document/" + data.data);
	};
	return (<>
		<div>DashBoard</div>
		<button onClick={createDocument}>Create Document</button>
	</>
	);
}
