//----------------------------------------------------------------------
// Copyright (c) Microsoft Open Technologies, Inc.
// All Rights Reserved
// Apache License 2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//----------------------------------------------------------------------
'use strict'
/* Directive tells jshint that it, describe are globals defined by jasmine */
/* global it */
/* global describe */
var atobHelper = require('atob');
var confighash = { hash: '#' };
var AdalModule = require('../../../lib/adal.js');

describe('Adal', function () {
    var adal;
    var window = {
        location: {
            hash: '#hash',
            href: 'href',
            replace: function (val) {
            }
        },
        localStorage: {},
        sessionStorage: {},
        atob: atobHelper
    };
    var mathMock = {
        random: function () {
            return 0.2;
        },
        round: function (val) {
            return 1000;
        }
    };
    var frameMock = {
        src: 'start'
    };
    
    var documentMock = {
        getElementById: function () {
            return frameMock;
        }
    };
    var angularMock = {};
    var conf = { tenant: 'testtenant', clientId: 'e9a5a8b6-8af7-4719-9821-0deef255f68e' };
    var testPage = 'this is a song';
    var STORAGE_PREFIX = 'adal';
    var STORAGE_TOKEN_KEYS = STORAGE_PREFIX + '.token.keys';
    var SCOPE1 = ['token.scope1'];
    var SECONDS_TO_EXPIRE = 3600;
    var DEFAULT_INSTANCE = "https://login.microsoftonline.com/";
    //var IDTOKEN_MOCK = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVUa0d0S1JrZ2FpZXpFWTJFc0xDMmdPTGpBNCJ9.eyJhdWQiOiJlOWE1YThiNi04YWY3LTQ3MTktOTgyMS0wZGVlZjI1NWY2OGUiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLXBwZS5uZXQvNTJkNGIwNzItOTQ3MC00OWZiLTg3MjEtYmMzYTFjOTkxMmExLyIsImlhdCI6MTQxMTk1OTAwMCwibmJmIjoxNDExOTU5MDAwLCJleHAiOjE0MTE5NjI5MDAsInZlciI6IjEuMCIsInRpZCI6IjUyZDRiMDcyLTk0NzAtNDlmYi04NzIxLWJjM2ExYzk5MTJhMSIsImFtciI6WyJwd2QiXSwib2lkIjoiZmEzYzVmYTctN2Q5OC00Zjk3LWJmYzQtZGJkM2E0YTAyNDMxIiwidXBuIjoidXNlckBvYXV0aGltcGxpY2l0LmNjc2N0cC5uZXQiLCJ1bmlxdWVfbmFtZSI6InVzZXJAb2F1dGhpbXBsaWNpdC5jY3NjdHAubmV0Iiwic3ViIjoiWTdUbXhFY09IUzI0NGFHa3RjbWpicnNrdk5tU1I4WHo5XzZmbVc2NXloZyIsImZhbWlseV9uYW1lIjoiYSIsImdpdmVuX25hbWUiOiJ1c2VyIiwibm9uY2UiOiI4MGZmYTkwYS1jYjc0LTRkMGYtYTRhYy1hZTFmOTNlMzJmZTAiLCJwd2RfZXhwIjoiNTc3OTkxMCIsInB3ZF91cmwiOiJodHRwczovL3BvcnRhbC5taWNyb3NvZnRvbmxpbmUuY29tL0NoYW5nZVBhc3N3b3JkLmFzcHgifQ.WHsl8TH1rQ3dQbRkV0TS6GBVAxzNOpG3nGG6mpEBCwAOCbyW6qRsSoo4qq8I5IGyerDf2cvcS-zzatHEROpRC9dcpwkRm6ta5dFZuouFyZ_QiYVKSMwfzEC_FI-6p7eT8gY6FbV51bp-Ah_WKJqEmaXv-lqjIpgsMGeWDgZRlB9cPODXosBq-PEk0q27Be-_A-KefQacJuWTX2eEhECLyuAu-ETVJb7s19jQrs_LJXz_ISib4DdTKPa7XTBDJlVGdCI18ctB67XwGmGi8MevkeKqFI8dkykTxeJ0MXMmEQbE6Fw-gxmP7uJYbZ61Jqwsw24zMDMeXatk2VWMBPCuhA';
    var IDTOKEN_MOCK = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMDI4N2Y5NjMtMmQ3Mi00MzYzLTllM2EtNTcwNWM1YjBmMDMxL3YyLjAvIiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6ImU5YTVhOGI2LThhZjctNDcxOS05ODIxLTBkZWVmMjU1ZjY4ZSIsInN1YiI6InRSUXNQZmZOQVRFMEowbHN3bzNUVmVsUm1fS3RfREpTWjNHTHdqRWM0bTgiLCJ2ZXIiOiIyLjAiLCJ0aWQiOiIwMjg3Zjk2My0yZDcyLTQzNjMtOWUzYS01NzA1YzViMGYwMzEiLCJvaWQiOiIwNjI5YTFmNi0wOGE5LTQ0NWUtODFkZC0wNDY1ODU1ZDViNmIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyQG9hdXRoaW1wbGljaXQuY2NzY3RwLm5ldCIsIm5hbWUiOiJVc2VyIEEiLCJub25jZSI6ImVkNTMwMTIyLTk1ZDYtNDk1Yy05NjA4LWM0Njk2NDgyNTBhYiJ9.hdi-0RR2v9g3GXrqbJa3p2c3F3z6nM04iISd664_k-Y';
    var storageFake = function () {
        var store = {};
        return {
            getItem: function (key) {
                return store[key];
            },
            setItem: function (key, value) {
                if (typeof value !== 'undefined') {
                    store[key] = value;
                }
            },
            clear: function () {
                store = {};
            },
            storeVerify: function () {
                return store;
            }
        };
    }();
    
    beforeEach(function () {
        // one item in cache
        storageFake.clear();
        var storageKey = { 'authority': DEFAULT_INSTANCE, 'client_id': conf.clientId, 'policy': 'testpolicy' };
        var entryKey = JSON.stringify(storageKey);
        var secondsNow = mathMock.round(0);
        var entryValue = JSON.stringify({ 'token': 'access token in cache', 'expire': secondsNow + SECONDS_TO_EXPIRE, 'scope': ['testscope'] });
        storageFake.setItem(entryKey, entryValue);
        
        // add key
        storageFake.setItem(STORAGE_TOKEN_KEYS, JSON.stringify([entryKey]));
        
        window.localStorage = storageFake;
        window.sessionStorage = storageFake;
        
        // Init adal 
        global.window = window;
        global.localStorage = storageFake;
        global.sessionStorage = storageFake;
        global.document = documentMock;
        global.Math = mathMock;
        global.angular = angularMock;
        
        adal = new AdalModule.inject(conf);
        
        adal._user = null;
        adal._renewStates = [];
        adal.config.clientId = conf.clientId;
        adal.config.tenant = conf.tenant;
        adal.config.instance = DEFAULT_INSTANCE;
        
        adal.config.scope = [];
    });
    
    it('gets specific scope and policy for defined enpoint mapping', function () {
        adal.config.endpoints = { 'a' : { 'scope' : ['scope1', 'scope2'], 'policy': 'policy1' } };
        
        expect(adal.getScopesForEndpoint('a')).toEqual(['scope1', 'scope2']);
        expect(adal.getPolicyForEndpoint('a')).toBe('policy1');
    });
    
    it('gets default scope and policy for empty endpoint mapping', function () {
        adal.config.endpoints = null;
        expect(adal.getScopesForEndpoint('a')).toEqual([adal.config.clientId]);
        expect(adal.getPolicyForEndpoint('a')).toBe('');
        
        expect(adal.getScopesForEndpoint('b')).toEqual([adal.config.clientId]);
        expect(adal.getPolicyForEndpoint('b')).toBe('');
    });
    
    it('sets default scope', function () {
        expect(adal.config.scope).toEqual([]);
    });
    
    it('says token expired', function () {
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE - 100;
        expect(adal.getCachedToken(['testscope'], 'testpolicy')).toBe('access token in cache');
        
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE;
        expect(adal.getCachedToken(['testscope'], 'testpolicy')).toBe(null);
        
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE + 1;
        expect(adal.getCachedToken(['testscope'], 'testpolicy')).toBe(null);
    });
    
    it('gets cache username', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.IDTOKEN, IDTOKEN_MOCK);
        expect(adal.getCachedUser().userName).toBe('user@oauthimplicit.ccsctp.net');
    });
    
    it('navigates user to login by default', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        adal.config.displayCall = null;
        adal.config.clientId = 'client';
        adal.config.redirectUri = 'contoso_site';
        spyOn(adal, 'promptUser');
        console.log('instance:' + adal.instance);
        adal.login();
        expect(adal.promptUser).toHaveBeenCalledWith(DEFAULT_INSTANCE + conf.tenant + '/oauth2/v2.0/authorize?response_type=id_token&client_id=client&scope=openid&redirect_uri=contoso_site&state=33333333-3333-4333-b333-333333333333' 
            + '&client-request-id=33333333-3333-4333-b333-333333333333' + adal._addClientId() + '&nonce=33333333-3333-4333-b333-333333333333');
        expect(adal.config.state).toBe('33333333-3333-4333-b333-333333333333');
    });
    
    it('sets loginprogress to true for login', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        adal.config.displayCall = null;
        adal.config.clientId = 'client';
        adal.config.redirectUri = 'contoso_site';
        adal.login();
        expect(adal.loginInProgress()).toBe(true);
    });
    
    it('calls displaycall if given for login', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        
        adal.config.clientId = 'client';
        adal.config.redirectUri = 'contoso_site';
        var urlToGo = '';
        var displayCallback = function (url) {
            urlToGo = url;
        };
        adal.config.displayCall = displayCallback;
        spyOn(adal.config, 'displayCall');
        adal.login();
        expect(adal.config.displayCall).toHaveBeenCalledWith(DEFAULT_INSTANCE + conf.tenant + '/oauth2/v2.0/authorize?response_type=id_token&client_id=client&scope=openid&redirect_uri=contoso_site&state=33333333-3333-4333-b333-333333333333'
            + '&client-request-id=33333333-3333-4333-b333-333333333333' 
            + adal._addClientId() 
            + '&nonce=33333333-3333-4333-b333-333333333333' 
        );
        expect(adal.config.state).toBe('33333333-3333-4333-b333-333333333333');
    });
    
    it('returns from cache for auto renewable if not expired', function () {
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE - 100;
        var err = '';
        var token = '';
        var callback = function (valErr, valToken) {
            err = valErr;
            token = valToken;
        };
        adal.acquireTokenSilent(['testscope'], 'testpolicy', callback);
        expect(token).toBe('access token in cache');
    });
    
    it('calls acquiretoken with invalid scopes', function () {
        expect(function () { adal.acquireTokenSilent('scope', 'testpolicy'); }).toThrow(new Error('API does not accept non-array scopes'));
        expect(function () { adal.acquireTokenSilent(1, 'testpolicy'); }).toThrow(new Error('API does not accept non-array scopes'));
        
        expect(function () { adal.acquireTokenSilent(['openid'], 'testpolicy'); }).toThrow(new Error('API does not accept openid as a user-provided scope'));
        expect(function () { adal.acquireTokenSilent(['offline_access'], 'testpolicy'); }).toThrow(new Error('API does not accept offline_access as a user-provided scope'));
        expect(function () { adal.acquireTokenSilent([adal.config.clientId, 'scope'], 'testpolicy'); }).toThrow(new Error('Client Id can only be provided as a single scope'));
    });
    
    it('returns err msg if token expired and renew failed before', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.FAILED_RENEW, 'renew has failed');
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE + 100;
        var err = '';
        var token = '';
        var callback = function (valErr, valToken) {
            err = valErr;
            token = valToken;
        };
        adal.acquireTokenSilent(['testscope'], 'testpolicy', callback);
        expect(err).toBe('renew has failed');
    });
    
    it('attempts to renew if token expired and renew is allowed', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.FAILED_RENEW, '');
        adal.config.redirectUri = 'contoso_site';
        adal.config.clientId = 'client';
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE + 100;
        
        var err = '';
        var token = '';
        var callback = function (valErr, valToken) {
            err = valErr;
            token = valToken;
        };
        adal._renewStates = [];
        window.callBackMappedToRenewStates = {};
        adal._user = { userName: 'test@testuser.com', domainHint: 'organizations'};
        adal.acquireTokenSilent(['testscope'], 'testpolicy', callback);
        expect(adal.callback).toBe(callback);
        expect(storageFake.getItem(adal.CONSTANTS.STORAGE.LOGIN_REQUEST)).toBe('');
        expect(adal._renewStates.length).toBe(1);
        // Wait for initial timeout load
        console.log('Waiting for initial timeout');
        waits(2000);
        
        runs(function () {
            console.log('Frame src:' + frameMock.src);
            expect(frameMock.src).toBe(DEFAULT_INSTANCE + conf.tenant + '/oauth2/v2.0/authorize?response_type=token&client_id=client&scope=' + 'testscope' + '&redirect_uri=contoso_site&state=33333333-3333-4333-b333-333333333333%7Ctestscope' 
                + '&client-request-id=33333333-3333-4333-b333-333333333333' + '&p=testpolicy' + adal._addClientId() + '&prompt=none&login_hint=test%40testuser.com&domain_hint=organizations&nonce=33333333-3333-4333-b333-333333333333');
        });
        
    });
    
    it('check guid masking', function () {
        // masking is required for ver4 guid at begining hex  after version block
        // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        mathMock.random = function () {
            return 0.1;
        };
        // 1->0001 after masked with & 0011 | 1000  1001
        expect(adal._guid()).toBe('11111111-1111-4111-9111-111111111111');
        mathMock.random = function () {
            return 0.3;
        };
        // 4->0100 after masked with & 0011 | 1000  1000
        expect(adal._guid()).toBe('44444444-4444-4444-8444-444444444444');
        mathMock.random = function () {
            return 0.99;
        };
        // 15->1111 after masked with & 0011 | 1000  1011
        expect(adal._guid()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
        
        mathMock.random = function () {
            return 0.9;
        };
        // 14->1110 after masked with & 0011 | 1000  1010
        expect(adal._guid()).toBe('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee');
        mathMock.random = function () {
            return 0.2;
        };
        // 3->0011 after masked with & 0011 | 1000  1011
        expect(adal._guid()).toBe('33333333-3333-4333-b333-333333333333');
    });
    
    it('prompts user if url is given', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        spyOn(window.location, 'replace');
        adal.promptUser();
        expect(window.location.replace).not.toHaveBeenCalled();
        adal.promptUser('test');
        expect(window.location.replace).toHaveBeenCalled();
    });
    
    it('clears cache', function () {
        // Keys are stored for each resource to map tokens for resource
        storageFake.clear();
        var key1 = JSON.stringify({ 'authority': 'authoritytest1', 'client_id': 'client_id_test1' });
        var value1 = JSON.stringify({ 'token': 'token1', 'expire': 'expiretime1' });
        storageFake.setItem(key1, value1);
        var key2 = JSON.stringify({ 'authority': 'authoritytest2', 'client_id': 'client_id_test2' });
        var value2 = JSON.stringify({ 'token': 'token2', 'expire': 'expiretime2' });
        storageFake.setItem(key2, value2);
        var keys = [key1, key2];
        storageFake.setItem(adal.CONSTANTS.STORAGE.TOKEN_KEYS, JSON.stringify(keys));
        storageFake.setItem(adal.CONSTANTS.STORAGE.FAILED_RENEW, 'failed renew');
        storageFake.setItem(adal.CONSTANTS.STORAGE.SESSION_STATE, 'session_state');
        storageFake.setItem(adal.CONSTANTS.STORAGE.STATE_LOGIN, 'state login');
        storageFake.setItem(adal.CONSTANTS.STORAGE.STATE_IDTOKEN, 'state idtoken');
        storageFake.setItem(adal.CONSTANTS.STORAGE.START_PAGE, 'start page');
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'username');
        storageFake.setItem(adal.CONSTANTS.STORAGE.ERROR, 'error');
        storageFake.setItem(adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION, 'error description');
        adal.clearCache();
        var store = storageFake.storeVerify();
        for (var prop in store) {
            expect((store[prop] === JSON.stringify({}) || store[prop] === JSON.stringify([]) || store[prop] == 0 || !store[prop])).toBe(true);
        }
    });
    
    it('clears cache for specified policy and scope', function () {
        // Keys are stored for each resource to map tokens for resource
        storageFake.clear();
        adal.instance = 'authoritytest1';
        adal.config.clientId = 'client_id_test1';
        adal.config.scope = ['scope1'];
        
        var key1 = JSON.stringify({ 'client_id': 'client_id_test1', 'authority': 'authoritytest1', });
        var value1 = JSON.stringify({ 'token': 'token1', 'expire': 'expiretime1', 'scope': ['scope1'] });
        storageFake.setItem(key1, value1);
        
        var key2 = JSON.stringify({ 'adal.access.token.key': 'client_id_test2', 'policy': 'policy1' });
        var value2 = JSON.stringify({ 'token': 'token2', 'expire': 'expiretime2' });
        storageFake.setItem(key2, value2);
        
        var key3 = JSON.stringify({ 'client_id': 'client_id_test3', 'authority': 'authoritytest1', 'policy': 'policy3' });
        var value3 = JSON.stringify({ 'token': 'token3', 'expire': 'expiretime3', 'scope': ['scope3'] });
        
        var keys = [key1, key2];
        storageFake.setItem(adal.CONSTANTS.STORAGE.TOKEN_KEYS, JSON.stringify(keys));
        
        storageFake.setItem(JSON.stringify(key1), JSON.stringify(value1));
        storageFake.setItem(JSON.stringify(key2), JSON.stringify(value2));
        
        storageFake.setItem(adal.CONSTANTS.STORAGE.FAILED_RENEW, 'failed renew');
        storageFake.setItem(adal.CONSTANTS.STORAGE.STATE_RENEW, 'state renew');
        storageFake.setItem(adal.CONSTANTS.STORAGE.STATE_IDTOKEN, 'state idtoken');
        storageFake.setItem(adal.CONSTANTS.STORAGE.ERROR, 'error');
        storageFake.setItem(adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION, 'error description');
        
        adal.clearCacheForStoredEntry(['scope1']);
        var store = storageFake.storeVerify();
        for (var prop in store) {
            if (prop === key1) {
                expect((store[prop] === '{}' || store[prop] == 0 || !store[prop])).toBe(true);
            }
        }
        expect((store[key2] === '{}' || store[key2] == 0 || !store[key2])).toBe(false);
        expect((store[key3] === '{}' || store[key2] == 0 || !store[key2])).toBe(false);
        
        adal.config.clientId = 'client_id_test2';
        adal.clearCacheForStoredEntry(adal.config.clientId, 'policy1');
        store = storageFake.storeVerify();
        expect(store[key2] === '{}').toBe(true);
        expect((store[key3] === '{}' || store[key2] == 0 || !store[key2])).toBe(false);
        
        adal.config.clientId = 'client_id_test3';
        adal.clearCacheForStoredEntry(['scope3'], 'policy3');
        store = storageFake.storeVerify();
        expect(store[key3] === '{}').toBe(true);
    });
    
    it('clears cache before logout', function () {
        adal.config.clientId = 'client';
        adal.config.redirectUri = 'contoso_site';
        spyOn(adal, 'clearCache');
        spyOn(adal, 'promptUser');
        adal.logOut();
        expect(adal.clearCache).toHaveBeenCalled();
        expect(adal.promptUser).toHaveBeenCalled();
    });
    
    it('has logout redirect if given', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        adal.config.displayCall = null;
        adal.config.clientId = 'client';
        adal.config.tenant = 'testtenant'
        adal.config.postLogoutRedirectUri = 'https://contoso.com/logout';
        spyOn(adal, 'promptUser');
        adal.logOut();
        expect(adal.promptUser).toHaveBeenCalledWith(DEFAULT_INSTANCE + adal.config.tenant + '/oauth2/logout?post_logout_redirect_uri=https%3A%2F%2Fcontoso.com%2Flogout');
    });
    
    it('uses common for tenant if not given at logout redirect', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.USERNAME, 'test user');
        adal.config.displayCall = null;
        adal.config.clientId = 'client';
        delete adal.config.tenant;
        adal.config.postLogoutRedirectUri = 'https://contoso.com/logout';
        spyOn(adal, 'promptUser');
        adal.logOut();
        expect(adal.promptUser).toHaveBeenCalledWith(DEFAULT_INSTANCE + 'common/oauth2/logout?post_logout_redirect_uri=https%3A%2F%2Fcontoso.com%2Flogout');
    });
    
    it('gets user from cache', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.IDTOKEN, IDTOKEN_MOCK);
        adal.config.clientId = 'e9a5a8b6-8af7-4719-9821-0deef255f68e';
        adal.config.expireOffsetSeconds = SECONDS_TO_EXPIRE - 100;
        var err = '';
        var user = {};
        var callback = function (valErr, valResult) {
            err = valErr;
            user = valResult;
        };
        spyOn(adal, 'getCachedToken').andCallThrough();
        adal.getUser(callback);
        expect(adal.getCachedToken).not.toHaveBeenCalledWith(SCOPE1);
        expect(user.userName).toBe('user@oauthimplicit.ccsctp.net');
    });
    
    it('is callback if has error or access token or idtoken', function () {
        expect(adal.isCallback('not a callback')).toBe(false);
        expect(adal.isCallback('#error_description=someting_wrong')).toBe(true);
        expect(adal.isCallback('#/error_description=someting_wrong')).toBe(true);
        expect(adal.isCallback('#access_token=token123')).toBe(true);
        expect(adal.isCallback('#id_token=idtoken234')).toBe(true);
    });
    
    it('gets login error if any recorded', function () {
        storageFake.setItem(adal.CONSTANTS.STORAGE.LOGIN_ERROR, '');
        expect(adal.getLoginError()).toBe('');
        storageFake.setItem(adal.CONSTANTS.STORAGE.LOGIN_ERROR, 'err');
        expect(adal.getLoginError()).toBe('err');
    });
    
    it('gets request info from hash', function () {
        var requestInfo = adal.getRequestInfo('invalid');
        expect(requestInfo.valid).toBe(false);
        requestInfo = adal.getRequestInfo('#error_description=someting_wrong');
        expect(requestInfo.valid).toBe(true);
        expect(requestInfo.stateResponse).toBe('');
        
        requestInfo = adal.getRequestInfo('#error_description=someting_wrong&state=1232');
        expect(requestInfo.valid).toBe(true);
        expect(requestInfo.stateResponse).toBe('1232');
        expect(requestInfo.stateMatch).toBe(false);
        
        checkStateType(adal.CONSTANTS.STORAGE.STATE_LOGIN, '1234', adal.REQUEST_TYPE.LOGIN);
        checkStateType(adal.CONSTANTS.STORAGE.STATE_IDTOKEN, '1236', adal.REQUEST_TYPE.ID_TOKEN);
    });
    
    var checkStateType = function (state, stateExpected, requestType) {
        storageFake.setItem(state, stateExpected);
        adal._renewStates.push(stateExpected);
        var requestInfo = adal.getRequestInfo('#error_description=someting_wrong&state=' + stateExpected);
        expect(requestInfo.valid).toBe(true);
        expect(requestInfo.stateResponse).toBe(stateExpected);
        expect(requestInfo.stateMatch).toBe(true);
        expect(requestInfo.requestType).toBe(requestType);
        storageFake.setItem(state, '');
    }
    
    it('saves errors token from callback', function () {
        var requestInfo = {
            valid: false,
            parameters: { 'error_description': 'error description', 'error': 'invalid' },
            stateMatch: false,
            stateResponse: '',
            requestType: adal.REQUEST_TYPE.UNKNOWN
        };
        adal.saveTokenFromHash(requestInfo);
        
        expect(storageFake.getItem(adal.CONSTANTS.STORAGE.ERROR)).toBe('invalid');
        expect(storageFake.getItem(adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION)).toBe('error description');
    });
    
    it('saves token if state matches', function () {
        storageFake.clear();
        adal.instance = DEFAULT_INSTANCE;
        var requestInfo = {
            valid: true,
            parameters: { 'access_token': 'token123', 'state': '123' },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.LOGIN
        };
        
        adal.saveTokenFromHash(requestInfo);
        
        var key = JSON.stringify({ 'client_id': adal.config.clientId, 'authority': DEFAULT_INSTANCE });
        var value = JSON.stringify({ 'token': 'token123' });
        expect(storageFake.getItem(key)).toBe(value);
    });
    
    it('saves expiry and token if state matches', function () {
        adal.instance = DEFAULT_INSTANCE;
        var requestInfo = {
            valid: true,
            parameters: { 'access_token': 'token123', 'state': '123', 'expires_in': 3589 },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.LOGIN
        };
        adal.saveTokenFromHash(requestInfo);
        
        var key = JSON.stringify({ 'client_id': adal.config.clientId, 'authority': DEFAULT_INSTANCE });
        var value = JSON.stringify({ 'token': 'token123', 'expire': mathMock.round(1) + 3589 });
        
        expect(storageFake.getItem(key)).toBe(value);
    });
    
    it('saves username after extracting idtoken', function () {
        var requestInfo = {
            valid: true,
            parameters: {
                'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMDI4N2Y5NjMtMmQ3Mi00MzYzLTllM2EtNTcwNWM1YjBmMDMxL3YyLjAvIiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6ImU5YTVhOGI2LThhZjctNDcxOS05ODIxLTBkZWVmMjU1ZjY4ZSIsInN1YiI6InRSUXNQZmZOQVRFMEowbHN3bzNUVmVsUm1fS3RfREpTWjNHTHdqRWM0bTgiLCJ2ZXIiOiIyLjAiLCJ0aWQiOiIwMjg3Zjk2My0yZDcyLTQzNjMtOWUzYS01NzA1YzViMGYwMzEiLCJvaWQiOiIwNjI5YTFmNi0wOGE5LTQ0NWUtODFkZC0wNDY1ODU1ZDViNmIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyQG9hdXRoaW1wbGljaXQuY2NzY3RwLm5ldCIsIm5hbWUiOiJVc2VyIEEiLCJub25jZSI6IjE5ZTY3YjI0LWNkOTktNDViNi1hNTg4LTg0MGUzZjhmMmE3MCJ9.Akh8gpoSl5LEW1VXIe_zmhAehnesPogMDcMKdVUORtA',
                'state': '123'
            },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.ID_TOKEN
        };
        storageFake.setItem(adal.CONSTANTS.STORAGE.NONCE_IDTOKEN, '19e67b24-cd99-45b6-a588-840e3f8f2a70');
        adal.config.clientId = conf.clientId;
        adal._user = null;
        adal.saveTokenFromHash(requestInfo);
        var cachedUser = adal.getCachedUser();
        // don't need to compare for upn, upn will not be returned for converged endpoint
        expect(cachedUser.userName).toBe('user@oauthimplicit.ccsctp.net');
        console.log('test extract idtoken done');
    });
    
    it('does not save user for invalid nonce in idtoken', function () {
        var requestInfo = {
            valid: true,
            parameters: {
                'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVUa0d0S1JrZ2FpZXpFWTJFc0xDMmdPTGpBNCJ9.eyJhdWQiOiJlOWE1YThiNi04YWY3LTQ3MTktOTgyMS0wZGVlZjI1NWY2OGUiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLXBwZS5uZXQvNTJkNGIwNzItOTQ3MC00OWZiLTg3MjEtYmMzYTFjOTkxMmExLyIsImlhdCI6MTQxMTk2MDkwMiwibmJmIjoxNDExOTYwOTAyLCJleHAiOjE0MTE5NjQ4MDIsInZlciI6IjEuMCIsInRpZCI6IjUyZDRiMDcyLTk0NzAtNDlmYi04NzIxLWJjM2ExYzk5MTJhMSIsImFtciI6WyJwd2QiXSwib2lkIjoiZmEzYzVmYTctN2Q5OC00Zjk3LWJmYzQtZGJkM2E0YTAyNDMxIiwidXBuIjoidXNlckBvYXV0aGltcGxpY2l0LmNjc2N0cC5uZXQiLCJ1bmlxdWVfbmFtZSI6InVzZXJAb2F1dGhpbXBsaWNpdC5jY3NjdHAubmV0Iiwic3ViIjoiWTdUbXhFY09IUzI0NGFHa3RjbWpicnNrdk5tU1I4WHo5XzZmbVc2NXloZyIsImZhbWlseV9uYW1lIjoiYSIsImdpdmVuX25hbWUiOiJ1c2VyIiwibm9uY2UiOiIxOWU2N2IyNC1jZDk5LTQ1YjYtYTU4OC04NDBlM2Y4ZjJhNzAiLCJwd2RfZXhwIjoiNTc3ODAwOCIsInB3ZF91cmwiOiJodHRwczovL3BvcnRhbC5taWNyb3NvZnRvbmxpbmUuY29tL0NoYW5nZVBhc3N3b3JkLmFzcHgifQ.GzbTwMXhjs4uJFogd1B46C_gKX6uZ4BfgJIpzFS-n-HRXEWeKdZWboRC_-C4UnEy6G9kR6vNFq7zi3DY1P8uf1lUavdOFUE27xNY1McN1Vjm6HKxKNYOLU549-wIb6SSfGVycdyskdJfplf5VRasMGclwHlY0l9bBCTaPunjhfcg-mQmGKND-aO0B54EGhdGs740NiLMCh6kNXbp1WAv7V6Yn408qZEIsOQoPO0dW-wO54DTqpbLtqiwae0pk0hDxXWczaUPxR_wcz0f3TgF42iTp-j5bXTf2GOP1VPZtN9PtdjcjDIfZ6ihAVZCEDB_Y9czHv7et0IvB1bzRWP6bQ',
                'state': '123'
            },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.ID_TOKEN
        };
        adal.config.clientId = conf.clientId;
        adal._user = null;
        adal.saveTokenFromHash(requestInfo);
        expect(adal.getCachedUser()).toBe(null);
    });
    
    it('saves null for username if idtoken is invalid', function () {
        var requestInfo = {
            valid: true,
            parameters: {
                'id_token': 'invalid',
                'state': '123'
            },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.ID_TOKEN
        };
        adal.saveTokenFromHash(requestInfo);
        
        expect(storageFake.getItem(adal.CONSTANTS.STORAGE.USERNAME)).toBeUndefined();
    });
    
    it('saves null for username if idtoken is invalid', function () {
        var requestInfo = {
            valid: true,
            parameters: {
                'id_token': 'invalid',
                'state': '123'
            },
            stateMatch: true,
            stateResponse: '123',
            requestType: adal.REQUEST_TYPE.ID_TOKEN
        };
        adal.saveTokenFromHash(requestInfo);
        
        expect(storageFake.getItem(adal.CONSTANTS.STORAGE.USERNAME)).toBeUndefined();
    });

    // TODO angular intercepptor
   
    // TODO angular authenticaitonService
});