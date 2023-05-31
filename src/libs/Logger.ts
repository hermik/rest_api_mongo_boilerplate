import chalk from 'chalk';
export default class Logger {
	public static log = (message: any) => {
		console.log(message);
		console.log(chalk.magenta(this.injectTimestamp(message)));
	};
	public static info = (message: any) => {
		console.log(chalk.blue(this.injectTimestamp(message)));
	};
	public static warn = (message: any) => {
		console.log(chalk.yellow(this.injectTimestamp(message)));
	};
	public static error = (message: any) => {
		console.log(chalk.red(this.injectTimestamp(message)));
	};
	private static injectTimestamp(message: string) {
		return `[${new Date().toLocaleString()}] ` + message;
	}
}
