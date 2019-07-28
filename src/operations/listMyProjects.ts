import DesktopClient from "../desktopClient";
import TfsService from "../tfsService";
import {IListMyProjectsMessage, IProjectListMessage} from "../messages/baseMessages";
import {MessageType} from "../messages/messageType";

export default function listMyProjects(message: IListMyProjectsMessage, client: DesktopClient, tfsService: TfsService) {
	try {
		let projects = [];

		for (let project of client.workContext.memberInfo.projects) {
			let projInfo = Object.assign({}, project);
			projInfo.members = [];
			projects.push(projInfo);
		}

		client.send<IProjectListMessage>({
			Type: MessageType.ProjectsList,
			Projects: projects
		});
	} catch (err) {
		client.send<IProjectListMessage>({
			Type: MessageType.ProjectsList,
			Projects: null,
			Error: err.message
		});
	}
} 