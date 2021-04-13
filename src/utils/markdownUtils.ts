import { EOL } from 'os';
import {  HttpResponse } from '../models';
import { isString, toMultiLineArray } from './stringUtils';
import { NormalizedOptions} from 'got';

export enum MarkdownParts{
  response,
  request,
  timings,
  metaData,
}

export interface MarkDownOptions{
  contentParts: MarkdownParts[]
  responseBody?: boolean;
  requestBody?: boolean;
  prettyPrint?: boolean;
}


export function toMarkdown(response: HttpResponse) {
  const result: Array<string> = [];
  if (response.request) {
    result.push(...toMarkdownRequest(response.request, true));
    result.push('');
  }
  result.push(...toMarkdownResponse(response, true));
  return joinMarkdown(result);
}

export function toMarkdownPreview(response: HttpResponse) {
  const result: Array<string> = [];

  result.push(...toMarkdownResponse(response, false));
  if (response.request) {
    result.push('');
    result.push('---');
    result.push('');
    result.push('');
    result.push(...toMarkdownRequest(response.request, true));
  }

  if (response.timings) {
    result.push('');
    result.push('---');
    result.push('');
    result.push('');
    result.push(...toMarkdownTimings(response.timings));
  }

  if (!!response.meta) {
    result.push('');
    result.push('---');
    result.push('');
    result.push('');
    result.push(...toMarkdownMeta(response.meta));
  }


  return joinMarkdown(result);
}

export function toMarkdownResponse(response: HttpResponse, outputBody: boolean) {
  const result: Array<string> = [];
  result.push(`### HTTP${response.httpVersion || ''} **${response.statusCode}** - ${response.statusMessage}`);
  result.push(...toMarkdownHeader(response.headers));
  if (outputBody && isString(response.body)) {
    result.push('');
    result.push('```json');
    result.push(joinMarkdown(toMultiLineArray(response.body)));
    result.push('```');
  }
  return result;
}

function toMarkdownRequest(request: NormalizedOptions, outputBody: boolean) {
  const result: Array<string> = [];
  result.push(`### ${request.method} ${request.url}`);
  if (request.headers) {
    result.push(...toMarkdownHeader(request.headers));
  }
  if (outputBody && isString(request.body)) {
    result.push('');
    result.push('```json');
    result.push(joinMarkdown(toMultiLineArray(request.body)));
    result.push('```');
  }
  return result;
}

export function toMarkdownHeader(headers: Record<string, string | string[] | undefined | null>) {
  return Object.entries(headers)
    .map(([key, value]) => {
      let val = value || '';
      if (value) {
        if (Array.isArray(value)) {
          val = value.join(', ');
        }
      }
      return `**${key}**: ${val}`;
    })
    .sort();
}

export function toMarkdownMeta(meta: Record<string, string | string[]>) {
  const result: Array<string> = [];
  result.push(`| Meta |  |`);
  result.push(`| --- | --- |`);
  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        result.push(`| ${key} | ${value.join(',')} |`);
      }
    } else {
      result.push(`| ${key} | ${value} |`);
    }
  }
  return result;
}

export function toMarkdownTimings(timings: Record<string, any>) {
  const result: Array<string> = [];
  result.push(`| Timings |  |`);
    result.push(`| --- | --- |`);
    result.push(...Object.entries(timings)
      .map(([key, value]) => `| ${key.toUpperCase()} | ${value}ms |`)
      .sort()
    );
  return result;
}


export function joinMarkdown(lines: string[]) {
  return lines.join(`  ${EOL}`);
}