#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program }  = require('commander');
const ora = require('ora');
const pkg = require('../package.json');
const { main, RESULT_FILE } = require('../index');

const notify = ora();

program
    .version(pkg.version)
    .usage('<command>')
    .description('Make your kindle highlights to be a web page and easy to read.');

program
    .command('parse <clippingFilePath>')
    .option('-t, --template <file path>', 'custom template path')
    .description('Analyze the clippings file you pass.')
    .action((filePath, options) => {
        let customTemplateFile = options.template ? path.resolve(process.cwd(), options.template) : '';

        const target = path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(target)) {
            notify.info('File does not exist');
            return;
        }

        if (!fs.statSync(target).isFile()) {
            notify.info('Path is not a file');
            return;
        }

        if (customTemplateFile && !fs.existsSync(customTemplateFile)) {
            notify.info('template File does not exist');
            return;
        }

        try {
            main(target, customTemplateFile);
            notify.succeed(`Finished! The result is generated at ${RESULT_FILE}`);
        } catch (error) {
            notify.fail(`Failed for some reasons: ${error}`);
        }
    });

program.parse(process.argv);