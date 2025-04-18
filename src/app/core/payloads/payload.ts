import { JsonRpcRequest } from '../models/jsonrpcRequest';
import { JsonRpcRequestParams } from '../models/jsonrpcRequest';
import { JssonRpcSortParams } from '../models/jsonrpcRequest';
import { JsonRpcFilterParams } from '../models/jsonrpcRequest';
import { environment } from 'src/environments/environment';

export const payloads = {
  volume: {
    jsonrpc: '2.0',
    method: 'Application.SetVolume',
    params: {
      volume: 0,
    },
  },
  appInfo: {
    jsonrpc: '2.0',
    method: 'Application.GetProperties',
    params: [['volume', 'muted', 'version', 'name']],
    id: 300,
  },
  album: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetAlbums',
    id: '1712',
    params: {
      properties: [
        'thumbnail',
        'playcount',
        'artistid',
        'artist',
        'genre',
        'albumlabel',
        'year',
        'dateadded',
        'style',
        'fanart',
      ],
      limits: {
        start: 1,
        end: 10,
      },
      sort: {
        method: 'album',
        order: 'ascending',
      },
      filter: {
        field: 'albumartist',
        operator: 'contains',
        value: '',
      },
    },
  },
  artist: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetArtists',
    id: '1718131594542',
    params: {
      albumartistsonly: true,
      properties: ['thumbnail', 'mood', 'genre', 'style'],
      limits: {
        start: 0,
        end: 10,
      },
      sort: {
        method: 'label',
        order: 'ascending',
        ignorearticle: true,
      },
      filter: {
        field: 'artist',
        operator: 'contains',
        value: '',
      },
    },
  },
  artistRequestDetail: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetArtistDetails',
    id: '1712437435620',
    params: {
      artistid: 23,
    },
  },
  artistDetaill: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.SetArtistDetails',
    params: {
      artistid: 1,
      artist: '[Desconocido]',
      description: 'kkhhhhk',
      gender: '',
      formed: '',
      disbanded: '',
      born: '',
      died: '',
      yearsactive: [],
      genre: [],
      style: [],
      instrument: [],
      mood: [],
      musicbrainzartistid: '',
    },
    id: 84,
  },
  albunDetail: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetAlbumDetails',
    id: '1712437435620',
    params: {
      albumid: 1824,
      properties: [
        'thumbnail',
        'playcount',
        'artistid',
        'artist',
        'genre',
        'albumlabel',
        'year',
        'dateadded',
        'style',
        'fanart',
        'mood',
        'description',
        'rating',
        'type',
        'theme',
      ],
    },
  },
  albumRequestDetail: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetAlbumDetails',
    id: '1712437435620',
    params: {
      properties: [
        'title',
        'file',
        'thumbnail',
        'artist',
        'artistid',
        'album',
        'albumid',
        'lastplayed',
        'track',
        'year',
        'duration',
      ],
      limits: {
        start: 0,
      },
      sort: {
        method: 'track',
        order: 'ascending',
        ignorearticle: true,
      },
      filter: {
        albumid: 1824,
      },
    },
  },
  requestTracks: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetSongs',
    id: '1727107266108',
    params: {
      properties: [
        'title',
        'file',
        'thumbnail',
        'artist',
        'artistid',
        'album',
        'albumid',
        'lastplayed',
        'track',
        'year',
        'duration',
      ],
      limits: {
        start: 0,
      },
      sort: {
        method: 'track',
        order: 'ascending',
        ignorearticle: true,
      },
      filter: {
        albumid: 1824,
      },
    },
  },
  sendAlbumToList: {
    jsonrpc: '2.0',
    method: 'Playlist.Insert',
    params: [0, 0, {}],
    id: 56,
  },
  clearPlaylist: {
    jsonrpc: '2.0',
    method: 'Playlist.Clear',
    params: [0],
    id: 1,
  },
  playItem: {
    jsonrpc: '2.0',
    method: 'Player.Open',
    params: {
      item: {
        position: 2,
        playlistid: 0,
      },
      options: {},
    },
    id: 7,
  },
  togglePause: [
    {
      jsonrpc: '2.0',
      method: 'Player.PlayPause',
      params: [0, 'toggle'],
      id: 193,
    },
  ],
  setShuffle: [
    {
      jsonrpc: '2.0',
      method: 'Player.SetShuffle',
      params: [0, 'toggle'],
      id: 350,
    },
  ],
  setRepeat: [
    {
      jsonrpc: '2.0',
      method: 'Player.SetRepeat',
      params: [0, 'cycle'],
      id: 413,
    },
  ],
  setSeeek: [
    {
      jsonrpc: '2.0',
      method: 'Player.Seek',
      params: [
        0,
        {
          percentage: 50,
        },
      ],
      id: 606,
    },
  ],
  getGenre: {
    jsonrpc: '2.0',
    method: 'AudioLibrary.GetGenres',
    id: '1727554826167',
    params: {
      properties: ['title', 'thumbnail'],
      limits: {
        start: 0,
      },
      sort: {
        method: 'title',
        order: 'ascending',
        ignorearticle: true,
      },
    },
  },
};

export class PayloadRequest {
  payload: JsonRpcRequest;
  applicationProperties: string[][] = [['volume', 'muted', 'version', 'name']];
  static artistProperties: string[] = [
    'thumbnail',
    'mood',
    'genre',
    'style',
    'fanart',
    'born',
    'formed',
    'description',
    'died',
    'disbanded',
    'yearsactive',
    'instrument',
    'musicbrainzartistid',
  ];
  albumProperties: string[] = [
    'thumbnail',
    'playcount',
    'artistid',
    'artist',
    'genre',
    'albumlabel',
    'year',
    'dateadded',
    'style',
    'fanart',
    'mood',
    'description',
    'rating',
    'type',
    'theme',
  ];
  constructor(method: string, params: any, id: number) {
    this.payload = {
      jsonrpc: environment.jsonrpcVersion,
      method: method,
      params: params,
      id: id,
    };
  }
  static create(method: string, params: JsonRpcRequestParams | any[]) {
    const id = new Date().getTime();
    return new PayloadRequest(method, params, id);
  }
}
