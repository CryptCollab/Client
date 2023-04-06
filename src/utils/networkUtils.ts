import { AxiosInstance } from "axios";
import { cryptoUtils } from "../App";
import { UserLoginDataState } from "../features/userData/userLoginData-slice";

export const sendPreKeyBundleToServer = async (userData: UserLoginDataState, axios:AxiosInstance) => { 
    const preKeyBundle = await cryptoUtils.setIdentityAndReturnPreKeyBundle(userData.userData?.userID as string);
    console.log(userData.userData?.userID)
    const response = await axios.post("/api/prekeybundle", preKeyBundle);
    // if(response.status === 200) {
    //     console.log("PreKeyBundle sent to server");
    // }
    // else {
    //     console.log("PreKeyBundle not sent to server");
    // }
}