import {test} from 'node:test';import assert from 'node:assert/strict';import {handNearMouthScore} from './mouth-gesture.js';
function face(){const f=Array.from({length:478},()=>({x:.5,y:.5}));f[13]={x:.5,y:.58};f[14]={x:.5,y:.6};f[234]={x:.35,y:.5};f[454]={x:.65,y:.5};return f;}
test('hand near mouth triggers',()=>{const h=Array.from({length:21},()=>({x:.52,y:.6}));assert.ok(handNearMouthScore([h],face())>70);});
test('hand away from mouth does not trigger',()=>{const h=Array.from({length:21},()=>({x:.8,y:.2}));assert.equal(handNearMouthScore([h],face()),0);});
test('closed eyes without a hand do not trigger',()=>{assert.equal(handNearMouthScore([],face()),0);});
