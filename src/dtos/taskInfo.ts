export default interface TaskInfo {
	Id: number | undefined;

	Title: string;
	
	State: string;

	Activity: string;
	
	EstimatedWork: number;
	
	CompletedWork: number;
	
	RemainingWork: number;
	
	Tags: Array<string>;
}