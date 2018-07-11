# [Mapoch](https://robertorthofer.github.io/mapoch/openlayers/)

Robert Orthofer's Master Thesis in Progress

[Try the current version live in your browser!](https://robertorthofer.github.io/mapoch/openlayers/)

supervised by Dr. Konrad Rautz

original idea by Andreas Hocevar and Johannes Leitner

## Getting Started

### Prerequisites

* [git](https://git-scm.com/downloads)
* [Node.js](https://nodejs.org/en/)
* Local Webserver, for instance npm [http-server](https://www.npmjs.com/package/http-server)

### Installing

Clone a copy of this project by running:
```
git clone https://github.com/RobertOrthofer/mapoch.git
```

start the local webserver at the root directory by running

```
http-server
```
open index.htm in a browser

Data for testing is available at /sample_data

## How-To (#how-to)

### Create Your Own Data

Mapoch allows GeoJSON or CSV as geographic data and JSON or CSV as value data.

GeoJSON can be created from your vector data by most common Desktop GIS (like [QGIS](https://www.qgis.org/en/site/)) or directly in your browser with [geojson.io](geojson.io)

CSV can also be created by most common Desktop GIS or by any spreadsheet program (like MS Excel). The file needs to have a header row containing the column names. There have to be at least 3 columns, one for the name of each feature to connect to the values (match-ID), and one for each coordinate (X- and Y-coordinate). The values of each row have to be separated by commas (',').

The value data as JSON needs to be a JavaScript array containing one object for each time step. Each of these objects needs to have one property containing the timestamps in the ISO 8601 Format (JJJJ-MM-DD), and one property for each feature containing the value at that time. the key of each of these properties need to be matching the names from your geographic data, the value needs to be a number.

The value data as CSV needs to contain one row containing all timestamps in the ISO 8601 Format (JJJJ-MM-DD), and one row for each feature, separated by commas (','). The first columns needs to contain the name of each feature, so it can be matched to the geometry.

Look [here](https://github.com/RobertOrthofer/mapoch/tree/master/sample_data) for examples

### Workflow

Once the Data is ready, head over to the [Mapoch](https://robertorthofer.github.io/mapoch/openlayers/)-Application. Drag and drop your Coordinate File (GeoJSON oder CSV) into the drop zone in the top left. Then you can chose the match-ID of your files (name) and the EPSG Code. If you have unprojected Data (Latitude, Longitude), your EPSG-Code will likely be 4326, otherwise please ask your data vendor. When dropping CSV-Data, you need to specify the columns of your Coordinates. When done, press 'apply'.

Then drag and drop your temporal data file into the according zone. Only the match-ID has to be chosen, press apply when done.

After that, feel free to explore your data, make selections, generate bar charts or just run the animation.

Optional pie charts can be created when working with polygon data. Please check the [sample data]((https://github.com/RobertOrthofer/mapoch/tree/master/sample_data)) for more information.

## Data

Basemap by [basemap.at](basemap.at)

## Authors

* **Robert Orthofer**  [GitHub](https://github.com/RobertOrthofer)
