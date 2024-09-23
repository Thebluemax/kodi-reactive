export const payloads = {
    volume: {
            "jsonrpc": "2.0",
            "method": "Application.SetVolume",
            "params": {
                "volume": 0
            }
        },
    appInfo: {
        "jsonrpc": "2.0",
        "method": "Application.GetProperties",
        "params": [
            [
                "volume",
                "muted",
                "version",
                "name"

            ]
        ],
        id:300
    },
    album: {
        "jsonrpc": "2.0",
        "method": "AudioLibrary.GetAlbums",
        "id": "1712",
        "params": {
          "properties": [
            "thumbnail",
            "playcount",
            "artistid",
            "artist",
            "genre",
            "albumlabel",
            "year",
            "dateadded",
            "style",
            "fanart"
          ],
          "limits": {
            "start": 1,
            "end": 10
          },
         "sort": {
          "method":"album",
          "order":"ascending"
          },
          "filter": {
              "field": "albumartist",
              "operator": "contains",
              "value": ""
          }
        }
      },
    artist: {
      "jsonrpc": "2.0",
      "method": "AudioLibrary.GetArtists",
      "id": "1718131594542",
      "params": {
          "albumartistsonly": true,
          "properties": [
              "thumbnail",
              "mood",
              "genre",
              "style"
          ],
          "limits": {
              "start": 0,
              "end": 10
          },
          "sort": {
              "method": "label",
              "order": "ascending",
              "ignorearticle": true
          },
          "filter": {
              "field": "artist",
              "operator": "contains",
              "value": ""
          }
      }
  },
  artistRequestDetail: {
    "jsonrpc": "2.0",
    "method": "AudioLibrary.GetArtistDetails",
    "id": "1712437435620",
  "params": {
  "artistid": 23,
  "properties": [
    "thumbnail",
    "mood",
    "genre",
    "style",
    "fanart",
    "born",
    "formed",
    "description",
    "died",
    "disbanded",
    "yearsactive",
    "instrument",
    "musicbrainzartistid"
  ]
  },
},
    artistDetaill: {
      "jsonrpc": "2.0",
      "method": "AudioLibrary.SetArtistDetails",
      "params": {
          "artistid": 1,
          "artist": "[Desconocido]",
          "description": "kkhhhhk",
          "gender": "",
          "formed": "",
          "disbanded": "",
          "born": "",
          "died": "",
          "yearsactive": [],
          "genre": [],
          "style": [],
          "instrument": [],
          "mood": [],
          "musicbrainzartistid": "",
      },
      "id": 84
  }
    
}
