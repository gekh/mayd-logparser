import minimist from 'minimist';

/**
 * A decorator for minimist.
 * Extracts command line arguments for input and output files.
 */
export default class Args {

    input: string;
    output: string;

    constructor() {
        this.init();
    }

    private init() {
        const args = minimist(process.argv.slice(2));

        if (!args.input) {
            throw new Error('There should be an input argument.');
        }
        
        if (!args.output) {
            throw new Error('There should be an output argument.');
        }

        this.input = args.input;
        this.output = args.output;
    }
}