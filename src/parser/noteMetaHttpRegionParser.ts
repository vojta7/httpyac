import { ParserContext } from '../models';
import { getDisplayName } from '../utils';
import { userInteractionProvider } from '../io';

export async function injectNote({ httpRegion }: ParserContext): Promise<void> {
  if (httpRegion.metaData.note) {
    const note = httpRegion.metaData.note || `Are you sure you want to send the request ${getDisplayName(httpRegion)}?`;

    httpRegion.hooks.execute.addHook('note', () => userInteractionProvider.showNote(note), {
      beforeAll: true
    });
  }
}
