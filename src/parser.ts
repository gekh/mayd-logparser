import Args from './args';
import fs, { ReadStream, WriteStream } from 'fs';
import readline, { Interface } from 'readline';

export default class Parser {
    args: Args;
    inputFileStream: ReadStream;
    outputFileStream: WriteStream;
    readLine: Interface;

    constructor(args: Args) {
        this.args = args;
    }

    public async run(): Promise<void> {
        this.loadFiles();
        this.writeToFile(await this.lineByLineProcessing())
    }

    protected loadFiles(): void {
        this.inputFileStream = fs.createReadStream(this.args.input);
        this.outputFileStream = fs.createWriteStream(this.args.output);

        this.readLine = readline.createInterface({
            input: this.inputFileStream,
            crlfDelay: Infinity, //to recognize all instances of CR LF as a single line break
        });
    }

    protected writeToFile(parsedLines: Array<ILogLine>): void {
        console.log(JSON.stringify(parsedLines))
    }

    protected async lineByLineProcessing(): Promise<Array<ILogLine>> {
        let parsedLines: Array<ILogLine> = Array();
        for await (const line of this.readLine) {
            if (this.isError(line)) {
                // this.writeToFile(this.parseLine(parsedLines));
                parsedLines.push(this.parseLine(line));
            }
        }

        return parsedLines;
    }

    protected isError(line: string): Boolean {
        const regEx = /.* - error - \{.*\}/g; // regex to look exactly at the log level type
        return regEx.test(line);
    }

    /**
     * Transforms log line into an Object.
     * @param line string like 2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}
     * @returns [{"timestamp": <Epoch Unix Timestamp>, "loglevel": "<loglevel>", "transactionId: "<UUID>", "err": "<Error message>" }]
     */
    protected parseLine(line: string): ILogLine {
        const parsedLine = line.match(this.logLineRegExp());

        const datetime: string = parsedLine?.groups?.datetime ?? '';
        const date: Date = new Date(datetime);

        const detailsJson: string = parsedLine?.groups?.detailsJson ?? '';
        const details = JSON.parse(detailsJson)

        return {
            "timestamp": date.valueOf(),
            "loglevel": parsedLine?.groups?.loglevel ?? '',
            "transactionId": details?.transactionId ?? '',
            "err": details?.err ?? '',
        };
    }

    /**
     * A complex RegExp to parse the log line.
     * @returns RegExp with groups: datetime, loglevel, detailsJson
     */
    protected logLineRegExp(): RegExp {

        const datetime = /^(?<datetime>\d\d\d\d\-\d\d\-\d\dT\d\d:\d\d\:\d\d\.\d\d\dZ)/;
        const loglevel = /(?<loglevel>\w+)/;
        const detailsJson = /(?<detailsJson>{.*}$)/;

        return new RegExp(
            datetime.source
            + ' - ' +
            loglevel.source
            + ' - ' +
            detailsJson.source
        );
    }

}

interface ILogLine extends Object {
    timestamp?: number;
    loglevel?: string;
    transactionId?: string;
    err?: string;
}