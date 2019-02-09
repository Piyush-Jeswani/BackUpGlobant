'use strict';

describe('session', function() {
  var session;

  beforeEach(module('shopperTrak.auth'));
  beforeEach(inject(function(_session_) {
    session = _session_;
  }));

  describe('setToken', function() {
    it('should set the token', function() {
      var token = 'abcdefg1234';
      session.setToken(token);
      expect(session.getToken()).toBe(token);
    });
  });

  describe('clear', function() {
    it('should set the token to null', function() {
      session.setToken('abcdefg1234');
      session.clear();
      expect(session.getToken()).toBe(null);
    });
  });
});
