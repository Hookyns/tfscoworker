import Application from "./src/application";
import Log, {LogLevel} from "./src/log";

// Setup logging
Log.setLoggers({
	errorLogger: console.error,
	warnLogger: console.warn,
	infoLogger: console.log,
	talkativeLogger: console.log,
	debugLogger: console.debug
});
Log.setLogLevel(LogLevel.Debug);

// Initialize application
Application.initialize()
	.then(() => {
		Log.info("Application initialized");
	});