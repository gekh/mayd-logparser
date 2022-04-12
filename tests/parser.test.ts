import Args from "../src/args";
import Parser from "../src/parser";

describe('parser testing', () => {

    beforeAll(() => {
        process.argv = [
            '/usr/local/Cellar/node/17.8.0/bin/node',
            '/Users/h/dev/mayd-logparser/parser.js',
            '--input',
            './app.log',
            '--output',
            './errors.json'
        ];
    });

    it('should return RegExp', () => {
        const parser: Parser = new Parser(new Args());

        expect(parser['logLineRegExp']()).toStrictEqual(
            /^(?<dateTime>\d\d\d\d\-\d\d\-\d\dT\d\d:\d\d\:\d\d\.\d\d\dZ) - (?<logLevel>\w+) - (?<detailsJson>{.*}$)/
        );

        expect(parser['logLineRegExp']()).toBeInstanceOf(RegExp);
    });

    it('should parse the line', () => {
        const parser: Parser = new Parser(new Args());
        const line: string = '2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}';

        expect(parser['parseLine'](line)).toStrictEqual(
            {
                "timestamp": 1628475171259,
                "logLevel": "error",
                "transactionId": "9abc55b2-807b-4361-9dbe-aa88b1b2e978",
                "err": "Not found"
            }
        );
    });

    it('should test isErrorLevel', () => {
        const parser: Parser = new Parser(new Args());

        let line: string = '2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}';
        expect(parser['isErrorLevel'](line)).toBe(true);

        line = '2021-08-09T02:12:51.264Z - warn - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Service finished with error","code":404,"err":"Cannot find user orders list"}';
        expect(parser['isErrorLevel'](line)).toBe(false);
    });

});
