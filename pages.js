#! /usr/bin/env node
/* jshint node: true */
/* jshint bitwise: false */
//
// Webhook listener implementing https://pages.18f.gov/ publishing.
//
// For instructions on how to publish, see:
// - https://github.com/18F/pages/
// - https://pages.18f.gov/guides-template/
//
// Author: Mike Bland (michael.bland@gsa.gov)
// Date:   2015-04-23
'use strict';

var hookshot = require('hookshot');
var path = require('path');
var siteBuilder = require('./site-builder');
var config = require('./pages-config.json');

// Passed through to bodyParser.json().
// https://www.npmjs.com/package/body-parser#limit
var jsonOptions = { limit: config.payloadLimit };

function SiteBuilderOptions(info, repoDir, destDir) {
  return new siteBuilder.Options(info, path.join(config.home, repoDir),
    path.join(config.home, destDir), config.git, config.bundler, config.jekyll,
    config.rsync, config.rsyncOpts);
}

var webhook = hookshot();

function makeBuilderListener(builderConfig) {
  webhook.on('refs/heads/' + builderConfig.branch, function(info) {
    siteBuilder.launchBuilder(info, new SiteBuilderOptions(
      info, builderConfig.repositoryDir, builderConfig.generatedSiteDir));
  }, jsonOptions);
}

var numBuilders = config.builders.length;
for (var i = 0; i != numBuilders; i++) {
  makeBuilderListener(config.builders[i]);
}

webhook.listen(config.port);

console.log(config.githubOrg + ' pages: listening on port ' + config.port);