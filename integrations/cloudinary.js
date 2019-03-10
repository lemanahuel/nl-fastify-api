
const config = require('../config/config');
const Cloudinary = require('cloudinary');
const async = require('async');
const _ = require('lodash');

Cloudinary.config({
  url: config.CLOUDINARY_URL
});

module.exports = class Cloudy {

  static uploadImages(images, cb) {
    let uploaded = [];
    async.each(_.isArray(images.file) ? images.file : [images.file], (file, cb) => {
      if (file && file.data) {
        Cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.data.toString('base64')}`, res => {
          uploaded.push({
            url: res.url ? res.url.replace(/http:\/\//, 'https://') : res.url
          });
          cb(null);
        });
      } else {
        cb(null);
      }
    }, err => {
      cb(err, uploaded);
    });
  }

}