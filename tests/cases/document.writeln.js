(function() {
  describe('document.writeln tests', function() {
    describe('ignores safe patterns', function() {
      context(null, function () {
	var good = 'good.writeln = "static string";';
	it(good, function(){
	  chai.expect(ScanJS.scan(good, ScanJS.rules, document.location.pathname)).to.be.empty;
	});
      });
      context(null, function () {
	var good = 'good = "document.writeln";';
	it(good, function(){
	  chai.expect(ScanJS.scan(good, ScanJS.rules, document.location.pathname)).to.be.empty;
	});
      });
    });
    describe('detects dangerous patterns', function() {
      context(null, function () {
	var bad = 'document.writeln("Hello World!");';
	it(bad, function(){
	  chai.expect(ScanJS.scan(bad, ScanJS.rules, document.location.pathname)).not.to.be.empty;
	});
      });
      context(null, function () {
	var bad = 'window.document.writeln("Hello World!");';
	it(bad, function(){
	  chai.expect(ScanJS.scan(bad, ScanJS.rules, document.location.pathname)).not.to.be.empty;
	});
      });
      context(null, function () {
	var bad = 'var a = window.document; a.b = document.writeln; a.b("<h1>bad</h1>");';
	it(bad, function(){
	  chai.expect(ScanJS.scan(bad, ScanJS.rules, document.location.pathname)).not.to.be.empty;
	});
      });
    });
  });
})();
