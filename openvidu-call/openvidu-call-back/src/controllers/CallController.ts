
import * as express from 'express';
import { Request, Response } from 'express';
import { Recording, Session } from 'openvidu-node-client';
import { OpenViduService } from '../services/OpenViduService';
export const app = express.Router({
    strict: true
});

const openviduService = new OpenViduService();
const recordingMap: Map<string, string> = new Map<string,string>();

app.post('/', async (req: Request, res: Response) => {
	let sessionId: string = req.body.sessionId;
	let nickname: string = req.body.nickname;
	let createdSession: Session = null;
	console.log('Session ID received', sessionId);
	try {
		createdSession = await openviduService.createSession(sessionId);
	} catch (error) {
		handleError(error, res);
		return;
	}
	try {
		const connection = await openviduService.createConnection(createdSession, nickname);
		res.status(200).send(JSON.stringify(connection.token));
	} catch (error) {
		handleError(error, res);
	}
});

app.post('/startRecording', async (req: Request, res: Response) => {
	let sessionId: string = req.body.sessionId;
	let startingRecording: Recording = null;
	try {
		console.log(`Starting recording in ${sessionId}`);
		startingRecording = await openviduService.startRecording(sessionId);
		recordingMap.set(sessionId, startingRecording.id);
		res.status(200).send(JSON.stringify(startingRecording));
	} catch (error) {
		console.log(`Error starting recording in session ${sessionId}`)
		handleError(error, res);
		return;
	}
});

app.post('/stopRecording', async (req: Request, res: Response) => {
	let sessionId: string = req.body.sessionId;
	let stoppingRecording: Recording = null;
	const recordingId = recordingMap.get(sessionId);

	if(!!recordingId){
		try {
			console.log(`Stopping recording in ${sessionId}`);
			stoppingRecording = await openviduService.stopRecording(recordingId);
			recordingMap.delete(sessionId);
			res.status(200).send(JSON.stringify(stoppingRecording));
		} catch (error) {
			handleError(error, res);
			return;
		}
	} else {
		res.status(404).send('Session was not being recorded');
	}
});


function handleError(error: any, res: Response){
	try {
		let statusCode = parseInt(error.message);
		res.status(parseInt(error.message)).send(`OpenVidu Server returned an error to OpenVidu Call Server: ${statusCode}`)
	} catch (error) {
		res.status(503).send('Cannot connect with OpenVidu Server');
	}
}
