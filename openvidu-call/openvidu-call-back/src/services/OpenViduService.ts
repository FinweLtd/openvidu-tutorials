import { Connection, ConnectionProperties, OpenVidu, Recording, Session, SessionProperties } from "openvidu-node-client";
import { OPENVIDU_URL, OPENVIDU_SECRET } from '../config';

export class OpenViduService {

    private openvidu: OpenVidu;

	constructor(){
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

	public createSession(sessionId: string): Promise<Session> {
        console.log("Creating session: ", sessionId);
        let sessionProperties: SessionProperties = {customSessionId: sessionId};
        return this.openvidu.createSession(sessionProperties);
	}

	public createConnection(session: Session, nickname: string): Promise<Connection> {
        console.log(`Requesting token for session ${session.sessionId}`);
        let connectionProperties: ConnectionProperties = {}
        if(!!nickname) {
            connectionProperties.data = JSON.stringify({ openviduCustomConnectionId: nickname });
        }
        console.log('Connection Properties:', connectionProperties);
        return session.createConnection(connectionProperties);
    }

    public async startRecording(sessionId: string): Promise<Recording> {
        return await this.openvidu.startRecording(sessionId);
    }

    public stopRecording(recordingId: string): Promise<Recording> {
        return this.openvidu.stopRecording(recordingId);
    }
}
