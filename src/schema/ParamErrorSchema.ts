import * as yup from "yup";

const ParamErrorListSchema = yup.array().of(
	yup.object({
		param: yup.string().required(),
		msg: yup.string().required(),
		location: yup.string()
	})
).required();

export interface ParamError {
    param: string,
    msg: string,
    location: string
}

export default ParamErrorListSchema;