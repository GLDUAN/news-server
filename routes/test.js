'use strict'
var express = require('express');
var router = express.Router();
import test from '../controller/test/test'

router.get('/test', test.insert)

export default router
