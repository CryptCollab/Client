import useProtectedAxios from "../hooks/useProtectedAxios";




export default function DashBoard() {
	const protectedAxios = useProtectedAxios();
	const createDocument = async () => {
		const data = await protectedAxios.get("/api/document");
		console.log(data.data);
	};
	return (<>
		<div>DashBoard</div>
		<button onClick={createDocument}>Create Document</button>
	</>
	);
}
