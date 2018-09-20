var Promise = require('../utils/promise');
var generatePage = require('./generatePage');

/**
    Output all pages using a generator

    @param {Generator} generator
    @param {Output} output
    @return {Promise<Output>}
*/
function generatePages(generator, output, filePath) {
    var pages = output.getPages();
    var logger = output.getLogger();

    // Is generator ignoring assets?
    if (!generator.onPage) {
        return Promise(output);
    }

    if (filePath) {
        var targetPage = pages.find(function (page) {
            var file = page.getFile();
            return file.getPath().endsWith(filePath);
        });
        if (!targetPage) {
            // 至少有一个，保证在修改时会触发重新编译的操作
            pages.length = 1;
        } else {
            pages = [targetPage];
        }
    }

    return Promise.reduce(pages, function(out, page) {
        var file = page.getFile();

        logger.debug.ln('generate page "' + file.getPath() + '"');

        return generatePage(out, page)
        .then(function(resultPage) {
            return generator.onPage(out, resultPage);
        })
        .fail(function(err) {
            logger.error.ln('error while generating page "' + file.getPath() + '":');
            throw err;
        });
    }, output);
}

module.exports = generatePages;
