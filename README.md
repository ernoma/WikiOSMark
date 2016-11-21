# WikiOSMark

Enrich Wikimedia with OpenStreetMap and vice versa. The application was implemented to [#hack4no](http://www.hack4.no/) thank you to [Wikimedia Norge Wikistipend](https://no.wikimedia.org/wiki/Wikistipend).
Please, also see [#hack4no submission](https://devpost.com/software/wikiosmark) for further info.

<img alt="Map showing Wikidata, Wikimedia Commons, and Wikipedia items" src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/433/269/datas/gallery.jpg" width="400">

## Inspiration

Both OpenStreetMap and Wikimedia have openness as their philosophy. Also, Wikimedia content such as Wikipedia articles often can and have been improved with maps. Recently, OpenStreetMap have gained more attention in Wikimedia developer community because it allows interaction with the maps that static map images have not allowed. 

## What it does

The main idea of the prototype application is to allow user to edit OpenStreetMap and Wikimedia together. For example, the aim is to allow users to add Wikidata tags to the OpenStreetMap elements. Also, adding coordinates, for example, to Wikidata items is useful. Currently the prototype does not allow editing the real Wikimedia and OpenStreetMap sites, but viewing of the information is possible as well as making "fake edits". Also, other open data from various Nordic countries such as platsr.se, apis.is and Flickr is shown to the user. This information is also useful when doing the OpenStreetMap and Wikimedia edits. Finally, the application can show Wheelmap.org places. Wheelmap.org helps to add information of wheelchair accessibility to OpenStreetMap. While editing OpenStreetMap and Wikimedia, why not consider also disabled people?

## How it is built

The application is currently a mobile prototype built on top of the ionic framework. There is also a server that was needed to fetch data from some of the open data sources. Also, the server is needed for posting the data, for example, to Wikimedia when the author of the edits should be known.

## Installing & running

To run in a web browser:

1. Install ionic framework (v1) as described at: http://ionicframework.com/getting-started/.
2. <code>git clone https://github.com/ernoma/WikiOSMark.git</code> 
3. <code>cd WikiOSMark</code>
4. <code>npm install</code>
5. <code>ionic state restore</code>
6. <code>ionic serve</code>

To run in a mobile phone, again follow the documentation at http://ionicframework.com/.

To use some of the features, you also need to install the [WikiOSMark-server](https://github.com/ernoma/WikiOSMark-server).
You will also need to acquire API keys for OSM dev site (http://api06.dev.openstreetmap.org - My Settings -> OAuth settings),
for Flickr (https://www.flickr.com/services/apps/create/apply/), for Mapillary (https://www.mapillary.com/app/settings/developers) and
for Wheelmap.org (https://wheelmap.org/en/profile/edit).
The keys are placed into <code>oauth_prototype_data.js</code> that is placed into <code>www/data</code>-directory.
The contents of the file should be following (with your keys and tokens):
<pre>
var osm_oauth_data = {
  oauth_consumer_key: 'YOUR_CONSUMER_KEY',
  oauth_secret: 'YOUR_SECRET',
  url: 'http://api06.dev.openstreetmap.org',
  landing: 'osm_landing.html',
}

var flickr_api_data = {
  key: 'YOUR_CONSUMER_KEY',
  secret: 'YOUR_SECRET'
}

var mapillary_api_data = {
  clientID: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_SECRET'
}

var wheelmap_api_data = {
  auth_token: 'YOUR_TOKEN'
}
</pre>
