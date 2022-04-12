import Args from "../src/args";

describe('args testing', () => {
    it('should fetch two arguments', () => {
        process.argv = [
            '/usr/local/Cellar/node/17.8.0/bin/node',
            '/Users/h/dev/mayd-logparser/parser.js',
            '--input',
            './app.log',
            '--output',
            './errors.json'
          ];

          const args: Args = new Args();

          expect(args.input).toBe('./app.log');
          expect(args.output).toBe('./errors.json');
    })

    it('should throw an error', () => {
        process.argv = [
            '/usr/local/Cellar/node/17.8.0/bin/node',
            '/Users/h/dev/mayd-logparser/parser.js',
            '--input',
            './app.log',
            // '--output',
            // './errors.json'
          ];
          
        expect(() => new Args()).toThrow(Error);
    });
});