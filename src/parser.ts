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

    public run() {
        this.loadFiles();
        this.lineByLineProcessing();
    }

    protected loadFiles() {
        this.inputFileStream = fs.createReadStream(this.args.input);
        this.outputFileStream = fs.createWriteStream(this.args.output);
        this.readLine = readline.createInterface({
            input: this.inputFileStream,
            crlfDelay: Infinity, //to recognize all instances of CR LF as a single line break
        });
    }

    protected async lineByLineProcessing() {

        for await (const line of this.readLine) {

            const regex = /.* - error - \{.*\}/g; // regex to look exactly at the log level type

            // [{"timestamp": <Epoch Unix Timestamp>, "loglevel": "<loglevel>", "transactionId: "<UUID>", "err": "<Error message>" }]

            // [{"timestamp":1628475171259,"loglevel":"error","transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","err":"Not found"}]


            if (line.match(regex)) {

                console.log(line);

            }
        }
    }

}