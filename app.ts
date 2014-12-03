'use strict';

declare var require;
declare var process;
declare var __dirname;

var http = require('http');
var fs = require('fs');
var path = require('path');

describe('', () => {

    function $xpath(xpath) {
        return element(by.xpath(xpath));
    }

    // save remote file(url) to local(dest)
    function downloadFileAsync (url, dest) {
        // Create a promise that will be resolved after download.
        var d = protractor.promise.defer();

        var file = fs.createWriteStream(dest);
        var request = http.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {  // close() is async
                    // The file has been read, resolve the promise
                    d.fulfill();
                });
            });
            file.on('error', (err) => { // Handle errors
                fs.unlink(dest); // Delete the file async. (But we don't check the result)
                d.fulfill();
            });
        });

        // Return the promise
        d.promise;
    };

    function loginAsync() {
        var HATENA_LOGIN_ADDRESS = 'https://www.hatena.ne.jp/login?location=http%3A%2F%2Fblog.hatena.ne.jp%2Fgo%3Fblog%3Dhttp%253A%252F%252Fhatenablog.com%252F';
        browser.get(HATENA_LOGIN_ADDRESS);
        $('#login-name').sendKeys(process.env.HATENA_USERNAME);
        $('input[name=password]').sendKeys(process.env.HATENA_PASSWORD);
        $('input[type=submit]').click();
        browser.sleep(1000); // タイムアウトしてしまうことがあるので、1000msで切る
    }

    function uploadFileAsync(imageFileAddress) {
        var fileName = imageFileAddress
            .replace('http://weed.cocolog-nifty.com/wzero3es/', '')
            .replace('/', '_');
        console.log(fileName);
        // images/images_scrn0000_1.jpg
        downloadFileAsync(imageFileAddress, fileName);
        var fileToUpload = fileName;
        var absolutePath = path.resolve(__dirname, fileToUpload);

        // チェックボックスがオフならオンにする
        $('input#keep_original').isSelected().then((bool) => {
            if (!bool) $('input#keep_original').click()
        });

        // 画像ファイルをアップロードする
        $('input[type=file][name=image1]').sendKeys(absolutePath);
        $('input#submit-button').click();

        // 画像のアドレスを取得する
        $xpath('//ul[@class="fotolist"]/li[1]/label/img').click();
        $('input[name=showfotourl]').click();
        $xpath('//dt[text()="HTMLタグ"]/../dd[1]/textarea').getText().then((text) => {
            console.log(text);
            return text;
        });
    }

    it('', () => {
        // 対象サイトはAngularを使っていない
        browser.ignoreSynchronization = true;

        // ログインする
        loginAsync();

        // 画像アップロードのページに行く
        browser.get('http://f.hatena.ne.jp/' + process.env.HATENA_USERNAME + '/up?folder=Hatena%20Blog&mode=classic');
        browser.sleep(1000); // 描画を待つ

        // 画像をアップロードし、アドレスを取得する
        var IMAGE_ADDRESS = 'http://weed.cocolog-nifty.com/wzero3es/images/scrn0000_1.jpg';
        var addressUploaded = uploadFileAsync(IMAGE_ADDRESS);

        browser.sleep(1000 * 60 * 5); // 5分
    });
});