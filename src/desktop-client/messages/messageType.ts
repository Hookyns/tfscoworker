/**
 * Message type enum
 */
export enum MessageType {
	// Not used
	Connect = 0,
	
	// Handshake request
	Handshake = 1,
	
	// Handshake response
	HandshakeStatus = 2,
	
	// Not used; Disconnect message - initiated from server -> kick
	Disconnect = 3,
	
	// Client requests list of its projects
	ListMyProjects = 4,

	// Response with list of projects
	ProjectsList = 5,
	
	// Client requests list of its tasks
	ListMyTasks = 6,
	
	// Response with list of tasks
	TasksList = 7,
	
	// Apply work span - update work progress
	ApplyWorkSpan = 8,
	
	// Result of work span apply
	WorkSpanApplyResult = 9,
	
	// Client requests detailed work time, split to days, of task
	ListTaskPerDayWork = 10,
	
	// Detailed work time, split to days, of task
	TaskPerDayWork = 11,

	// Create new task
	CreateTask = 12,

	// Task created notice
	TaskCreated = 13,

	// List task states
	ListTaskStates = 14,

	// List of task statesN
	TaskStatesList = 15,



	// Task removed
	TaskRemoved = 101,

	// New task assigned to client
	TaskAssigned = 102,

	// Task reassigned to somebody else
	TaskReassigned = 103,




}