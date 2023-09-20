import { gql } from '@urql/core';
import { Operation } from "@urql/core";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import { AuthConfig, AuthUtilities, authExchange } from "@urql/exchange-auth";

const makeClient = () => {
  return createClient({
    url: 'https://graphql-pokeapi.graphcdn.app/',
    fetchOptions: { next: { revalidate: 600 } },
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

export interface PokemonProps {
  params: { slug: string };
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
const PokemonQuery = gql`
  query ($name: String!) {
    pokemon(name: $name) {
      id
      name
    }
  }
`;

export async function generateStaticParams() {
  const { data } = await getClient().query(PokemonsQuery, {});

  const paths = data.pokemons.results.map((pokemon: any) => ({
    slug: pokemon.name,
  }));

  return paths;
};

export default async function Page({ params: { slug } }: PokemonProps) {
  const result = await getClient().query(PokemonQuery, { name: slug });

  return (
    <div>
      <h1>{result.data && result.data.pokemon.name}</h1>
    </div>
  );
}

