'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useQuery, gql } from '@urql/next';


import { Operation } from "@urql/next";
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

function Pokemons() {
  const [result] = useQuery({ query: PokemonsQuery });
  return (
    <main>
      <h1>This is rendered as part of SSR</h1>
      <ul>
        {result.data
          ? result.data.pokemons.results.map((x: any) => (
              <li key={x.id}>{x.name}</li>
            ))
          : JSON.stringify(result.error)}
      </ul>
      <Suspense>
        <Pokemon name="bulbasaur" />
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

function Pokemon(props: any) {
  const [result] = useQuery({
    query: PokemonQuery,
    variables: { name: props.name },
  });
  return (
    <div>
      <h1>{result.data && result.data.pokemon.name}</h1>
    </div>
  );
}

export const generateStaticParams = async () => {
  const { data } = await getClient().query(
    PokemonsQuery,
    {}
  );

  return data.pokemons.map((pokemon: any) => ({
    slug: pokemon.name,
  }));
};