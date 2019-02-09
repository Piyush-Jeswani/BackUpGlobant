var fileIO = function(){

    this.readAFile = function(){

        var filename = 'C:\Users\piyush.jeswani\Downloads\Bare-Escentuals-5455-2018-08-23-15-08.json';
        browser.driver.wait(function(){
            return fs.existsSync('C:\Users\piyush.jeswani\Downloads\Bare-Escentuals-5455-2018-08-23-15-08.json');
        },30000).then(function(){
            expect(filename).toContain('json');
        })
    }
};

module.exports = new fileIO();