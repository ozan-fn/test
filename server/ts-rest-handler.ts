import { fetchRequestHandler, tsr } from "@ts-rest/serverless/fetch";
import { enhance, type UniversalHandler } from "@universal-middleware/core";
import { contract } from "../ts-rest/contract";

/**
 * ts-rest route
 *
 * @link {@see https://ts-rest.com/docs/serverless/fetch-runtimes/}
 **/
const router = tsr.platformContext<object>().router(contract, {
  demo: async () => {
    return {
      status: 200,
      body: {
        demo: true,
      },
    };
  },
  createTodo: async ({ body }, _ctx) => {
    // This is where you'd persist the data
    console.log("Received new todo", { text: body.text });

    return {
      status: 200,
      body: {
        status: "Ok",
      },
    };
  },
});

export const tsRestHandler: UniversalHandler = enhance(
  async (request, ctx, runtime) =>
    fetchRequestHandler({
      request: new Request(request.url, request),
      contract,
      router,
      options: {},
      platformContext: {
        ...ctx,
        ...runtime,
      } as any,
    }),
  {
    name: "my-app:ts-rest-handler",
    path: `/api/**`,
    method: ["GET", "POST"],
    immutable: false,
  },
);
