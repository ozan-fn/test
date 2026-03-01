// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse } from 'waku/router';

// prettier-ignore
import type { getConfig as File_AppAbout_getConfig } from './pages/(app)/about';
// prettier-ignore
import type { getConfig as File_Root_getConfig } from './pages/_root';

// prettier-ignore
type Page =
| ({ path: '/about' } & GetConfigResponse<typeof File_AppAbout_getConfig>)
| { path: '/'; render: 'static' }
| ({ path: '/_root' } & GetConfigResponse<typeof File_Root_getConfig>);

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
  }
}
