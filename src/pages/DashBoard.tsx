import axios from "axios"
import user from "../hooks/useAuth"




export default function DashBoard() {
    const createDocument = async () => {
        const userData = user();
        await axios.post("/api/document", {
            userID: userData.userData?.userName,
        })
    }
    return (<>
        <div>DashBoard</div>
        <button onClick = {createDocument}>Create Document</button>
    </>
    )
}
