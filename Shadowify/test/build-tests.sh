#!/bin/bash
# Build fontawesome sheet
node ./bin/shadowify.js ./test/fa/font-awesome.css ./test/fa/font-awesome-converted.css -p fa
# Build ionic sheet
node ./bin/shadowify.js ./test/ionic/ionicons.css ./test/ionic/ionicons-converted.css -p ion
