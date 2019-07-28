import TeamMemberInfo from "./teamMemberInfo";

export default class WorkContext
{
	/**
	 * Member info
	 */
	private readonly _memberInfo: TeamMemberInfo;

	/**
	 * Member info
	 */
	get memberInfo(): TeamMemberInfo
	{
		return this._memberInfo;
	}
	
	/**
	 * Ctor
	 * @param memberInfo
	 */
	constructor(memberInfo: TeamMemberInfo)
	{
		this._memberInfo = memberInfo;
	}
}