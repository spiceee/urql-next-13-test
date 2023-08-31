import Link from 'next/link';
import { Suspense } from 'react';
import { gql } from '@urql/core';

import { Operation } from "@urql/core";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import { AuthConfig, AuthUtilities, authExchange } from "@urql/exchange-auth";

const makeClient = () => {
  return createClient({
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
        } as AuthConfig;
      }),
      cacheExchange,
      fetchExchange,
    ],
  });
};

const { getClient } = registerUrql(makeClient);

export default function Page() {
  return (
    <Suspense>
      <Pokemons />
    </Suspense>
  );
}

const PokemonsQuery = gql`
  query {
    pokemons(limit: 10) {
      results {
        id
        name
      }
    }
  }
`;

async function Pokemons() {
  const result = await getClient().query(PokemonsQuery, {});

  return (
    <main>
      <h1>This is rendered as part of SSR</h1>
      <ul>
        {result.data
          ? result.data.pokemons.results.map((x: any) => (
              <Link href={`/pokemons/${x.name}`} key={x.id}><li>{x.name}</li></Link>
            ))
          : JSON.stringify(result.error)}
      </ul>
      <Suspense>
        <Pokemon name="charmeleon" />
      </Suspense>
      <Link href="/">RSC</Link>
    </main>
  );
}

const PokemonQuery = gql`
  query ($name: String!) {
    pokemon(name: $name) {
      id
      name
    }
  }
`;

async function Pokemon(props: any) {
  const result = await getClient().query(PokemonQuery,  { name: props.name });

  return (
    <div>
      <h1>{result.data && result.data.pokemon.name}</h1>
    </div>
  );
}

