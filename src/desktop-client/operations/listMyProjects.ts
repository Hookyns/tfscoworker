import DesktopClient from "../desktopClient";
import TfsService from "../../tfs-api/tfsService";
import {IListMyProjectsMessage, IProjectListMessage} from "../messages/messageInterfaces";
import {MessageType} from "../messages/messageType";

export default async function listMyProjects(message: IListMyProjectsMessage, client: DesktopClient, tfsService: TfsService) {
	try {
		let projects = [];

		for (let project of client.workContext.memberInfo.projects) {
			let projInfo = Object.assign({}, project);
			projInfo.members = [];
			projects.push(projInfo);
		}

		await client.send<IProjectListMessage>({
			type: MessageType.ProjectsList,
			projects: projects
		});
	} catch (err) {
		await client.send<IProjectListMessage>({
			type: MessageType.ProjectsList,
			projects: null,
			error: err.message
		});
	}
} 