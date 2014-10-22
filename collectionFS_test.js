FS.debug = true;

/**********************************************
 * File storages
 **********************************************/

var fsEventPhotos = new FS.Store.FileSystem("eventPhotos", {path: "uploads"});

var thumbnailFormat = {width: 100, height: 100};

var fsEventPhotosThumbnails = new FS.Store.FileSystem("eventPhotosThumbnails", {
  path: "uploads/thumbs",
  transformWrite: function (file, readStream, writeStream) {
    gm(readStream, file.name)
      .resize(thumbnailFormat.width, thumbnailFormat.height + '^')
      .gravity('Center')
      .crop(thumbnailFormat.width, thumbnailFormat.height)
      .stream()
      .pipe(writeStream);
  }
});

/**********************************************
 * S3 storages
 **********************************************/
/*
var s3options = Meteor.isServer ? {
  region: Meteor.settings.AWS.region,
  accessKeyId: Meteor.settings.AWS.accessKeyId,
  secretAccessKey: Meteor.settings.AWS.secretAccessKey,
  bucket: 'eventport-photos',
  ACL: 'public-read'
} : {};

var s3eventPhotos = new FS.Store.S3('eventPhotos', _.extend({}, s3options, {
  folder: 'full/'
}));

var s3eventPhotosThumbnails = new FS.Store.S3('eventPhotosThumbnails', _.extend({}, s3options, {
  folder: 'thumbnail/',
  transformWrite: function (file, readStream, writeStream) {
    this.gm(readStream, file.name)
      .resize(thumbnailFormat.width, thumbnailFormat.height + '^')
      .gravity('Center')
      .crop(thumbnailFormat.width, thumbnailFormat.height)
      .stream()
      .pipe(writeStream);
  }
}));
*/

/**********************************************
 * File collections
 **********************************************/

var defaultPhotoFilter = {
  maxSize: 5242880, // 5 MB
  allow: {
    contentTypes: ['image/*']
  }
};

eventPhotos = new FS.Collection('eventPhotos', {
  stores: [fsEventPhotosThumbnails, fsEventPhotos]
//  stores: [s3eventPhotosThumbnails, s3eventPhotos]
  //filter: defaultPhotoFilter
});
eventPhotos.allow({
  insert: function (userId) {
    return !!userId;
  },
  update: function (userId) {
    return !!userId;
  },
  remove: function () {
    // TODO: Create a method that checks if the photo is still used by other events
    return false;
  },
  download: function () {
    return true;
  }
});

if (Meteor.isClient) {
  Template.hello.events({
    'click input[type="submit"]': function () {
      var file = $('#file').get(0).files[0];
      var result = eventPhotos.insert(file);
      console.log('Upload result: ', result);
    }
  });
}
