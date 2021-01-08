import { HttpMethod, HttpResponse } from './httpRegion';
import { getHeader, isString, parseMimeType } from './utils';
import { default as got, OptionsOfUnknownResponseBody } from 'got';


export interface HttpClientOptions{
  method: HttpMethod;
  headers: Record<string, string | string[] | undefined | null>;
  body?: string | Buffer;
}
export type HttpClient = (url: string, options: HttpClientOptions) => Promise<HttpResponse>;

export function gotHttpClientFactory(defaultsOverride: OptionsOfUnknownResponseBody = {}) {
  return async function gotHttpClient(url: string, clientOptions: HttpClientOptions) {
    const defaults: OptionsOfUnknownResponseBody = {
      decompress: true,
      retry: 0,
      throwHttpErrors: false,
    };
    const optionList = [
      defaults,
      defaultsOverride,
      clientOptions,
    ];
    const options: OptionsOfUnknownResponseBody = Object.assign({}, ...optionList);
    options.headers = Object.assign({}, ...optionList.filter(obj => obj.headers).map(obj => obj.headers));

    const response = await got(url, options);

    const result: HttpResponse = {
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      body: response.body,
      rawBody: response.rawBody,
      headers: response.headers,
      timings: response.timings.phases,
      httpVersion: response.httpVersion,
    };

    const contentType = getHeader(response.headers, 'content-type');
    if (isString(contentType)) {
      result.contentType = parseMimeType(contentType);
    }
    return result;

  };
}