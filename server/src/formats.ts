import express, { Request, Response } from "express";
export const formatRouter = express.Router();

export enum Format {
	Gladiator,
	Freeform,
}

export enum FormatStructure {
	Any,
	BO1,
	BO3,
}

formatRouter.get("/", async (req: Request, res: Response) => {
	try {
		res.status(200).send(
			Object.values(Format).filter((x) => typeof x === "string")
		);
	} catch (e) {
		res.status(500).send(e.message);
	}
});

formatRouter.get("/structures", async (req: Request, res: Response) => {
	try {
		res.status(200).send(
			Object.values(FormatStructure).filter((x) => typeof x === "string")
		);
	} catch (e) {
		res.status(500).send(e.message);
	}
});
