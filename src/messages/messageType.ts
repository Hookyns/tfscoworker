/**
 * Message type enum
 */
export enum MessageType {
	Connect = 0,
	
	// Handshake request
	Handshake = 1,
	
	// Handshake response
	HandshakeStatus = 2,
	
	// Disconnect message - initiated from server -> kick
	Disconnect = 3,
	
	// Client requests list of its tasks
	ListMyTasks = 4,
}