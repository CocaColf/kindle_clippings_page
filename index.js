const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const RESULT_FILE = path.resolve(process.cwd(), 'kindle_highlights.html');
const TPL_FILE = path.resolve(__dirname, './tpl/index.html');

const MARKUP_SEPARATOR = '==========';
const LINE_SEPARATOR = '\r\n';

function parser (filePath) {
    let bookCnt = 0;
    let markUpCnt = 0;
    let mapping = {};

    const ctx = fs.readFileSync(filePath, 'utf-8');

    const markupArr = ctx.split(MARKUP_SEPARATOR);

    for (let singleMarkup of markupArr) {
        const markupInfo = removeEmptyElement(singleMarkup.split(LINE_SEPARATOR));
        if (!markupInfo.length) continue;

        const {
            simpleBookName,
            position,
            clippingTime,
            markupCtx,
        } = handleComment(markupInfo);

        if (!mapping[simpleBookName]) {
            mapping[simpleBookName] = [];
            bookCnt++;
        }
        if (markupCtx) {
            mapping[simpleBookName].push({
                position,
                clippingTime,
                markupCtx,
            });
            markUpCnt++;
        }
    }

    return {
        bookCnt,
        markUpCnt,
        allData: mapping,
    };
}

function handleComment (markupInfo) {
    const [bookName, info, markupCtx] = markupInfo;
    const simpleBookName = bookName.replaceAll(/\([\s\S]+\)/g, '');
    const [positionDesc, splitFlag, clippingTime] = info.split(/(\s\|\s)/g);
    const position = positionDesc.match(/#\d{1,}-{0,}\d{1,}/g) ? positionDesc.match(/#\d{1,}-{0,}\d{1,}/g)[0] : '';

    return {
        simpleBookName: simpleBookName.trim(),
        position,
        clippingTime,
        markupCtx,
    };
}

function removeEmptyElement (arr) {
    return arr.filter(item => item);
}

function render (analysisResults, templateFile) {
    const { allData={}, bookCnt=0, markUpCnt=0 } = analysisResults;
    const tplStr = fs.readFileSync(templateFile ? templateFile : TPL_FILE, 'utf-8');
    const html = ejs.render(tplStr, {
        allData,
        bookCnt,
        markUpCnt,
        updateAt: new Date().toLocaleDateString(),
    });

    fs.writeFileSync(RESULT_FILE, html);
}

function main (target, templateFile) {
    const result = parser(target);
    render(result, templateFile);
}

module.exports = {
    RESULT_FILE,
    main,
    parser,
};