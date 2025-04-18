export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: JsonRpcRequestParams | any[];
  id: number;
}

export interface JsonRpcRequestParams {
  artistid: number;
  albumid: number;
  properties?: string[];
  sort?: JssonRpcSortParams;
  limits?: any;
  filter?: any;
  albumartistsonly?: boolean;
  item?: any;
  playlistid?: number;
}

export interface JssonRpcSortParams {
  method?: string;
  order?: string;
  ignorearticle?: boolean;
}
export interface JsonRpcFilterParams {
  artistid?: number;
  field?: string;
  operator?: string;
  value?: string;
  albumid?: number;
}

export interface JsonRpcLimitsParams {
  start: number;
  end?: number;
}
