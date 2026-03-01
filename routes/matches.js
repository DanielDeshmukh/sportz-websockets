import { Router } from 'express';
import {matches} from "../src/db/schema.js";

import {db} from "../src/db/db.js";
import {createMatchSchema, listMatchesQuerySchema, MATCH_STATUS} from "../src/validation/matches.js";
import {getMatchStatus} from "../src/utils/match-status.js";
import {desc} from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if(!parsed.success){
        return res.status(400).json({message: "Validation query", errors: parsed.error.issues})
    }
    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try{
        const data = await db
            .select()
            .from(matches)
            .orderBy((desc(matches.createdAt)))
            .limit(limit)
        return res.json({data})
    } catch (e){
        res.status(500).json({error: "Failed to fetch matches"})
    }
})

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body)
    
    if(!parsed.success){
        return res.status(400).json({message: "Validation failed", errors: parsed.error.issues})
    }
    
    const {startTime, endTime, homeScore, awayScore} = parsed.data;
    
    try{
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),

        }).returning();

        try {
            if (res.app.locals.broadcastMatchCreated) {
                res.app.locals.broadcastMatchCreated(event);
            }
        } catch (error) {
            console.error("Error broadcasting match creation:", error);
        }
        return res.status(201).json({data: event});
    } catch (e){
        console.error("Failed to create match:", e);
        res.status(500).json({message:"Failed to create match Something went wrong"})
    }
})