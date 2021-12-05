import express, { Request, Response } from "express";
import { Player } from "./player.interface";

export const Players : {[id:string]: Player} = {};
export const playerRouter = express.Router();

playerRouter.get("/", async (req: Request, res: Response) => {
	try {
	  res.status(200).send(Players);
	} catch (e) {
	  res.status(500).send(e.message);
	}
});

playerRouter.get("/count", async (req: Request, res: Response) => {
	try {
	  res.status(200).send(Players.length);
	} catch (e) {
	  res.status(500).send(e.message);
	}
});

playerRouter.get("/:id", async (req: Request, res: Response) => {
	try {
	  res.status(200).send(Players[req.params.id]);
	} catch (e) {
	  res.status(500).send(e.message);
	}
});