'use client';

import { useQuery, gql } from '@urql/next';

export interface PokemonProps {
  params: { slug: string };
}

const PokemonQuery = gql`
  query ($name: String!) {
    pokemon(name: $name) {
      id
      name
    }
  }
`;

export default function Page({ params: { slug } }: PokemonProps) {
  const [result] = useQuery({
    query: PokemonQuery,
    variables: { name: slug },
  });

  return (
    <div>
      <h1>{result.data && result.data.pokemon.name}</h1>
    </div>
  );
}
