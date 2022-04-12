import Args from './args';
import fs, { ReadStream, WriteStream } from 'fs';
import readline, { Interface } from 'readline';

/**
 * Parses an input log file and writes parsed errors into an output file.
 */
export default class Parser {
    args: Args;
    inputFileStream: ReadStream;
    outputFileStream: WriteStream;
    inputReadByLine: Interface;

    constructor(args: Args) {
        this.args = args;
    }

    public async run(): Promise<void> {
        this.loadFiles();
        this.writeToFile(await this.lineByLineProcessing())
    }

    /** Opens streams to read and write files. */
    protected loadFiles(): void {
        this.inputFileStream = fs.createReadStream(this.args.input);
        this.inputReadByLine = readline.createInterface({
            input: this.inputFileStream,
            crlfDelay: Infinity, //to recognize all instances of CR LF as a single line break
        });

        this.outputFileStream = fs.createWriteStream(this.args.output);
    }

    protected writeToFile(parsedLines: Array<ILogLine>): void {
        this.outputFileStream.write(JSON.stringify(parsedLines));
    }

    protected async lineByLineProcessing(): Promise<Array<ILogLine>> {
        let parsedLines: Array<ILogLine> = Array();

        for await (const line of this.inputReadByLine) {
            if (this.isErrorLevel(line)) {
                parsedLines.push(this.parseLine(line));
            }
        }

        return parsedLines;
    }

    protected isErrorLevel(line: string): Boolean {
        const endOfDateTime: number = 24;
        return line.indexOf(' - error - ') === endOfDateTime;
    }

    /**
     * Transforms log line into an Object.
     * @param line string like 2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}
     * @returns [{"timestamp": <Epoch Unix Timestamp>, "logLevel": "<logLevel>", "transactionId: "<UUID>", "err": "<Error message>" }]
     */
    protected parseLine(line: string): ILogLine {
        const parsedLine: RegExpMatchArray | null = line.match(this.logLineRegExp());

        const dateTime: string = parsedLine?.groups?.dateTime ?? '';
        const date: Date = new Date(dateTime);

        const detailsJson: string = parsedLine?.groups?.detailsJson ?? '';
        const details: { [key: string]: string } = JSON.parse(detailsJson);

        return {
            "timestamp": date.valueOf(),
            "logLevel": parsedLine?.groups?.logLevel ?? '',
            "transactionId": details?.transactionId ?? '',
            "err": details?.err ?? '',
        };
    }

    /**
     * A complex RegExp to parse the log line.
     * @returns RegExp with groups: dateTime, logLevel, detailsJson
     */
    protected logLineRegExp(): RegExp {

        const dateTime: RegExp = /^(?<dateTime>\d\d\d\d\-\d\d\-\d\dT\d\d:\d\d\:\d\d\.\d\d\dZ)/;
        const logLevel: RegExp = /(?<logLevel>\w+)/;
        const detailsJson: RegExp = /(?<detailsJson>{.*}$)/;

        return new RegExp(
            dateTime.source
            + ' - ' +
            logLevel.source
            + ' - ' +
            detailsJson.source
        );
    }

}

interface ILogLine extends Object {
    timestamp: number;
    logLevel: string;
    transactionId: string;
    err: string;
}