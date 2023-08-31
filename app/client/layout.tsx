'use client';

import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
  Operation,
} from '@urql/next';
import { AuthConfig, AuthUtilities, authExchange } from "@urql/exchange-auth";

const ssr = ssrExchange();
const client = createClient({
  url: 'https://graphql-pokeapi.graphcdn.app/',
  exchanges: [
      authExchange(async (utils: AuthUtilities): Promise<AuthConfig> => {
        return {
          addAuthToOperation(op): Operation {
            return utils.appendHeaders(op, {
              "X-Shopify-Access-Token":
                "12345",
            });
          },
        } as AuthConfig;}),
      cacheExchange, 
      ssr, 
      fetchExchange
  ],
  suspense: true,
});

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
  );
}